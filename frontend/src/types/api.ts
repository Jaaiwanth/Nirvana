export interface Coordinates {
  lat: number;
  lng: number;
}

export interface EmergencyTeam {
  id: string;
  callsign: string;
  vehicleType: string;
  capabilities: string[];
  baseStation: string;
  currentLocation: Coordinates;
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING' | 'MAINTENANCE';
  assignedIncidentId?: string;
}

export interface IncidentTriage {
  incidentType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  victimsCount: {
    estimated: number;
    trapped: boolean;
  };
  requiredCapabilities: string[];
  summary: string;
}

export interface CandidateUnit {
  id: string;
  callsign: string;
  vehicleType: string;
  distanceKm: number;
  etaMinutes: number;
  capabilityScore?: number;
  routeCoordinates?: Coordinates[];
}

export interface DispatchPlan {
  primaryTeam: CandidateUnit;
  secondarySupport: CandidateUnit[];
  reasoning: string;
  priority: string;
  isFallback: boolean;
  isExhaustionSubstitute?: boolean;
}

export interface Incident {
  id: string;
  rawReport: string;
  location: Coordinates;
  triage: IncidentTriage;
  status: 'REPORTED' | 'TRIAGED' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVED';
  createdAt: string;
  assignedTeamIds: string[];
  dispatchPlan?: DispatchPlan;
}

export interface ActiveMission {
  missionId: string;
  incidentId: string;
  teamId: string;
  currentStepIndex: number;
  totalSteps: number;
  initialDistanceKm: number;
  isComplete: boolean;
}

export interface AgentTelemetryRecord {
  id: string;
  incidentId: string;
  nodeName: string;
  phase: 'START' | 'COMPLETE' | 'BRANCH' | 'ERROR';
  durationMs?: number;
  timestamp: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface TelemetryUpdateEvent {
  teamId: string;
  incidentId: string;
  currentCoordinates: Coordinates;
  heading: number;
  speedKmh: number;
  etaMinutes: number;
  remainingDistanceKm: number;
  progressPercentage: number;
}

export interface PresetScenario {
  id: string;
  title: string;
  locationName: string;
  coordinates: Coordinates;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  expectedType: string;
  expectedPrimaryCapabilities: string[];
}
