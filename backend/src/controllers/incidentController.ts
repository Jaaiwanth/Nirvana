import { Request, Response } from 'express';
import { z } from 'zod';
import { resourceRepo } from '../db/resourceRepository.js';
import { geoService } from '../services/geoService.js';
import { osrmClient } from '../services/osrmClient.js';
import { aiPipeline } from '../ai/index.js';
import { sseHub } from '../services/sseHub.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { Coordinates, Incident, ScoredCandidate } from '../types/index.js';

export const incidentInputSchema = z.object({
  reportText: z.string().min(3, 'Incident report must be at least 3 characters'),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export async function listIncidents(_req: Request, res: Response): Promise<void> {
  try {
    const incidents = await resourceRepo.listIncidents();
    res.json(incidents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getIncidentById(req: Request, res: Response): Promise<void> {
  try {
    const incident = await resourceRepo.getIncidentById(req.params.id);
    if (!incident) {
      res.status(404).json({ error: `Incident with ID "${req.params.id}" not found.` });
      return;
    }
    res.json(incident);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAndDispatchIncident(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  try {
    const parsed = incidentInputSchema.parse(req.body);

    const incidentLocation: Coordinates = parsed.coordinates || {
      lat: 12.9716,
      lng: 77.5946,
    };

    // Step 1: AI Incident Triage
    const triage = await aiPipeline.extractTriage(parsed.reportText);

    // Step 2: Query Available Rescue Fleet
    const availableTeams = await resourceRepo.getAvailableTeams();
    if (availableTeams.length === 0) {
      res.status(409).json({
        error: 'Critical fleet exhaustion: No emergency rescue units are currently available.',
      });
      return;
    }

    // Step 3: Fast Geospatial Pruning
    const rawCandidates = geoService.filterCandidateTeams(
      incidentLocation,
      availableTeams,
      triage.requiredCapabilities,
      30.0,
      5
    );

    // Step 4: Road Network Routing & Polylines (OSRM)
    const enrichedCandidates: ScoredCandidate[] = await Promise.all(
      rawCandidates.map(async (candidate) => {
        const route = await osrmClient.getDrivingRoute(
          candidate.team.currentLocation,
          incidentLocation
        );
        return {
          ...candidate,
          drivingDistanceKm: route.drivingDistanceKm,
          etaMinutes: route.durationMinutes,
          routeCoordinates: route.routeCoordinates,
        };
      })
    );

    // Step 5: Multi-Criteria Autonomous Decision Agent
    const dispatchPlan = await aiPipeline.evaluateDispatch(triage, enrichedCandidates);

    // Step 6: Commit State & Update Fleet Statuses
    const incidentId = `inc_${Date.now().toString(36)}`;
    const assignedIds = [
      dispatchPlan.primaryTeam.id,
      ...dispatchPlan.secondarySupport.map((s) => s.id),
    ];

    for (const teamId of assignedIds) {
      await resourceRepo.updateTeamStatus(teamId, 'DISPATCHED', incidentId);
    }

    // Register active routes for real-time telemetry simulation
    if (dispatchPlan.primaryTeam.routeCoordinates) {
      simulationEngine.registerMission(
        incidentId,
        dispatchPlan.primaryTeam.id,
        dispatchPlan.primaryTeam.routeCoordinates,
        dispatchPlan.primaryTeam.distanceKm
      );
    }

    for (const sec of dispatchPlan.secondarySupport) {
      if (sec.routeCoordinates) {
        simulationEngine.registerMission(
          incidentId,
          sec.id,
          sec.routeCoordinates,
          sec.distanceKm
        );
      }
    }

    const incident: Incident = {
      id: incidentId,
      rawReport: parsed.reportText,
      location: incidentLocation,
      triage,
      status: 'DISPATCHED',
      createdAt: new Date().toISOString(),
      assignedTeamIds: assignedIds,
    };

    await resourceRepo.createIncident(incident);

    const executionLatencyMs = Date.now() - startTime;

    // Step 7: Broadcast over SSE to connected dashboards
    sseHub.broadcast('incident:created', incident);
    sseHub.broadcast('team:dispatched', {
      incidentId,
      dispatchPlan,
      executionLatencyMs,
    });

    res.status(201).json({
      incidentId,
      executionLatencyMs,
      triage,
      dispatchPlan,
      incident,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error('[Incident Controller Error]', err);
    res.status(500).json({ error: err.message });
  }
}
