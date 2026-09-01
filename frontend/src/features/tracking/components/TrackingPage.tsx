import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Navigation,
  Compass,
  Zap,
  Play,
  RotateCcw,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { trackingApi } from '../api/trackingApi';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { TrackingSidebar } from './TrackingSidebar';
import { MapCNView } from './MapCNView';
import { StatusPill } from '../../../components/ui/status-pill';
import { Button } from '../../../components/ui/button';
import { IncidentIntakeModal } from './IncidentIntakeModal';
import { AuthStatusButton } from '../../auth/AuthStatusButton';
import type { Incident, EmergencyTeam } from '../../../types/api';

export const TrackingPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(incidentId || null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // 1. Fetch Resources
  const { data: teams = [] } = useQuery<EmergencyTeam[]>({
    queryKey: ['resources'],
    queryFn: trackingApi.getResources,
  });

  // 2. Fetch Incidents
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: trackingApi.getIncidents,
  });

  // Active Incident Selection
  const activeIncident =
    (selectedIncidentId ? incidents.find((i) => i.id === selectedIncidentId) : null) ||
    (incidentId ? incidents.find((i) => i.id === incidentId) : null) ||
    (incidents.length > 0 ? incidents[0] : null);

  // 3. SSE Live Telemetry
  const { isConnected, latestTelemetry } = useLiveTelemetry({
    onIncidentCreated: (newInc) => {
      queryClient.setQueryData<Incident[]>(['incidents'], (old = []) => [newInc, ...old]);
      setSelectedIncidentId(newInc.id);
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

  // Simulation Controls
  const tickMutation = useMutation({
    mutationFn: trackingApi.tickSimulation,
  });

  const resetMutation = useMutation({
    mutationFn: trackingApi.resetSimulation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  // Incident Creation Mutations
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

  const plan = activeIncident?.dispatchPlan;
  const team = plan?.primaryTeam;
  const telemetry = team ? latestTelemetry[team.id] : undefined;

  return (
    <div className="flex h-screen w-full bg-[#090a0f] text-zinc-100 overflow-hidden select-none">
      {/* 1. Sidebar */}
      <TrackingSidebar activeCount={incidents.filter((i) => i.status === 'DISPATCHED').length} />

      {/* 2. Left Route & Mission Navigation Deck */}
      <aside className="w-80 shrink-0 bg-[#090a0f] border-r border-zinc-900 flex flex-col h-full z-20">
        {/* Top Action Bar */}
        <div className="h-12 px-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              title="Back to Dashboard"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              OSRM ROAD TRACING (/track)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsIntakeOpen(true)}
              variant="primary"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 bg-sky-600 hover:bg-sky-500 border-0 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Intake</span>
            </Button>
            <AuthStatusButton />
          </div>
        </div>

        {/* Active Route Selection Selector */}
        <div className="p-3 border-b border-zinc-900/80 bg-zinc-950/40">
          <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1.5">
            SELECT ACTIVE DISPATCH CORRIDOR:
          </label>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between border-0 ${
                  activeIncident?.id === inc.id
                    ? 'bg-zinc-800/80 text-white font-semibold'
                    : 'bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                }`}
              >
                <div className="truncate mr-2">
                  <div className="truncate text-[11px] font-bold">
                    {inc.triage?.summary || inc.rawReport}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate">
                    Lat: {inc.location.lat.toFixed(4)}, Lng: {inc.location.lng.toFixed(4)}
                  </div>
                </div>
                <StatusPill variant={inc.status === 'DISPATCHED' ? 'critical' : 'neutral'}>
                  {inc.status}
                </StatusPill>
              </button>
            ))}
          </div>
        </div>

        {/* OSRM Route Metrics Card */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {plan ? (
            <>
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border-0 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">ALLOCATED UNIT</span>
                  <span className="font-bold text-sky-400">{team?.callsign}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">BASE STATION</span>
                  <span className="text-zinc-200">
                    {teams.find((t) => t.id === team?.id)?.baseStation || 'Central EOC Base'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">TOTAL ROAD DISTANCE</span>
                  <span className="text-emerald-400 font-bold">
                    {team?.distanceKm?.toFixed(1) || '0.0'} km
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">ESTIMATED ARRIVAL (ETA)</span>
                  <span className="text-sky-300 font-bold">
                    {team?.etaMinutes?.toFixed(1) || '0.0'} min
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">SIREN SPEED FACTOR</span>
                  <span className="text-amber-400">1.4x Multiplier</span>
                </div>
              </div>

              {/* Simulation Stepper */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border-0">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-2">
                  2HZ KINEMATICS ENGINE CONTROLS
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => tickMutation.mutate()}
                    disabled={tickMutation.isPending}
                    variant="primary"
                    size="sm"
                    className="h-8 gap-1.5 text-xs bg-sky-600 hover:bg-sky-500 border-0 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Step Tick</span>
                  </Button>
                  <Button
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs border-0 bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </Button>
                </div>
              </div>

              {/* Agent Decision Trace */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border-0">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase mb-2">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Agent Decision Trace</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-mono">
                  {plan.reasoning || 'Triage executed in 280ms. Selected primary asset based on 50% capability match and shortest OSRM street duration.'}
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-xs font-mono text-zinc-500">
              Select an active dispatch incident to view real-time OSRM route telematics.
            </div>
          )}
        </div>
      </aside>

      {/* 3. Center Live MapCN Vector Display */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Status Bar */}
        <div className="h-10 px-4 bg-[#090a0f] border-b border-zinc-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
              MAPCN WEBGL VECTOR VIEWPORT
            </span>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isConnected ? '2Hz GPS STREAM: ACTIVE' : 'CONNECTING...'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="text-sky-400 flex items-center gap-1">
              <Compass className="h-3 w-3" />
              <span>OSRM ENGINE: ONLINE</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1">
              <Navigation className="h-3 w-3 text-emerald-400" />
              <span>BEARING: {telemetry?.heading || 90}°</span>
            </span>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <MapCNView
            incidents={incidents}
            teams={teams}
            selectedIncident={activeIncident}
            latestTelemetry={latestTelemetry}
          />
        </div>
      </main>

      {/* Multimodal Incident Intake Modal */}
      <IncidentIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
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
