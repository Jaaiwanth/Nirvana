import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Truck,
  AlertOctagon,
  Plus,
} from 'lucide-react';
import type { Incident } from '../../../types/api';
import { StatusPill } from '../../../components/ui/status-pill';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenIntakeModal: () => void;
}

type FilterCategory = 'all' | 'critical' | 'usar' | 'hazmat' | 'fire';

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onOpenIntakeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.rawReport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.triage?.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.dispatchPlan?.primaryTeam?.callsign.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'critical') {
        return inc.triage?.severity === 'CRITICAL';
      }
      if (categoryFilter === 'usar') {
        return (
          inc.triage?.incidentType === 'structural_collapse' ||
          inc.triage?.requiredCapabilities?.includes('heavy_rescue')
        );
      }
      if (categoryFilter === 'hazmat') {
        return (
          inc.triage?.incidentType === 'hazmat' ||
          inc.triage?.requiredCapabilities?.includes('hazmat_containment')
        );
      }
      if (categoryFilter === 'fire') {
        return inc.triage?.incidentType === 'fire';
      }

      return true;
    });
  }, [incidents, searchQuery, categoryFilter]);

  const getStatusVariant = (status: string, severity?: string) => {
    if (severity === 'CRITICAL') return 'critical';
    if (status === 'ON_SCENE' || status === 'RESOLVED') return 'success';
    if (status === 'DISPATCHED' || status === 'EN_ROUTE') return 'warning';
    return 'info';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'DISPATCHED') return 'IN TRANSIT';
    if (status === 'ON_SCENE') return 'ON SCENE';
    if (status === 'RESOLVED') return 'RESOLVED';
    return status;
  };

  return (
    <section className="w-80 sm:w-96 shrink-0 bg-[#0c0e14] border-r border-zinc-900 flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Tracking list</h2>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-mono">
            {incidents.length} active
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={onOpenIntakeModal}
            variant="primary"
            size="sm"
            className="h-7 px-2 text-[11px] gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>New Call</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Input with ⌘K */}
      <div className="p-3 border-b border-zinc-900/80">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, unit, type..."
            className="pl-8 pr-8 h-8 text-xs bg-zinc-900/90 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700 pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer',
              categoryFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            )}
          >
            All Incidents
          </button>
          <button
            onClick={() => setCategoryFilter('critical')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer',
              categoryFilter === 'critical'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            )}
          >
            Critical
          </button>
          <button
            onClick={() => setCategoryFilter('usar')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer',
              categoryFilter === 'usar'
                ? 'bg-sky-950/80 text-sky-300 border border-sky-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            )}
          >
            USAR
          </button>
          <button
            onClick={() => setCategoryFilter('hazmat')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer',
              categoryFilter === 'hazmat'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            )}
          >
            Hazmat
          </button>
          <button
            onClick={() => setCategoryFilter('fire')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer',
              categoryFilter === 'fire'
                ? 'bg-orange-950/80 text-orange-300 border border-orange-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            )}
          >
            Fire
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-zinc-500">
            <AlertOctagon className="h-6 w-6 mb-2 text-zinc-600" />
            <span className="text-xs">No incidents matching query</span>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedIncidentId === incident.id;
            const primaryTeam = incident.dispatchPlan?.primaryTeam;
            const primaryTeamId = primaryTeam?.id || incident.assignedTeamIds?.[0];
            const isAssigned = !!primaryTeam || (incident.assignedTeamIds && incident.assignedTeamIds.length > 0);
            const statusLabel = getStatusLabel(incident.status);
            const statusVariant = getStatusVariant(incident.status, incident.triage?.severity);
            const isResolved = incident.status === 'RESOLVED';
            const isOnScene = incident.status === 'ON_SCENE';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={cn(
                  'p-3 rounded-lg border text-xs transition-all cursor-pointer select-none relative',
                  isSelected
                    ? 'bg-zinc-900/90 border-sky-600/80 shadow-md shadow-sky-950/30'
                    : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40'
                )}
              >
                {/* Header: ID + Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-zinc-200">
                    {incident.id.substring(0, 16).toUpperCase()}
                  </span>
                  <StatusPill variant={statusVariant}>
                    {statusLabel}
                  </StatusPill>
                </div>

                {/* Route Bar: Origin -> ETA -> Destination */}
                <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px] py-1 border-y border-zinc-900/60 my-1.5">
                  <span className="font-semibold text-zinc-300">
                    {isAssigned ? 'STATION' : 'BASE'}
                  </span>
                  <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                    <span className="h-px w-6 bg-zinc-800" />
                    <Truck className={`h-3 w-3 ${isOnScene || isResolved ? 'text-emerald-400' : 'text-sky-400'}`} />
                    <span>
                      {isResolved
                        ? 'CLOSED'
                        : isOnScene
                        ? '0m (ON SCENE)'
                        : primaryTeam
                        ? `${primaryTeam.etaMinutes}m`
                        : isAssigned
                        ? 'EN ROUTE'
                        : 'STANDBY'}
                    </span>
                    <span className="h-px w-6 bg-zinc-800" />
                  </div>
                  <span className="font-semibold text-zinc-300">
                    {isResolved ? 'SECURED' : 'SCENE'}
                  </span>
                </div>

                {/* Sub-label: Address & Summary */}
                <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1">
                  {incident.rawReport}
                </p>

                {/* Unit Footer */}
                <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-zinc-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isResolved || isOnScene
                          ? 'bg-emerald-400'
                          : isAssigned
                          ? 'bg-sky-400 animate-pulse'
                          : 'bg-zinc-600'
                      }`}
                    />
                    <span className="text-zinc-300 font-medium">
                      {primaryTeam?.callsign || (isAssigned ? `Unit ${primaryTeamId}` : 'Unassigned')}
                    </span>
                    {primaryTeam && (
                      <span className="text-zinc-500">
                        · {primaryTeam.vehicleType}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-semibold ${
                      isResolved || isOnScene ? 'text-emerald-400' : 'text-sky-400'
                    }`}
                  >
                    {isResolved
                      ? 'RESOLVED'
                      : isOnScene
                      ? 'ON SCENE'
                      : primaryTeam
                      ? `ETA ${primaryTeam.etaMinutes}m`
                      : isAssigned
                      ? 'IN TRANSIT'
                      : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
