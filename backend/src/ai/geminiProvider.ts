import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider } from './aiProvider.interface.js';
import { IncidentTriage, ScoredCandidate, DispatchPlan, DispatchedTeamInfo } from '../types/index.js';
import { incidentTriageSchema } from '../schemas/incidentSchema.js';
import { agentDecisionSchema } from '../schemas/decisionSchema.js';

export class GeminiProvider implements IAIProvider {
  public name = 'Google Gemini (gemini-3-flash-preview)';
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (this.genAI) return this.genAI;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'AIzaSy_your_gemini_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      return this.genAI;
    }
    throw new Error('Gemini API Key not configured in environment (GEMINI_API_KEY).');
  }

  async extractIncidentTriage(reportText: string): Promise<IncidentTriage> {
    const client = this.getClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are NIRVANA's Incident Extraction Agent. You analyze 911 reports and return ONLY a JSON object with this schema:
{
  "incidentType": "structural_collapse" | "fire" | "medical_trauma" | "flood" | "hazmat" | "traffic_collision" | "other",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "requiredCapabilities": string[],
  "estimatedVictims": number,
  "trappedVictims": boolean,
  "summary": string
}
Capabilities must be chosen from: ["heavy_rescue", "extrication_tools", "structural_shoring", "search_dogs", "als_medical", "bls_medical", "fire_suppression", "foam_fire_suppression", "hazmat_containment", "fast_water_rescue", "flood_evacuation", "aerial_reconnaissance"].
Report: "${reportText}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedJson = JSON.parse(text);

    const validation = incidentTriageSchema.safeParse(parsedJson);
    if (!validation.success) {
      throw new Error(`Gemini structured extraction failed Zod validation: ${JSON.stringify(validation.error.format())}`);
    }

    return validation.data as IncidentTriage;
  }

  async evaluateDispatch(triage: IncidentTriage, candidates: ScoredCandidate[]): Promise<DispatchPlan> {
    const client = this.getClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const candidatesSummary = candidates.map((c) => ({
      id: c.team.id,
      callsign: c.team.callsign,
      vehicleType: c.team.vehicleType,
      capabilities: c.team.capabilities,
      distanceKm: c.drivingDistanceKm ?? c.haversineDistanceKm,
      etaMinutes: c.etaMinutes,
      capabilityMatchCount: c.capabilityMatchCount,
    }));

    const prompt = `You are NIRVANA's Multi-Criteria Dispatch Decision Agent. 
Evaluate candidate teams and select the optimal primary rescue team and optional secondary ambulance/support.
Return ONLY a JSON object with this schema:
{
  "primaryTeamId": string,
  "secondaryTeamIds": string[],
  "reasoning": string,
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}
Incident: ${JSON.stringify(triage)}
Candidate Units: ${JSON.stringify(candidatesSummary)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedJson = JSON.parse(text);

    const validation = agentDecisionSchema.safeParse(parsedJson);
    if (!validation.success) {
      throw new Error(`Gemini dispatch decision failed Zod validation: ${JSON.stringify(validation.error.format())}`);
    }

    const parsed = validation.data;

    const primaryCandidate = candidates.find((c) => c.team.id === parsed.primaryTeamId) || candidates[0];
    const primaryTeam: DispatchedTeamInfo = {
      id: primaryCandidate.team.id,
      callsign: primaryCandidate.team.callsign,
      vehicleType: primaryCandidate.team.vehicleType,
      distanceKm: primaryCandidate.drivingDistanceKm ?? primaryCandidate.haversineDistanceKm,
      etaMinutes: primaryCandidate.etaMinutes ?? 10,
      routeCoordinates: primaryCandidate.routeCoordinates,
    };

    const secondarySupport: DispatchedTeamInfo[] = [];
    if (Array.isArray(parsed.secondaryTeamIds)) {
      for (const id of parsed.secondaryTeamIds) {
        const match = candidates.find((c) => c.team.id === id);
        if (match && match.team.id !== primaryTeam.id) {
          secondarySupport.push({
            id: match.team.id,
            callsign: match.team.callsign,
            vehicleType: match.team.vehicleType,
            distanceKm: match.drivingDistanceKm ?? match.haversineDistanceKm,
            etaMinutes: match.etaMinutes ?? 12,
            routeCoordinates: match.routeCoordinates,
          });
        }
      }
    }

    return {
      primaryTeam,
      secondarySupport,
      reasoning: parsed.reasoning,
      priority: triage.severity,
      isFallback: false,
    };
  }
}
