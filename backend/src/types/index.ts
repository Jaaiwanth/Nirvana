export interface Coordinates {
  lat: number;
  lng: number;
}

export type TeamStatus = 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'MAINTENANCE';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentType = 
  | 'structural_collapse' 
  | 'fire' 
  | 'medical_trauma' 
  | 'flood' 
  | 'hazmat' 
  | 'traffic_collision'
  | 'other';

export interface RescueTeam {
  id: string;
  callsign: string;
  baseStationName: string;
  vehicleType: string;
  status: TeamStatus;
  capabilities: string[];
  equipmentList: string[];
  currentLocation: Coordinates;
  h3Index?: string;
  speedFactor: number;
  currentIncidentId?: string | null;
}

export interface IncidentTriage {
  incidentType: IncidentType;
  severity: SeverityLevel;
  requiredCapabilities: string[];
  estimatedVictims: number;
  trappedVictims: boolean;
  summary: string;
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

export interface ScoredCandidate {
  team: RescueTeam;
  haversineDistanceKm: number;
  drivingDistanceKm?: number;
  etaMinutes?: number;
  routePolyline?: string;
  routeCoordinates?: [number, number][];
  capabilityMatchCount: number;
  score?: number;
}

export interface DispatchedTeamInfo {
  id: string;
  callsign: string;
  vehicleType: string;
  distanceKm: number;
  etaMinutes: number;
  routePolyline?: string;
  routeCoordinates?: [number, number][];
}

export interface DispatchPlan {
  primaryTeam: DispatchedTeamInfo;
  secondarySupport: DispatchedTeamInfo[];
  reasoning: string;
  priority: SeverityLevel;
  isFallback: boolean;
  isExhaustionSubstitute?: boolean;
  exhaustionWarning?: string;
}

export interface TelemetryUpdate {
  teamId: string;
  incidentId: string;
  currentCoordinates: Coordinates;
  remainingDistanceKm: number;
  etaMinutes: number;
  status: TeamStatus;
}
