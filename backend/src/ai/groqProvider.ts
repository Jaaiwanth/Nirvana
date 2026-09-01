import Groq from 'groq-sdk';
import { IAIProvider } from './aiProvider.interface.js';
import { IncidentTriage, ScoredCandidate, DispatchPlan, DispatchedTeamInfo } from '../types/index.js';
import { incidentTriageSchema } from '../schemas/incidentSchema.js';
import { agentDecisionSchema } from '../schemas/decisionSchema.js';

export class GroqProvider implements IAIProvider {
  public name = 'Groq (Llama-3.3-70b-versatile)';
  private groq: Groq | null = null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== 'gsk_your_groq_api_key_here') {
      this.groq = new Groq({ apiKey });
    }
  }

  async extractIncidentTriage(reportText: string): Promise<IncidentTriage> {
    if (!this.groq) {
      throw new Error('Groq API Key not configured.');
    }

    const systemPrompt = `You are NIRVANA's Incident Extraction Agent. You analyze 911 reports and return ONLY a JSON object with this schema:
{
  "incidentType": "structural_collapse" | "fire" | "medical_trauma" | "flood" | "hazmat" | "traffic_collision" | "other",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "requiredCapabilities": string[],
  "estimatedVictims": number,
  "trappedVictims": boolean,
  "summary": string
}
Capabilities must be chosen from: ["heavy_rescue", "extrication_tools", "structural_shoring", "search_dogs", "als_medical", "bls_medical", "fire_suppression", "foam_fire_suppression", "hazmat_containment", "fast_water_rescue", "flood_evacuation", "aerial_reconnaissance"].`;

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Incident Report: "${reportText}"` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    const parsedJson = JSON.parse(content);
    const validation = incidentTriageSchema.safeParse(parsedJson);

    if (!validation.success) {
      throw new Error(`Groq structured extraction failed Zod validation: ${JSON.stringify(validation.error.format())}`);
    }

    return validation.data as IncidentTriage;
  }

  async evaluateDispatch(triage: IncidentTriage, candidates: ScoredCandidate[]): Promise<DispatchPlan> {
    if (!this.groq) {
      throw new Error('Groq API Key not configured.');
    }

    const systemPrompt = `You are NIRVANA's Multi-Criteria Dispatch Decision Agent. 
Evaluate candidate teams and select the optimal primary rescue team and optional secondary ambulance/support.
Return ONLY a JSON object with this schema:
{
  "primaryTeamId": string,
  "secondaryTeamIds": string[],
  "reasoning": string,
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}`;

    const candidatesSummary = candidates.map((c) => ({
      id: c.team.id,
      callsign: c.team.callsign,
      vehicleType: c.team.vehicleType,
      capabilities: c.team.capabilities,
      distanceKm: c.drivingDistanceKm ?? c.haversineDistanceKm,
      etaMinutes: c.etaMinutes,
      capabilityMatchCount: c.capabilityMatchCount,
    }));

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Incident: ${JSON.stringify(triage)}\nCandidate Units: ${JSON.stringify(candidatesSummary)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    const parsedJson = JSON.parse(content);
    const validation = agentDecisionSchema.safeParse(parsedJson);

    if (!validation.success) {
      throw new Error(`Groq dispatch decision failed Zod validation: ${JSON.stringify(validation.error.format())}`);
    }

    const result = validation.data;

    const primaryCandidate = candidates.find((c) => c.team.id === result.primaryTeamId) || candidates[0];
    const primaryTeam: DispatchedTeamInfo = {
      id: primaryCandidate.team.id,
      callsign: primaryCandidate.team.callsign,
      vehicleType: primaryCandidate.team.vehicleType,
      distanceKm: primaryCandidate.drivingDistanceKm ?? primaryCandidate.haversineDistanceKm,
      etaMinutes: primaryCandidate.etaMinutes ?? 10,
      routeCoordinates: primaryCandidate.routeCoordinates,
    };

    const secondarySupport: DispatchedTeamInfo[] = [];
    if (Array.isArray(result.secondaryTeamIds)) {
      for (const id of result.secondaryTeamIds) {
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
      reasoning: result.reasoning,
      priority: triage.severity,
      isFallback: false,
    };
  }
}
