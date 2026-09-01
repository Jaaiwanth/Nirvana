import React, { useState, useEffect } from 'react';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MapRoute,
  type MapViewport,
} from '../../../components/ui/map';
import { Clock, Route, Loader2, Navigation, Plus, Minus, Crosshair } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { Incident, EmergencyTeam, TelemetryUpdateEvent } from '../../../types/api';

interface MapCNViewProps {
  incidents: Incident[];
  teams?: EmergencyTeam[];
  selectedIncident: Incident | null;
  latestTelemetry: Record<string, TelemetryUpdateEvent>;
}

interface RouteData {
  coordinates: [number, number][];
  duration: number; // seconds
  distance: number; // meters
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export const MapCNView: React.FC<MapCNViewProps> = ({
  incidents,
  teams = [],
  selectedIncident,
  latestTelemetry,
}) => {
  // 1. Controlled Map Viewport State
  const [viewport, setViewport] = useState<MapViewport>({
    center: [77.5946, 12.9716], // [lng, lat] (Bangalore)
    zoom: 12.5,
    bearing: 0,
    pitch: 15,
  });

  // 2. OSRM Multi-Route Planning State
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  const primaryTeam = selectedIncident?.dispatchPlan?.primaryTeam;
  const targetIncident = selectedIncident;

  // Center viewport ONLY when selected incident ID changes (never during active dragging or simulation ticks)
  useEffect(() => {
    if (!targetIncident) return;
    const endCoord = targetIncident.location;
    if (!endCoord) return;

    let isCancelled = false;
    Promise.resolve().then(() => {
      if (!isCancelled) {
        setViewport((prev) => ({
          ...prev,
          center: [endCoord.lng, endCoord.lat],
          zoom: 13.0,
        }));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [targetIncident?.id]);

  // Fetch OSRM Alternative Routes for Dispatched Mission
  useEffect(() => {
    let isCancelled = false;

    if (!primaryTeam || !targetIncident) {
      Promise.resolve().then(() => {
        if (!isCancelled) setRoutes([]);
      });
      return () => {
        isCancelled = true;
      };
    }

    const startTeam = teams.find((t) => t.id === primaryTeam.id);
    const startCoord = startTeam ? startTeam.currentLocation : primaryTeam.routeCoordinates?.[0];
    const endCoord = targetIncident.location;

    if (!startCoord || !endCoord) return;

    const safeStart = startCoord;
    const safeEnd = endCoord;
    const safePrimaryTeam = primaryTeam;

    async function fetchDispatchedRoutes() {
      setIsLoadingRoutes(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${safeStart.lng},${safeStart.lat};${safeEnd.lng},${safeEnd.lat}?overview=full&geometries=geojson&alternatives=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (isCancelled) return;

        if (data.routes && data.routes.length > 0) {
          const parsedRoutes: RouteData[] = data.routes.map(
            (r: {
              geometry: { coordinates: [number, number][] };
              duration: number;
              distance: number;
            }) => ({
              coordinates: r.geometry.coordinates,
              duration: r.duration,
              distance: r.distance,
            })
          );
          setRoutes(parsedRoutes);
          setSelectedIndex(0);
        } else if (safePrimaryTeam.routeCoordinates && safePrimaryTeam.routeCoordinates.length > 0) {
          setRoutes([
            {
              coordinates: safePrimaryTeam.routeCoordinates.map((c) => [c.lng, c.lat]),
              duration: (safePrimaryTeam.etaMinutes || 5) * 60,
              distance: (safePrimaryTeam.distanceKm || 4.2) * 1000,
            },
          ]);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.warn('OSRM router public fallback error, using graph state route:', err);
        if (isCancelled) return;
        if (safePrimaryTeam.routeCoordinates && safePrimaryTeam.routeCoordinates.length > 0) {
          setRoutes([
            {
              coordinates: safePrimaryTeam.routeCoordinates.map((c) => [c.lng, c.lat]),
              duration: (safePrimaryTeam.etaMinutes || 5) * 60,
              distance: (safePrimaryTeam.distanceKm || 4.2) * 1000,
            },
          ]);
          setSelectedIndex(0);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoutes(false);
        }
      }
    }

    fetchDispatchedRoutes();

    return () => {
      isCancelled = true;
    };
  }, [targetIncident?.id, primaryTeam?.id]);

  // Sort routes: non-selected first, selected last (renders on top)
  const sortedRoutes = routes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });

  // Start & End markers for the selected dispatch
  const startStation = teams.find((t) => t.id === primaryTeam?.id);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#090a0f]">
      {/* 1. Declarative Controlled Mode Map */}
      <Map viewport={viewport} onViewportChange={setViewport} className="h-full w-full">
        {/* Render Dispatched OSRM Road Routes */}
        {sortedRoutes.map(({ route, index }) => {
          const isSelected = index === selectedIndex;
          return (
            <MapRoute
              key={index}
              coordinates={route.coordinates}
              color={isSelected ? '#0ea5e9' : '#64748b'}
              width={isSelected ? 6 : 4}
              opacity={isSelected ? 1 : 0.55}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}

        {/* Start Marker: Base Station */}
        {startStation && (
          <MapMarker
            longitude={startStation.currentLocation.lng}
            latitude={startStation.currentLocation.lat}
          >
            <MarkerContent>
              <div className="h-6 w-6 rounded-lg bg-sky-950 border-2 border-sky-400 shadow-lg shadow-sky-500/50 flex items-center justify-center text-white">
                <div className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
              </div>
              <MarkerLabel position="top">{startStation.baseStation || startStation.callsign}</MarkerLabel>
            </MarkerContent>
          </MapMarker>
        )}

        {/* Destination Marker: Emergency Scene */}
        {targetIncident && (
          <MapMarker
            longitude={targetIncident.location.lng}
            latitude={targetIncident.location.lat}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div
                  className={`absolute h-8 w-8 rounded-full ${
                    targetIncident.status === 'ON_SCENE'
                      ? 'bg-emerald-500/30 animate-ping'
                      : targetIncident.status === 'RESOLVED'
                      ? 'hidden'
                      : 'bg-rose-500/30 animate-ping'
                  }`}
                />
                <div
                  className={`h-6 w-6 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold ${
                    targetIncident.status === 'RESOLVED'
                      ? 'bg-emerald-600'
                      : targetIncident.status === 'ON_SCENE'
                      ? 'bg-emerald-500'
                      : 'bg-rose-600'
                  }`}
                >
                  !
                </div>
              </div>
              <MarkerLabel position="bottom">
                {targetIncident.status === 'RESOLVED'
                  ? 'RESOLVED // SCENE SECURE'
                  : targetIncident.status === 'ON_SCENE'
                  ? 'UNITS ON SCENE'
                  : targetIncident.triage?.summary || 'EMERGENCY SCENE'}
              </MarkerLabel>
            </MarkerContent>
          </MapMarker>
        )}

        {/* Other Active Incident Markers */}
        {incidents
          .filter((inc) => inc.id !== targetIncident?.id)
          .map((inc) => (
            <MapMarker
              key={inc.id}
              longitude={inc.location.lng}
              latitude={inc.location.lat}
            >
              <MarkerContent>
                <div
                  className={`h-4 w-4 rounded-full border border-white shadow-md ${
                    inc.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <MarkerLabel position="bottom">
                  {inc.triage?.summary?.substring(0, 20) || 'INCIDENT'}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          ))}

        {/* Active Dispatched Vehicles with Telemetry Heading */}
        {teams.map((team) => {
          const telemetry = latestTelemetry[team.id];
          const coord = telemetry?.currentCoordinates || team.currentLocation;
          const heading = telemetry?.heading || 0;
          const isPrimary = team.id === primaryTeam?.id;
          const isResolved = targetIncident?.status === 'RESOLVED' || team.status === 'AVAILABLE';
          const isOnScene = !isResolved && (telemetry?.status === 'ON_SCENE' || team.status === 'ON_SCENE');

          return (
            <MapMarker
              key={team.id}
              longitude={coord.lng}
              latitude={coord.lat}
            >
              <MarkerContent>
                <div
                  style={{ transform: `rotate(${heading}deg)` }}
                  className={`h-7 w-7 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
                    isOnScene
                      ? 'bg-emerald-500 border-2 border-white shadow-emerald-500/80 scale-110'
                      : isPrimary && !isResolved
                      ? 'bg-sky-500 border-2 border-white shadow-sky-500/80 scale-110'
                      : 'bg-zinc-800 border border-zinc-600'
                  }`}
                >
                  <Navigation className="h-3.5 w-3.5 fill-current text-white" />
                </div>
                <MarkerLabel position="top">
                  {team.callsign} {isOnScene ? '[ON SCENE]' : `(${team.vehicleType.split(' ')[0]})`}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          );
        })}
      </Map>

      {/* 2. Interactive Controlled Viewport HUD with Drag/Zoom Controls (Top Right) */}
      <div className="bg-zinc-950/85 border border-zinc-800/80 absolute top-3 right-3 z-10 hidden sm:flex items-center gap-x-2.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] backdrop-blur-md shadow-xl text-zinc-300">
        <div className="flex items-center gap-2">
          <span>
            <span className="text-zinc-500">lng:</span> {viewport.center[0].toFixed(4)}
          </span>
          <span>
            <span className="text-zinc-500">lat:</span> {viewport.center[1].toFixed(4)}
          </span>
          <span>
            <span className="text-zinc-500">z:</span> {viewport.zoom.toFixed(1)}
          </span>
        </div>

        {/* Zoom Controls (+ / - / Center) */}
        <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
          <button
            onClick={() => setViewport((v) => ({ ...v, zoom: Math.min(v.zoom + 1, 18) }))}
            className="h-5 w-5 rounded bg-zinc-800 hover:bg-sky-600 text-white font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => setViewport((v) => ({ ...v, zoom: Math.max(v.zoom - 1, 4) }))}
            className="h-5 w-5 rounded bg-zinc-800 hover:bg-sky-600 text-white font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <Minus className="h-3 w-3" />
          </button>
          {targetIncident && (
            <button
              onClick={() =>
                setViewport((v) => ({
                  ...v,
                  center: [targetIncident.location.lng, targetIncident.location.lat],
                  zoom: 13.5,
                }))
              }
              className="h-5 w-5 rounded bg-zinc-800 hover:bg-emerald-600 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              title="Center on Target Incident"
            >
              <Crosshair className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Dispatched Route Planning Options Deck (Top Left) */}
      {routes.length > 0 && (
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-xs">
          <div className="p-2 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-md shadow-xl">
            <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block mb-1.5">
              OSRM ROAD ROUTE OPTIONS ({routes.length})
            </span>
            <div className="flex flex-col gap-1.5">
              {routes.map((route, index) => {
                const isActive = index === selectedIndex;
                const isFastest = index === 0;
                return (
                  <Button
                    key={index}
                    variant={isActive ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedIndex(index)}
                    className={`justify-between h-8 px-2.5 text-xs font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white border-0 shadow-md shadow-sky-600/30'
                        : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-sky-300" />
                      <span className="font-semibold">{formatDuration(route.duration)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] opacity-80">
                        <Route className="h-3 w-3 text-zinc-400" />
                        <span>{formatDistance(route.distance)}</span>
                      </div>
                      {isFastest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                          Fastest
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loading Routes Spinner */}
      {isLoadingRoutes && (
        <div className="absolute top-3 left-3 z-30 p-2 rounded-lg bg-zinc-950/90 border border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-300 backdrop-blur-md">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
          <span>Computing OSRM Alternative Road Routes...</span>
        </div>
      )}
    </div>
  );
};
