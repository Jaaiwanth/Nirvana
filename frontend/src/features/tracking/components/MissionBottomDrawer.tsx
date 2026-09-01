import React, { useState } from 'react';
import {
  Truck,
  Clock,
  Navigation,
  Cpu,
  ChevronUp,
  ChevronDown,
  Terminal,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import type {
  Incident,
  TelemetryUpdateEvent,
  AgentTelemetryRecord,
} from '../../../types/api';
import { StatusPill } from '../../../components/ui/status-pill';
import { Tabs } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface MissionBottomDrawerProps {
  selectedIncident: Incident | null;
  activeTelemetry?: TelemetryUpdateEvent;
  agentTelemetryLogs: AgentTelemetryRecord[];
  onTickSimulation: () => void;
  onResetSimulation: () => void;
}

export const MissionBottomDrawer: React.FC<MissionBottomDrawerProps> = ({
  selectedIncident,
  activeTelemetry,
  agentTelemetryLogs,
  onTickSimulation,
  onResetSimulation,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const primaryTeam = selectedIncident?.dispatchPlan?.primaryTeam;
  const isResolved = selectedIncident?.status === 'RESOLVED';
  const isOnScene = selectedIncident?.status === 'ON_SCENE' || activeTelemetry?.status === 'ON_SCENE';

  const progressPct = isResolved || isOnScene
    ? 100
    : (activeTelemetry?.progressPercentage ?? 0);

  const etaMin = isResolved || isOnScene
    ? 0.0
    : (activeTelemetry?.etaMinutes ?? primaryTeam?.etaMinutes ?? 0.0);

  const remainingDist = isResolved || isOnScene
    ? 0.0
    : (activeTelemetry?.remainingDistanceKm ?? primaryTeam?.distanceKm ?? 0.0);

  const statusVariant = isResolved || isOnScene
    ? 'success'
    : selectedIncident?.status === 'DISPATCHED'
    ? 'warning'
    : 'info';

  const statusLabel = isResolved
    ? 'RESOLVED'
    : isOnScene
    ? 'ON SCENE'
    : selectedIncident?.status || 'STANDBY';

  const drawerTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Agent Reasoning Stream', count: agentTelemetryLogs.length },
    { id: 'capabilities', label: 'Capabilities & Tools' },
  ];

  return (
    <div
      className={cn(
        'w-full bg-[#0c0e14] border-t border-zinc-900 transition-all duration-300 select-none z-20 flex flex-col',
        isCollapsed ? 'h-10' : 'h-64 sm:h-72'
      )}
    >
      {/* Top Header / Collapsible Bar */}
      <div className="h-10 px-4 border-b border-zinc-900/80 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-4">
          <Tabs
            tabs={drawerTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />
        </div>

        {/* Simulation Fast-Forward Controls & Collapse */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>2Hz ENGINE</span>
          </div>

          <Button
            onClick={onTickSimulation}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1 hover:text-sky-400"
            title="Advance vehicle along road route by 1 step"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <span>Sim Tick</span>
          </Button>

          <Button
            onClick={onResetSimulation}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1 hover:text-rose-400"
            title="Reset fleet back to bases"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </Button>

          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
          >
            {isCollapsed ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Drawer Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden p-4">
          {activeTab === 'overview' && (
            <div className="h-full flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Incident Identity & Vehicle Details */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div
                  className={`h-16 w-20 rounded-lg border flex flex-col items-center justify-center shrink-0 ${
                    isResolved || isOnScene
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                      : 'bg-zinc-900/80 border-zinc-800 text-sky-400'
                  }`}
                >
                  <Truck className="h-8 w-8" />
                  <span className="text-[9px] font-mono font-bold mt-1 uppercase">
                    {primaryTeam?.vehicleType.split(' ')[0] || 'RESCUE'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-mono text-zinc-100">
                      {selectedIncident
                        ? selectedIncident.id.substring(0, 16).toUpperCase()
                        : 'SELECT INCIDENT'}
                    </h3>
                    {selectedIncident && (
                      <StatusPill variant={statusVariant}>
                        {statusLabel}
                      </StatusPill>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    {primaryTeam ? (
                      <>
                        <span className="text-zinc-200 font-semibold">{primaryTeam.callsign}</span> · {primaryTeam.vehicleType}
                      </>
                    ) : selectedIncident?.assignedTeamIds?.[0] ? (
                      `Unit ${selectedIncident.assignedTeamIds[0]} Dispatched`
                    ) : (
                      'Standby: Waiting for incident selection'
                    )}
                  </p>

                  {selectedIncident?.dispatchPlan?.isExhaustionSubstitute && (
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-[10px] text-amber-300 font-mono">
                      <AlertCircle className="h-3 w-3" />
                      <span>FLEET EXHAUSTION: Cross-trained substitute deployed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center: Route Timeline Progress Bar */}
              <div className="flex-1 w-full max-w-xl px-4 flex flex-col justify-center">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                  <span className="text-zinc-300 font-semibold">
                    {primaryTeam ? 'DISPATCH STATION' : 'ORIGIN'}
                  </span>
                  <span className={isResolved || isOnScene ? 'text-emerald-400 font-bold' : 'text-sky-400 font-bold'}>
                    {isResolved ? 'MISSION RESOLVED: 100%' : isOnScene ? 'ON SCENE: 100%' : `ON ROUTE: ${progressPct}%`}
                  </span>
                  <span className="text-zinc-300 font-semibold">
                    {isResolved ? 'SCENE SECURED' : 'EMERGENCY SCENE'}
                  </span>
                </div>

                {/* Progress Track */}
                <div className="relative w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isResolved || isOnScene
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1.5">
                  <span>DEP: 0.00 km</span>
                  <span className={isResolved || isOnScene ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                    {isResolved
                      ? 'MISSION ACCOMPLISHED · TASK AUTO-CLOSED'
                      : isOnScene
                      ? 'UNIT ARRIVED ON SCENE · OPERATIONS ACTIVE'
                      : `APPROX ${etaMin.toFixed(1)} MIN REMAINING`}
                  </span>
                  <span>ARR: {remainingDist.toFixed(1)} km</span>
                </div>
              </div>

              {/* Right: Key Telemetry Metric Cards */}
              <div className="grid grid-cols-3 gap-3 shrink-0 w-full md:w-auto">
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center min-w-24">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 mb-1">
                    <Clock className={`h-3 w-3 ${isResolved || isOnScene ? 'text-emerald-400' : 'text-sky-400'}`} />
                    <span>ESTIMATE</span>
                  </div>
                  <span className={`text-base font-bold font-mono ${isResolved || isOnScene ? 'text-emerald-400' : 'text-zinc-100'}`}>
                    {isResolved ? 'CLOSED' : `${etaMin.toFixed(1)}m`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center min-w-24">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 mb-1">
                    <Navigation className="h-3 w-3 text-emerald-400" />
                    <span>DISTANCE</span>
                  </div>
                  <span className="text-base font-bold font-mono text-zinc-100">
                    {remainingDist.toFixed(1)} km
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center min-w-24">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 mb-1">
                    <Cpu className="h-3 w-3 text-purple-400" />
                    <span>AI LATENCY</span>
                  </div>
                  <span className="text-base font-bold font-mono text-zinc-100">
                    &lt; 380ms
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Live LangGraph Agent Reasoning Stream */}
          {activeTab === 'timeline' && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-sky-400" />
                  <span>LANGGRAPH STATEGRAPH EXECUTION STREAM</span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  {agentTelemetryLogs.length} events logged
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 font-mono text-xs">
                {agentTelemetryLogs.length === 0 ? (
                  <p className="text-zinc-500 text-center py-6">
                    Waiting for incident trigger... Live node transitions will appear here.
                  </p>
                ) : (
                  agentTelemetryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-zinc-900/40 border border-zinc-850 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-800/80 font-bold">
                          {log.nodeName}
                        </span>
                        <span className="text-zinc-300 text-[11px]">{log.summary}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-[10px] text-zinc-500">
                        {log.durationMs !== undefined && (
                          <span className="text-emerald-400">{log.durationMs}ms</span>
                        )}
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Required Tools & Capabilities */}
          {activeTab === 'capabilities' && (
            <div className="h-full flex flex-col overflow-y-auto pt-1">
              <h4 className="text-xs font-mono text-zinc-400 uppercase mb-2">
                Identified Specializations & Tool Allocations:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedIncident?.triage?.requiredCapabilities?.map((cap) => (
                  <span
                    key={cap}
                    className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-sky-300 text-xs font-mono"
                  >
                    ⚙️ {cap.replace('_', ' ').toUpperCase()}
                  </span>
                )) || (
                  <span className="text-zinc-500 text-xs font-mono">
                    No active capability requirements loaded.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
