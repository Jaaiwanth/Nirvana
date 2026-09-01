import { GoogleGenerativeAI } from '@google/generative-ai';
import { IncidentTriage } from '../types/index.js';
import { incidentTriageSchema } from '../schemas/incidentSchema.js';
import { deterministicTriage } from '../agents/deterministicFallback.js';

export interface MultimodalInput {
  mediaBase64: string;
  mimeType: string;
  callerNote?: string;
}

export class MultimodalHandler {
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

  /**
   * Analyzes an emergency photo or 911 audio recording using Gemini 2.0 Flash,
   * extracting structured triage requirements.
   */
  async analyzeMedia(input: MultimodalInput): Promise<IncidentTriage> {
    const { mediaBase64, mimeType, callerNote } = input;

    try {
      const client = this.getClient();
      const modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const isAudio = mimeType.startsWith('audio/');
      const prompt = `You are NIRVANA's Multimodal Emergency Analysis Agent.
${
  isAudio
    ? 'You are listening to an emergency 911 distress call or voice message.'
    : 'You are inspecting a live emergency scene photograph or drone image.'
}
${callerNote ? `Accompanying Caller Notes: "${callerNote}"` : ''}

Extract and return ONLY a JSON object with this strict schema:
{
  "incidentType": "structural_collapse" | "fire" | "medical_trauma" | "flood" | "hazmat" | "traffic_collision" | "other",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "requiredCapabilities": string[],
  "estimatedVictims": number,
  "trappedVictims": boolean,
  "summary": string
}
Capabilities must be chosen from: ["heavy_rescue", "extrication_tools", "structural_shoring", "search_dogs", "als_medical", "bls_medical", "fire_suppression", "foam_fire_suppression", "hazmat_containment", "fast_water_rescue", "flood_evacuation", "aerial_reconnaissance"].`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: mediaBase64,
            mimeType,
          },
        },
      ]);

      const text = result.response.text();
      const parsed = JSON.parse(text);
      const validation = incidentTriageSchema.safeParse(parsed);

      if (validation.success) {
        return validation.data as IncidentTriage;
      }
    } catch (err: any) {
      console.warn(`[MultimodalHandler] Gemini multimodal analysis unavailable: ${err.message}. Falling back to text note / deterministic parser.`);
    }

    // Fallback if Gemini key is missing or media parsing failed
    const fallbackNote = callerNote || (mimeType.startsWith('audio/') ? 'Emergency 911 audio distress recording' : 'Emergency scene image capture');
    const triage = deterministicTriage(fallbackNote);
    triage.summary = `[Multimodal Fallback] Analyzed ${mimeType}: ${triage.summary}`;
    return triage;
  }
}

export const multimodalHandler = new MultimodalHandler();
