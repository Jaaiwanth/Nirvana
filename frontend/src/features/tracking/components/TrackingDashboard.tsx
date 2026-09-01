import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Compass, ListFilter } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { trackingApi } from '../api/trackingApi';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { TrackingSidebar } from './TrackingSidebar';
import { IncidentFeed } from './IncidentFeed';
import { MapCNView } from './MapCNView';
import { MissionBottomDrawer } from './MissionBottomDrawer';
import { IncidentIntakeModal } from './IncidentIntakeModal';
import { AuthStatusButton } from '../../auth/AuthStatusButton';
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
  const [isMobileFeedOpen, setIsMobileFeedOpen] = useState(false);

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
    onTelemetryUpdate: (data) => {
      if (data.status === 'ON_SCENE') {
        queryClient.setQueryData<Incident[]>(['incidents'], (old = []) =>
          old.map((inc) => (inc.id === data.incidentId ? { ...inc, status: 'ON_SCENE' } : inc))
        );
      }
    },
    onIncidentResolved: (resolvedIncidentId) => {
      queryClient.setQueryData<Incident[]>(['incidents'], (old = []) =>
        old.map((inc) => (inc.id === resolvedIncidentId ? { ...inc, status: 'RESOLVED' } : inc))
      );
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

  const primaryTeamId =
    selectedIncident?.dispatchPlan?.primaryTeam?.id ||
    selectedIncident?.assignedTeamIds?.[0];

  const activeTelemetryForSelected = primaryTeamId
    ? latestTelemetry[primaryTeamId]
    : undefined;

  return (
    <div className="flex h-screen w-full bg-[#090a0f] text-zinc-100 overflow-hidden select-none">
      {/* 1. Left Vertical Dock (Desktop) / Bottom Nav (Mobile) */}
      <TrackingSidebar
        activeCount={incidents.filter((i) => i.status === 'DISPATCHED' || i.status === 'ON_SCENE').length}
        onToggleFeed={() => setIsMobileFeedOpen(!isMobileFeedOpen)}
        isFeedOpen={isMobileFeedOpen}
      />

      {/* Mobile Backdrop for Incident Feed Drawer */}
      {isMobileFeedOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileFeedOpen(false)}
        />
      )}

      {/* 2. Left Panel: Incident Feed List (Responsive Slide-over on mobile) */}
      <div
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-300 md:translate-x-0 h-full',
          isMobileFeedOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        )}
      >
        <IncidentFeed
          incidents={incidents}
          selectedIncidentId={selectedIncident?.id || null}
          onSelectIncident={(inc) => {
            setActiveIncidentId(inc.id);
            setIsMobileFeedOpen(false);
          }}
          onOpenIntakeModal={() => {
            setIsMobileFeedOpen(false);
            setIsIntakeModalOpen(true);
          }}
          onCloseMobile={() => setIsMobileFeedOpen(false)}
        />
      </div>

      {/* 3. Main Center Stage: Map + Bottom Drawer */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Minimal Info Bar (Mobile Friendly) */}
        <div className="h-12 px-3 sm:px-6 bg-[#090a0f] border-b border-zinc-900/90 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Feed Toggle Button */}
            <button
              onClick={() => setIsMobileFeedOpen(true)}
              className="md:hidden px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-sky-400 hover:text-white flex items-center gap-1.5 text-xs font-mono font-semibold cursor-pointer shadow-sm"
              title="Open Incident Feed"
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Calls ({incidents.length})</span>
            </button>

            <span className="hidden sm:inline text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              EOC EMERGENCY DISPATCH CONSOLE (/dashboard)
            </span>
            <span className="sm:hidden text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              EOC CONSOLE
            </span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-zinc-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">{isConnected ? 'SSE STREAM: ACTIVE' : 'CONNECTING...'}</span>
              <span className="sm:hidden">{isConnected ? 'LIVE' : 'CONN...'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5 text-xs font-mono text-zinc-400">
            <button
              onClick={() => navigate('/track')}
              className="hidden md:flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 px-3 py-1.5 rounded-md"
              title="Open full OSRM Road Tracing view"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Open OSRM Tracing (/track)</span>
              <ExternalLink className="h-3 w-3" />
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-zinc-800">|</span>
              <span>FLEET: <strong className="text-zinc-200">{teams.length}</strong></span>
              <span className="text-zinc-700">·</span>
              <span>ACTIVE CALLS: <strong className="text-zinc-200">{incidents.length}</strong></span>
              <span className="text-zinc-800">|</span>
            </div>

            <AuthStatusButton />
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
