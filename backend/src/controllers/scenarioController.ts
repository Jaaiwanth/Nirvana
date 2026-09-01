import { Request, Response } from 'express';
import { createRequire } from 'module';
import { resourceRepo } from '../db/resourceRepository.js';
import { geoService } from '../services/geoService.js';
import { osrmClient } from '../services/osrmClient.js';
import { aiPipeline } from '../ai/index.js';
import { sseHub } from '../services/sseHub.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { Incident, ScoredCandidate } from '../types/index.js';

const require = createRequire(import.meta.url);
const presetScenarios: any[] = require('../data/disaster_scenarios.json');

export function listScenarios(_req: Request, res: Response): void {
  res.json(presetScenarios);
}

export function getScenarioById(req: Request, res: Response): void {
  const scenario = presetScenarios.find((s) => s.id === req.params.id);
  if (!scenario) {
    res.status(404).json({ error: `Disaster scenario "${req.params.id}" not found.` });
    return;
  }
  res.json(scenario);
}

export async function triggerScenario(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const scenario = presetScenarios.find((s) => s.id === req.params.id);

  if (!scenario) {
    res.status(404).json({ error: `Disaster scenario "${req.params.id}" not found.` });
    return;
  }

  try {
    const incidentLocation = scenario.location;

    // Step 1: AI Incident Triage
    const triage = await aiPipeline.extractTriage(scenario.description);

    // Step 2: Fetch Available Fleet
    const availableTeams = await resourceRepo.getAvailableTeams();
    if (availableTeams.length === 0) {
      res.status(409).json({
        error: 'Critical fleet exhaustion: No emergency rescue units are currently available in the city.',
      });
      return;
    }

    // Step 3: Fast Spatial Radius Prune
    const rawCandidates = geoService.filterCandidateTeams(
      incidentLocation,
      availableTeams,
      triage.requiredCapabilities,
      30.0,
      5
    );

    // Step 4: Road Network Routing (OSRM)
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
    const incidentId = `inc_${scenario.id}_${Date.now().toString(36)}`;
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
      rawReport: scenario.description,
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
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      dispatchPlan,
      executionLatencyMs,
    });

    res.status(201).json({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      incidentId,
      executionLatencyMs,
      triage,
      dispatchPlan,
      incident,
    });
  } catch (err: any) {
    console.error('[Scenario Trigger Error]', err);
    res.status(500).json({ error: err.message });
  }
}
