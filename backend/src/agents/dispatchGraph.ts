import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { incidentExtractor } from './incidentExtractor.js';
import { decisionAgent } from './decisionAgent.js';
import { multimodalHandler } from '../ai/multimodalHandler.js';
import { resourceRepo } from '../db/resourceRepository.js';
import { geoService } from '../services/geoService.js';
import { osrmClient } from '../services/osrmClient.js';
import { sseHub } from '../services/sseHub.js';
import { simulationEngine } from '../services/simulationEngine.js';
import { Coordinates, Incident, IncidentTriage, ScoredCandidate, DispatchPlan } from '../types/index.js';

export interface EmergencyMediaInput {
  mediaBase64: string;
  mimeType: string;
  callerNote?: string;
}

/**
 * LangGraph State Definition for NIRVANA Emergency Dispatch
 */
export const EmergencyDispatchAnnotation = Annotation.Root({
  incidentId: Annotation<string>(),
  rawReport: Annotation<string>(),
  coordinates: Annotation<Coordinates>(),
  mediaInput: Annotation<EmergencyMediaInput | undefined>(),
  triage: Annotation<IncidentTriage | undefined>(),
  candidates: Annotation<ScoredCandidate[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  enrichedCandidates: Annotation<ScoredCandidate[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  dispatchPlan: Annotation<DispatchPlan | undefined>(),
  assignedTeamIds: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  isExhaustionSubstitute: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),
  executionLogs: Annotation<string[]>({
    reducer: (curr, next) => curr.concat(next),
    default: () => [],
  }),
  status: Annotation<'IN_PROGRESS' | 'DISPATCHED' | 'FAILED'>({
    reducer: (_, next) => next,
    default: () => 'IN_PROGRESS',
  }),
});

export type EmergencyDispatchStateType = typeof EmergencyDispatchAnnotation.State;

// ==========================================
// 1. Triage Node (Text / Multimodal Ingestion)
// ==========================================
async function triageNode(state: EmergencyDispatchStateType): Promise<Partial<EmergencyDispatchStateType>> {
  let triage: IncidentTriage;

  if (state.mediaInput) {
    triage = await multimodalHandler.analyzeMedia({
      mediaBase64: state.mediaInput.mediaBase64,
      mimeType: state.mediaInput.mimeType,
      callerNote: state.mediaInput.callerNote,
    });
  } else {
    triage = await incidentExtractor.extract(state.rawReport);
  }

  return {
    triage,
    executionLogs: [
      `[TriageNode] Extracted ${triage.severity} ${triage.incidentType} (${triage.requiredCapabilities.join(', ')})`,
    ],
  };
}

// ==========================================
// 2. Spatial Pruning Node (Haversine & H3 Radius)
// ==========================================
async function spatialPruningNode(state: EmergencyDispatchStateType): Promise<Partial<EmergencyDispatchStateType>> {
  const availableTeams = await resourceRepo.getAvailableTeams();
  if (availableTeams.length === 0) {
    throw new Error('Critical fleet exhaustion: Zero emergency rescue units currently available.');
  }

  const requiredCaps = state.triage?.requiredCapabilities || [];
  const candidates = geoService.filterCandidateTeams(
    state.coordinates,
    availableTeams,
    requiredCaps,
    35.0,
    6
  );

  return {
    candidates,
    executionLogs: [
      `[SpatialPruningNode] Screened ${availableTeams.length} fleet units -> Pruned to top ${candidates.length} candidate units`,
    ],
  };
}

// ==========================================
// 3. OSRM Road Routing Node
// ==========================================
async function osrmRoutingNode(state: EmergencyDispatchStateType): Promise<Partial<EmergencyDispatchStateType>> {
  const enrichedCandidates: ScoredCandidate[] = await Promise.all(
    state.candidates.map(async (candidate) => {
      const route = await osrmClient.getDrivingRoute(
        candidate.team.currentLocation,
        state.coordinates
      );
      return {
        ...candidate,
        drivingDistanceKm: route.drivingDistanceKm,
        etaMinutes: route.durationMinutes,
        routeCoordinates: route.routeCoordinates,
      };
    })
  );

  return {
    enrichedCandidates,
    executionLogs: [
      `[OsrmRoutingNode] Calculated real road graph routes and polylines for ${enrichedCandidates.length} units`,
    ],
  };
}

// ==========================================
// 4. Decision Node (Multi-Criteria Scoring)
// ==========================================
async function decisionNode(state: EmergencyDispatchStateType): Promise<Partial<EmergencyDispatchStateType>> {
  if (!state.triage) throw new Error('Cannot evaluate decision without triage state');

  const dispatchPlan = await decisionAgent.evaluate(state.triage, state.enrichedCandidates);
  const isExhaustionSubstitute = !!dispatchPlan.isExhaustionSubstitute;

  return {
    dispatchPlan,
    isExhaustionSubstitute,
    assignedTeamIds: [
      dispatchPlan.primaryTeam.id,
      ...dispatchPlan.secondarySupport.map((s) => s.id),
    ],
    executionLogs: [
      `[DecisionNode] Selected Primary: ${dispatchPlan.primaryTeam.callsign} (${dispatchPlan.primaryTeam.vehicleType}, ETA: ${dispatchPlan.primaryTeam.etaMinutes}m)`,
    ],
  };
}

// ==========================================
// 5. Replanning Node (Contingency Branch)
// ==========================================
async function replanningNode(state: EmergencyDispatchStateType): Promise<Partial<EmergencyDispatchStateType>> {
  return {
    executionLogs: [
      `[ReplanningNode] ⚠️ FLEET EXHAUSTION PROTOCOL: All specialized units deployed. Dispatched emergency cross-trained substitute (${state.dispatchPlan?.primaryTeam.callsign}).`,
    ],
  };
}

// ==========================================
// 6. Commit & Telemetry Node (State & SSE)
// ==========================================
async function commitAndTelemetryNode(state: EmergencyDispatchStateType): Promise<Partial<EmergencyDispatchStateType>> {
  if (!state.dispatchPlan || !state.triage) {
    throw new Error('Incomplete dispatch plan or triage at commit phase');
  }

  const { dispatchPlan, triage, incidentId, assignedTeamIds, coordinates } = state;

  // Update resource states in repository
  for (const teamId of assignedTeamIds) {
    await resourceRepo.updateTeamStatus(teamId, 'DISPATCHED', incidentId);
  }

  // Register active mission in simulation telemetry engine
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
    rawReport: state.rawReport,
    location: coordinates,
    triage,
    status: 'DISPATCHED',
    createdAt: new Date().toISOString(),
    assignedTeamIds,
  };

  await resourceRepo.createIncident(incident);

  // Broadcast real-time events over Server-Sent Events
  sseHub.broadcast('incident:created', incident);
  sseHub.broadcast('team:dispatched', {
    incidentId,
    dispatchPlan,
    graphLogs: state.executionLogs,
  });

  return {
    status: 'DISPATCHED',
    executionLogs: [
      `[CommitAndTelemetryNode] Incident ${incidentId} registered. Live telemetry streaming on /api/events.`,
    ],
  };
}

// ==========================================
// Conditional Edge Router
// ==========================================
function routeAfterDecision(state: EmergencyDispatchStateType): 'replanningNode' | 'commitAndTelemetryNode' {
  if (state.isExhaustionSubstitute) {
    return 'replanningNode';
  }
  return 'commitAndTelemetryNode';
}

// ==========================================
// Build & Compile LangGraph StateGraph
// ==========================================
export function createEmergencyDispatchGraph() {
  const workflow = new StateGraph(EmergencyDispatchAnnotation)
    .addNode('triageNode', triageNode)
    .addNode('spatialPruningNode', spatialPruningNode)
    .addNode('osrmRoutingNode', osrmRoutingNode)
    .addNode('decisionNode', decisionNode)
    .addNode('replanningNode', replanningNode)
    .addNode('commitAndTelemetryNode', commitAndTelemetryNode)
    // Pipeline Flow
    .addEdge(START, 'triageNode')
    .addEdge('triageNode', 'spatialPruningNode')
    .addEdge('spatialPruningNode', 'osrmRoutingNode')
    .addEdge('osrmRoutingNode', 'decisionNode')
    // Conditional Branching
    .addConditionalEdges('decisionNode', routeAfterDecision, {
      replanningNode: 'replanningNode',
      commitAndTelemetryNode: 'commitAndTelemetryNode',
    })
    .addEdge('replanningNode', 'commitAndTelemetryNode')
    .addEdge('commitAndTelemetryNode', END);

  return workflow.compile();
}

export const compiledEmergencyGraph = createEmergencyDispatchGraph();

/**
 * Runner function invoked by controllers to execute the LangGraph workflow.
 */
export async function runEmergencyDispatchGraph(params: {
  rawReport: string;
  coordinates: Coordinates;
  mediaInput?: EmergencyMediaInput;
}): Promise<EmergencyDispatchStateType> {
  const incidentId = `inc_${Date.now().toString(36)}`;

  const initialState = {
    incidentId,
    rawReport: params.rawReport,
    coordinates: params.coordinates,
    mediaInput: params.mediaInput,
    candidates: [],
    enrichedCandidates: [],
    assignedTeamIds: [],
    isExhaustionSubstitute: false,
    executionLogs: [`[GraphEngine] Initialized LangGraph StateGraph workflow for incident ${incidentId}`],
    status: 'IN_PROGRESS' as const,
  };

  const finalState = await compiledEmergencyGraph.invoke(initialState);
  return finalState;
}
