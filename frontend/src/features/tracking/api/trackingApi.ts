import { apiClient } from '../../../lib/apiClient';
import type {
  EmergencyTeam,
  Incident,
  ActiveMission,
  AgentTelemetryRecord,
  PresetScenario,
} from '../../../types/api';

export const trackingApi = {
  async getResources(): Promise<EmergencyTeam[]> {
    return apiClient.get('api/resources').json<EmergencyTeam[]>();
  },

  async getIncidents(): Promise<Incident[]> {
    return apiClient.get('api/incidents').json<Incident[]>();
  },

  async getActiveMissions(): Promise<ActiveMission[]> {
    return apiClient.get('api/simulate/missions').json<ActiveMission[]>();
  },

  async getScenarios(): Promise<{ total: number; scenarios: PresetScenario[] }> {
    return apiClient.get('api/scenarios').json();
  },

  async getAgentTelemetry(incidentId?: string): Promise<{ totalRecords: number; telemetry: AgentTelemetryRecord[] }> {
    const searchParams = incidentId ? { incidentId } : undefined;
    return apiClient.get('api/events/telemetry', { searchParams }).json();
  },

  async triggerScenario(scenarioId: string): Promise<{ message: string; incidentId: string }> {
    return apiClient.post(`api/scenarios/${scenarioId}/trigger`).json();
  },

  async createIncident(reportText: string, coordinates: { lat: number; lng: number }): Promise<{ message: string; incidentId: string }> {
    return apiClient.post('api/incidents', {
      json: { reportText, coordinates },
    }).json();
  },

  async resetSimulation(): Promise<{ message: string }> {
    return apiClient.post('api/simulate/reset').json();
  },

  async tickSimulation(): Promise<{ tickTime: string; activeMissions: number }> {
    return apiClient.post('api/simulate/tick').json();
  },
};
