import { aiPipeline } from '../ai/index.js';
import { resourceRepo } from '../db/resourceRepository.js';
import { IncidentTriage, ScoredCandidate, DispatchPlan } from '../types/index.js';

export class DecisionAgent {
  /**
   * Evaluates candidate response units against incident requirements,
   * calculates multi-criteria optimization weights, and determines the final dispatch plan.
   */
  async evaluate(
    triage: IncidentTriage,
    candidates: ScoredCandidate[]
  ): Promise<DispatchPlan> {
    let evalCandidates = candidates && candidates.length > 0 ? candidates : [];

    // Fallback: If no candidates were provided, pull active municipal units
    if (evalCandidates.length === 0) {
      const allTeams = await resourceRepo.getAllTeams();
      evalCandidates = allTeams.slice(0, 3).map((team) => ({
        team,
        haversineDistanceKm: 4.0,
        drivingDistanceKm: 4.8,
        etaMinutes: 6.5,
        capabilityMatchCount: 1,
      }));
    }

    // Mathematical multi-criteria scoring pass
    for (const candidate of evalCandidates) {
      const capabilityWeight = 0.5;
      const etaWeight = 0.35;
      const speedWeight = 0.15;

      const totalRequired = triage.requiredCapabilities.length || 1;
      const capabilityFraction = candidate.capabilityMatchCount / totalRequired;

      const etaMin = candidate.etaMinutes ?? 15.0;
      const etaScore = Math.max(0, 1 - etaMin / 45.0); // 0 at 45 min, 1 at 0 min

      const speedScore = Math.min(1.5, candidate.team.speedFactor);

      candidate.score = parseFloat(
        (
          capabilityFraction * capabilityWeight +
          etaScore * etaWeight +
          speedScore * speedWeight
        ).toFixed(3)
      );
    }

    // Sort by weighted composite score descending
    evalCandidates.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // Execute through the AI pipeline (Groq / Gemini / Deterministic)
    return await aiPipeline.evaluateDispatch(triage, evalCandidates);
  }
}

export const decisionAgent = new DecisionAgent();
