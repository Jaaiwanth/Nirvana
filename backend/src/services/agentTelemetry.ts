import { sseHub } from './sseHub.js';

export interface AgentTelemetryRecord {
  id: string;
  incidentId: string;
  nodeName: string;
  phase: 'START' | 'COMPLETE' | 'BRANCH' | 'ERROR';
  durationMs?: number;
  timestamp: string;
  summary: string;
  details?: any;
}

export class AgentTelemetryService {
  private history: AgentTelemetryRecord[] = [];
  private readonly maxHistory = 100;

  /**
   * Records an agent node event, stores in telemetry buffer, and broadcasts over SSE.
   */
  emit(event: Omit<AgentTelemetryRecord, 'id' | 'timestamp'>): AgentTelemetryRecord {
    const record: AgentTelemetryRecord = {
      id: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.history.push(record);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Broadcast live over Server-Sent Events to dashboards
    sseHub.broadcast('agent:telemetry', record);

    return record;
  }

  /**
   * Retrieves all buffered agent telemetry records (optionally filtered by incidentId).
   */
  getHistory(incidentId?: string): AgentTelemetryRecord[] {
    if (incidentId) {
      return this.history.filter((h) => h.incidentId === incidentId);
    }
    return [...this.history];
  }

  /**
   * Clears telemetry history (for test and scenario resets).
   */
  clear(): void {
    this.history = [];
  }
}

export const agentTelemetry = new AgentTelemetryService();
