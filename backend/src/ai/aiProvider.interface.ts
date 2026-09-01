import { IncidentTriage, ScoredCandidate, DispatchPlan } from '../types/index.js';

export interface IAIProvider {
  name: string;
  extractIncidentTriage(reportText: string): Promise<IncidentTriage>;
  evaluateDispatch(triage: IncidentTriage, candidates: ScoredCandidate[]): Promise<DispatchPlan>;
}
