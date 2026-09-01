import { aiPipeline } from '../ai/index.js';
import { IncidentTriage } from '../types/index.js';

export class IncidentExtractorAgent {
  /**
   * Analyzes an emergency text report and extracts structured triage parameters.
   */
  async extract(reportText: string): Promise<IncidentTriage> {
    if (!reportText || reportText.trim().length < 3) {
      throw new Error('Report text must be at least 3 characters long for triage analysis.');
    }

    return await aiPipeline.extractTriage(reportText.trim());
  }
}

export const incidentExtractor = new IncidentExtractorAgent();
