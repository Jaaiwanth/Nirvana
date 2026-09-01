import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Compass } from 'lucide-react';
import { trackingApi } from '../api/trackingApi';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { TrackingSidebar } from './TrackingSidebar';
import { IncidentFeed } from './IncidentFeed';
import { MapCNView } from './MapCNView';
import { MissionBottomDrawer } from './MissionBottomDrawer';
import { IncidentIntakeModal } from './IncidentIntakeModal';
import type { Incident, EmergencyTeam } from '../../../types/api';

interface TrackingDashboardProps {
  initialIncidentId?: string | null;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({
  initialIncidentId,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(initialIncidentId || null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  // 1. Fetch Resources / Units
  const { data: teams = [] } = useQuery<EmergencyTeam[]>({
    queryKey: ['resources'],
    queryFn: trackingApi.getResources,
  });

  // 2. Fetch Incidents
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: trackingApi.getIncidents,
  });

  // Derive selected incident cleanly
  const selectedIncident =
    (activeIncidentId ? incidents.find((i) => i.id === activeIncidentId) : null) ||
    (initialIncidentId ? incidents.find((i) => i.id === initialIncidentId) : null) ||
    (incidents.length > 0 ? incidents[0] : null);

  // 3. Connect to Real-time SSE Telemetry Hub
  const { isConnected, latestTelemetry, agentTelemetryLogs } = useLiveTelemetry({
    onIncidentCreated: (newInc) => {
      queryClient.setQueryData<Incident[]>(['incidents'], (old = []) => [newInc, ...old]);
      setActiveIncidentId(newInc.id);
    },
    onTeamDispatched: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onIncidentResolved: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  // 4. Mutations: Simulation Step & Reset
  const tickMutation = useMutation({
    mutationFn: trackingApi.tickSimulation,
  });

  const resetMutation = useMutation({
    mutationFn: trackingApi.resetSimulation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setActiveIncidentId(null);
    },
  });

  // 5. Mutation: Create Custom Incidents (Text and Multimodal Media)
  const createIncidentMutation = useMutation({
    mutationFn: (data: { reportText: string; coordinates: { lat: number; lng: number } }) =>
      trackingApi.createIncident(data.reportText, data.coordinates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const createMediaMutation = useMutation({
    mutationFn: trackingApi.createMediaIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const activeTelemetryForSelected = selectedIncident?.dispatchPlan?.primaryTeam
    ? latestTelemetry[selectedIncident.dispatchPlan.primaryTeam.id]
    : undefined;

  return (
    <div className="flex h-screen w-full bg-[#090a0f] text-zinc-100 overflow-hidden select-none">
      {/* 1. Left Vertical Dock */}
      <TrackingSidebar
        activeCount={incidents.filter((i) => i.status === 'DISPATCHED').length}
      />

      {/* 2. Left Panel: Incident Feed List */}
      <IncidentFeed
        incidents={incidents}
        selectedIncidentId={selectedIncident?.id || null}
        onSelectIncident={(inc) => setActiveIncidentId(inc.id)}
        onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
      />

      {/* 3. Main Center Stage: Map + Bottom Drawer */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Minimal Info Bar */}
        <div className="h-10 px-4 bg-[#090a0f] border-b border-zinc-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
              EOC EMERGENCY DISPATCH CONSOLE (/dashboard)
            </span>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{isConnected ? 'SSE STREAM: ACTIVE' : 'CONNECTING...'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <button
              onClick={() => navigate('/track')}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer bg-sky-950/40 px-2.5 py-1 rounded"
              title="Open full OSRM Road Tracing view"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Open OSRM Tracing (/track)</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <span className="text-zinc-700">|</span>
            <span>FLEET: {teams.length} UNITS</span>
            <span className="text-zinc-700">·</span>
            <span>ACTIVE CALLS: {incidents.length}</span>
          </div>
        </div>

        {/* Center: MapCN (MapLibre GL) */}
        <div className="flex-1 relative overflow-hidden">
          <MapCNView
            incidents={incidents}
            teams={teams}
            selectedIncident={selectedIncident}
            latestTelemetry={latestTelemetry}
          />
        </div>

        {/* Bottom: Mission Drawer */}
        <MissionBottomDrawer
          selectedIncident={selectedIncident}
          activeTelemetry={activeTelemetryForSelected}
          agentTelemetryLogs={agentTelemetryLogs}
          onTickSimulation={() => tickMutation.mutate()}
          onResetSimulation={() => resetMutation.mutate()}
        />
      </main>

      {/* Multimodal Incident Intake Modal */}
      <IncidentIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSubmitText={async (text, coords) => {
          await createIncidentMutation.mutateAsync({ reportText: text, coordinates: coords });
        }}
        onSubmitMedia={async (payload) => {
          await createMediaMutation.mutateAsync(payload);
        }}
        isLoading={createIncidentMutation.isPending || createMediaMutation.isPending}
      />
    </div>
  );
};
