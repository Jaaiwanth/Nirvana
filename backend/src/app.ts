import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { resourceRepo } from './db/resourceRepository.js';
import { geoService } from './services/geoService.js';
import { osrmClient } from './services/osrmClient.js';
import { aiPipeline } from './ai/index.js';
import { sseHub } from './services/sseHub.js';
import { Coordinates, Incident, ScoredCandidate } from './types/index.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'NIRVANA Emergency Coordinator',
    timestamp: new Date().toISOString(),
  });
});

// SSE Event Stream Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  sseHub.registerClient(res);
});

// Get all fleet resources
app.get('/api/resources', async (_req: Request, res: Response) => {
  try {
    const teams = await resourceRepo.getAllTeams();
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List all recorded incidents
app.get('/api/incidents', async (_req: Request, res: Response) => {
  try {
    const incidents = await resourceRepo.listIncidents();
    res.json(incidents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Schema for incident intake
const incidentInputSchema = z.object({
  reportText: z.string().min(3, 'Incident report must be at least 3 characters'),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

// Core Autonomous Dispatch Pipeline
app.post('/api/incidents', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const parsed = incidentInputSchema.parse(req.body);

    // Default to city center coordinates if not specified
    const incidentLocation: Coordinates = parsed.coordinates || {
      lat: 12.9716,
      lng: 77.5946,
    };

    // Step 1: AI Incident Triage Extraction
    const triage = await aiPipeline.extractTriage(parsed.reportText);

    // Step 2: Fetch available rescue fleet
    const availableTeams = await resourceRepo.getAvailableTeams();

    if (availableTeams.length === 0) {
      return res.status(409).json({
        error: 'Critical fleet exhaustion: No emergency rescue units are currently available.',
      });
    }

    // Step 3: Fast Geospatial Pruning (Haversine & capability filtering)
    const rawCandidates = geoService.filterCandidateTeams(
      incidentLocation,
      availableTeams,
      triage.requiredCapabilities,
      30.0,
      5
    );

    // Step 4: Road Network Routing & Route Polylines (OSRM)
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

    // Step 5: Multi-Criteria Autonomous Dispatch Decision
    const dispatchPlan = await aiPipeline.evaluateDispatch(triage, enrichedCandidates);

    // Step 6: Commit state & update fleet statuses
    const incidentId = `inc_${Date.now().toString(36)}`;
    const assignedIds = [
      dispatchPlan.primaryTeam.id,
      ...dispatchPlan.secondarySupport.map((s) => s.id),
    ];

    for (const teamId of assignedIds) {
      await resourceRepo.updateTeamStatus(teamId, 'DISPATCHED', incidentId);
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

    // Step 7: Broadcast via SSE to connected dashboards
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
      return res.status(400).json({ error: err.errors });
    }
    console.error('[API Incident Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Simulation Reset Endpoint
app.post('/api/simulate/reset', async (_req: Request, res: Response) => {
  try {
    await resourceRepo.resetToSeed();
    sseHub.broadcast('simulation:reset', { message: 'All fleet units reset to base stations.' });
    res.json({ message: 'Fleet and incidents successfully reset to initial seed data.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
