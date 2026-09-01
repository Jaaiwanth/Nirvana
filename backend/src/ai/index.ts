import { IAIProvider } from './aiProvider.interface.js';
import { GroqProvider } from './groqProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { deterministicTriage, deterministicDispatch } from '../agents/deterministicFallback.js';
import { IncidentTriage, ScoredCandidate, DispatchPlan } from '../types/index.js';

export class DispatchAgentPipeline {
  private primaryProvider: IAIProvider;
  private secondaryProvider: IAIProvider;

  constructor() {
    const preferred = process.env.AI_PROVIDER || 'groq';
    if (preferred === 'gemini') {
      this.primaryProvider = new GeminiProvider();
      this.secondaryProvider = new GroqProvider();
    } else {
      this.primaryProvider = new GroqProvider();
      this.secondaryProvider = new GeminiProvider();
    }
  }

  async extractTriage(reportText: string): Promise<IncidentTriage> {
    try {
      return await this.primaryProvider.extractIncidentTriage(reportText);
    } catch (err: any) {
      console.warn(`[AI Pipeline] Primary AI (${this.primaryProvider.name}) failed: ${err.message}. Trying secondary...`);
      try {
        return await this.secondaryProvider.extractIncidentTriage(reportText);
      } catch (err2: any) {
        console.warn(`[AI Pipeline] Secondary AI (${this.secondaryProvider.name}) failed: ${err2.message}. Activating deterministic rule engine.`);
        return deterministicTriage(reportText);
      }
    }
  }

  async evaluateDispatch(triage: IncidentTriage, candidates: ScoredCandidate[]): Promise<DispatchPlan> {
    try {
      return await this.primaryProvider.evaluateDispatch(triage, candidates);
    } catch (err: any) {
      console.warn(`[AI Pipeline] Primary AI (${this.primaryProvider.name}) failed: ${err.message}. Trying secondary...`);
      try {
        return await this.secondaryProvider.evaluateDispatch(triage, candidates);
      } catch (err2: any) {
        console.warn(`[AI Pipeline] Secondary AI (${this.secondaryProvider.name}) failed: ${err2.message}. Activating deterministic rule engine.`);
        return deterministicDispatch(triage, candidates);
      }
    }
  }
}

export const aiPipeline = new DispatchAgentPipeline();
