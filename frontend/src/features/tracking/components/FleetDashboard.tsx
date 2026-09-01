import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  HeartPulse,
  ShieldAlert,
  Building2,
  Plane,
  LifeBuoy,
  Search,
  BatteryCharging,
  Gauge,
  MapPin,
  ExternalLink,
  CarFront,
} from 'lucide-react';
import { trackingApi } from '../api/trackingApi';
import { TrackingSidebar } from './TrackingSidebar';
import { StatusPill } from '../../../components/ui/status-pill';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { EmergencyTeam } from '../../../types/api';

export const FleetDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const { data: teams = [], isLoading } = useQuery<EmergencyTeam[]>({
    queryKey: ['resources'],
    queryFn: trackingApi.getResources,
  });

  // Get specific meaningful icon and badge color per capability / vehicle type
  const getVehicleMeta = (team: EmergencyTeam) => {
    const caps = team.capabilities.map((c) => c.toLowerCase()).join(' ');
    if (caps.includes('fire') || caps.includes('pump') || caps.includes('ladder')) {
      return {
        icon: Flame,
        color: 'text-amber-400 bg-amber-950/60',
        typeLabel: 'Fire Suppression Tender',
      };
    }
    if (caps.includes('medical') || caps.includes('als') || caps.includes('stretcher')) {
      return {
        icon: HeartPulse,
        color: 'text-rose-400 bg-rose-950/60',
        typeLabel: 'Advanced Life Support (ALS)',
      };
    }
    if (caps.includes('hazmat') || caps.includes('chemical') || caps.includes('radiation')) {
      return {
        icon: ShieldAlert,
        color: 'text-purple-400 bg-purple-950/60',
        typeLabel: 'Hazmat & CBRN Neutralizer',
      };
    }
    if (caps.includes('heavy') || caps.includes('shoring') || caps.includes('extrication')) {
      return {
        icon: Building2,
        color: 'text-sky-400 bg-sky-950/60',
        typeLabel: 'USAR Heavy Rescue Unit',
      };
    }
    if (caps.includes('aircraft') || caps.includes('arff') || caps.includes('foam')) {
      return {
        icon: Plane,
        color: 'text-orange-400 bg-orange-950/60',
        typeLabel: 'ARFF Airport Crash Tender',
      };
    }
    if (caps.includes('water') || caps.includes('boat') || caps.includes('flood')) {
      return {
        icon: LifeBuoy,
        color: 'text-cyan-400 bg-cyan-950/60',
        typeLabel: 'Swiftwater Rescue Boat',
      };
    }
    return {
      icon: CarFront,
      color: 'text-emerald-400 bg-emerald-950/60',
      typeLabel: 'Rapid Emergency Response',
    };
  };

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.baseStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'AVAILABLE') return t.status === 'AVAILABLE';
    if (filterCategory === 'DISPATCHED') return t.status === 'DISPATCHED';
    if (filterCategory === 'FIRE') return t.capabilities.some((c) => c.includes('fire') || c.includes('pump'));
    if (filterCategory === 'MEDICAL') return t.capabilities.some((c) => c.includes('medical') || c.includes('als'));
    if (filterCategory === 'HAZMAT') return t.capabilities.some((c) => c.includes('hazmat') || c.includes('chemical'));
    return true;
  });

  const availableCount = teams.filter((t) => t.status === 'AVAILABLE').length;
  const dispatchedCount = teams.filter((t) => t.status === 'DISPATCHED').length;

  return (
    <div className="flex h-screen w-full bg-[#090a0f] text-zinc-100 overflow-hidden select-none">
      {/* 1. Left Vertical Dock */}
      <TrackingSidebar activeCount={dispatchedCount} />

      {/* 2. Main Fleet Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Info Header */}
        <div className="h-16 px-6 bg-[#090a0f] border-b border-zinc-900 flex items-center justify-between z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-sky-400 font-bold tracking-widest uppercase">
                MUNICIPAL EMERGENCY FLEET ROSTER (/fleet)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                100% OSRM CONNECTED
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Active Emergency Vehicle Assets & Capability Telemetry
            </h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-2 rounded-lg bg-zinc-900/60 flex items-center gap-2 border-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">AVAILABLE:</span>
              <span className="font-bold text-white">{availableCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/60 flex items-center gap-2 border-0">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-zinc-400">DISPATCHED:</span>
              <span className="font-bold text-white">{dispatchedCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/60 flex items-center gap-2 border-0">
              <span className="text-zinc-400">TOTAL FLEET:</span>
              <span className="font-bold text-white">{teams.length}</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-zinc-900/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            {['ALL', 'AVAILABLE', 'DISPATCHED', 'FIRE', 'MEDICAL', 'HAZMAT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search callsign, station, gear..."
              className="pl-8 h-8 text-xs bg-zinc-900/80 border-0 shadow-none font-mono"
            />
          </div>
        </div>

        {/* Fleet Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-500">
              LOADING FLEET ROSTER TELEMETRY...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTeams.map((team) => {
                const meta = getVehicleMeta(team);
                const Icon = meta.icon;
                const isAvailable = team.status === 'AVAILABLE';

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-xl bg-zinc-900/35 hover:bg-zinc-900/60 transition-colors border-0 flex flex-col justify-between shadow-none select-none"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${meta.color} border-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold font-mono text-white leading-none">
                              {team.callsign}
                            </h3>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {meta.typeLabel}
                            </span>
                          </div>
                        </div>

                        <StatusPill variant={isAvailable ? 'success' : 'info'}>
                          {team.status}
                        </StatusPill>
                      </div>

                      {/* Station Info */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
                        <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{team.baseStation}</span>
                      </div>

                      {/* Capabilities Badges */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {team.capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-[10px] font-mono text-zinc-300"
                          >
                            {cap.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {team.capabilities.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800/40 text-[10px] font-mono text-zinc-500">
                            +{team.capabilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Stats & Action */}
                    <div className="pt-3 border-t border-zinc-900/70 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3 w-3 text-sky-400" />
                          <span>45 km/h</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <BatteryCharging className="h-3 w-3 text-emerald-400" />
                          <span>94%</span>
                        </span>
                      </div>

                      <Button
                        onClick={() => navigate('/track')}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] gap-1 text-sky-400 hover:text-white hover:bg-sky-600/30 border-0 cursor-pointer"
                      >
                        <span>Track</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
