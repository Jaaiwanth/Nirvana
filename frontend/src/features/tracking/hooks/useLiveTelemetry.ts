import { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../../../lib/apiClient';
import type {
  Incident,
  TelemetryUpdateEvent,
  AgentTelemetryRecord,
  DispatchPlan,
} from '../../../types/api';

interface UseLiveTelemetryProps {
  onIncidentCreated?: (incident: Incident) => void;
  onTeamDispatched?: (data: { incidentId: string; dispatchPlan: DispatchPlan }) => void;
  onTelemetryUpdate?: (data: TelemetryUpdateEvent) => void;
  onAgentTelemetry?: (data: AgentTelemetryRecord) => void;
  onIncidentResolved?: (incidentId: string) => void;
}

export function useLiveTelemetry({
  onIncidentCreated,
  onTeamDispatched,
  onTelemetryUpdate,
  onAgentTelemetry,
  onIncidentResolved,
}: UseLiveTelemetryProps = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, TelemetryUpdateEvent>>({});
  const [agentTelemetryLogs, setAgentTelemetryLogs] = useState<AgentTelemetryRecord[]>([]);

  // Refs to hold latest callbacks without forcing re-renders of the EventSource connection
  const callbacksRef = useRef({
    onIncidentCreated,
    onTeamDispatched,
    onTelemetryUpdate,
    onAgentTelemetry,
    onIncidentResolved,
  });

  useEffect(() => {
    callbacksRef.current = {
      onIncidentCreated,
      onTeamDispatched,
      onTelemetryUpdate,
      onAgentTelemetry,
      onIncidentResolved,
    };
  });

  useEffect(() => {
    const sseUrl = `${API_BASE_URL}/api/events`;
    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource(sseUrl);

        eventSource.addEventListener('connected', () => {
          setIsConnected(true);
        });

        eventSource.addEventListener('agent:telemetry', (e: MessageEvent) => {
          try {
            const data: AgentTelemetryRecord = JSON.parse(e.data);
            setAgentTelemetryLogs((prev) => [data, ...prev.slice(0, 49)]);
            callbacksRef.current.onAgentTelemetry?.(data);
          } catch (err) {
            console.error('Failed to parse agent:telemetry SSE event:', err);
          }
        });

        eventSource.addEventListener('telemetry:update', (e: MessageEvent) => {
          try {
            const data: TelemetryUpdateEvent = JSON.parse(e.data);
            setLatestTelemetry((prev) => ({
              ...prev,
              [data.teamId]: data,
            }));
            callbacksRef.current.onTelemetryUpdate?.(data);
          } catch (err) {
            console.error('Failed to parse telemetry:update SSE event:', err);
          }
        });

        eventSource.addEventListener('incident:created', (e: MessageEvent) => {
          try {
            const data: Incident = JSON.parse(e.data);
            callbacksRef.current.onIncidentCreated?.(data);
          } catch (err) {
            console.error('Failed to parse incident:created SSE event:', err);
          }
        });

        eventSource.addEventListener('team:dispatched', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            callbacksRef.current.onTeamDispatched?.(data);
          } catch (err) {
            console.error('Failed to parse team:dispatched SSE event:', err);
          }
        });

        eventSource.addEventListener('incident:resolved', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.teamId) {
              setLatestTelemetry((prev) => {
                const updated = { ...prev };
                delete updated[data.teamId];
                return updated;
              });
            }
            callbacksRef.current.onIncidentResolved?.(data.incidentId);
          } catch (err) {
            console.error('Failed to parse incident:resolved SSE event:', err);
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          retryTimeout = setTimeout(connect, 3000);
        };
      } catch {
        setIsConnected(false);
        retryTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  return {
    isConnected,
    latestTelemetry,
    agentTelemetryLogs,
  };
}
