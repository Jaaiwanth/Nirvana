import React, { useEffect, useRef } from 'react';
import { Map, Marker, NavigationControl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Incident, EmergencyTeam, TelemetryUpdateEvent } from '../../../types/api';

interface MapCNViewProps {
  incidents: Incident[];
  teams?: EmergencyTeam[];
  selectedIncident: Incident | null;
  latestTelemetry: Record<string, TelemetryUpdateEvent>;
}

// 100% Reliable Dark Matter WebGL Tile Style (Zero CORS / Font Sprite Issues)
const CARTO_DARK_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark-matter': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'carto-dark-tiles',
      type: 'raster' as const,
      source: 'carto-dark-matter',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export const MapCNView: React.FC<MapCNViewProps> = ({
  incidents,
  teams = [],
  selectedIncident,
  latestTelemetry,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vehicleMarkersRef = useRef<Record<string, Marker>>({});
  const incidentMarkersRef = useRef<Record<string, Marker>>({});
  const stationMarkersRef = useRef<Record<string, Marker>>({});

  // 1. Initialize MapLibre GL WebGL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: CARTO_DARK_STYLE,
      center: [77.5946, 12.9716], // [lng, lat]
      zoom: 12.5,
      pitch: 20,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      // Force immediate resize to match actual DOM flex bounds
      map.resize();

      // Add GeoJSON line source for active OSRM road routes
      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      });

      // Route Casing Glow (Cyan)
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 8,
          'line-opacity': 0.45,
        },
      });

      // Main Road Corridor Line
      map.addLayer({
        id: 'route-main',
        type: 'line',
        source: 'route-line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4,
        },
      });
    });

    // ResizeObserver ensures canvas always fills bounds during drawer toggles
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Render Base Stations / Team Posts
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up obsolete station markers
    Object.keys(stationMarkersRef.current).forEach((id) => {
      if (!teams.find((t) => t.id === id)) {
        stationMarkersRef.current[id].remove();
        delete stationMarkersRef.current[id];
      }
    });

    // Add stations
    teams.forEach((team) => {
      if (!stationMarkersRef.current[team.id]) {
        const el = document.createElement('div');
        el.className = 'custom-station-marker';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 3px;
            background: #1e293b;
            border: 1.5px solid #0284c7;
            box-shadow: 0 0 8px rgba(2, 132, 199, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 4px; height: 4px; border-radius: 50%; background: #38bdf8;"></div>
          </div>
        `;

        const marker = new Marker({ element: el })
          .setLngLat([team.currentLocation.lng, team.currentLocation.lat])
          .addTo(map);

        stationMarkersRef.current[team.id] = marker;
      }
    });
  }, [teams]);

  // 3. Update Route Polyline when selectedIncident changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('route-line') as GeoJSONSource;
    if (!source) return;

    const coords = selectedIncident?.dispatchPlan?.primaryTeam?.routeCoordinates;
    if (coords && coords.length > 0) {
      const lineCoordinates = coords.map((c) => [c.lng, c.lat]);
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
      });

      // Pan smoothly to incident coordinates
      map.easeTo({
        center: [selectedIncident.location.lng, selectedIncident.location.lat],
        zoom: 13.2,
        duration: 900,
      });
    } else {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      });
    }
  }, [selectedIncident]);

  // 4. Sync Incident Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove obsolete incident markers
    Object.keys(incidentMarkersRef.current).forEach((id) => {
      if (!incidents.find((inc) => inc.id === id)) {
        incidentMarkersRef.current[id].remove();
        delete incidentMarkersRef.current[id];
      }
    });

    // Add/update incident pins
    incidents.forEach((inc) => {
      if (!incidentMarkersRef.current[inc.id]) {
        const el = document.createElement('div');
        el.className = 'custom-incident-marker';
        const isCritical = inc.triage?.severity === 'CRITICAL';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${isCritical ? '#e11d48' : '#f59e0b'};
            box-shadow: 0 0 18px ${isCritical ? '#e11d48' : '#f59e0b'};
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
          ">!</div>
        `;

        const marker = new Marker({ element: el })
          .setLngLat([inc.location.lng, inc.location.lat])
          .addTo(map);

        incidentMarkersRef.current[inc.id] = marker;
      }
    });
  }, [incidents]);

  // 5. Sync Moving Vehicle Markers from live telemetry
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.entries(latestTelemetry).forEach(([teamId, data]) => {
      if (!vehicleMarkersRef.current[teamId]) {
        const el = document.createElement('div');
        el.className = 'custom-vehicle-marker';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="
            padding: 3px 7px;
            border-radius: 4px;
            background: #0284c7;
            color: #ffffff;
            font-size: 10px;
            font-family: monospace;
            font-weight: 700;
            box-shadow: 0 0 14px rgba(14, 165, 233, 0.8);
            border: 1px solid rgba(255,255,255,0.6);
            white-space: nowrap;
          ">🚒 ${teamId.replace('team_', '').toUpperCase()}</div>
        `;

        const marker = new Marker({ element: el })
          .setLngLat([data.currentCoordinates.lng, data.currentCoordinates.lat])
          .addTo(map);

        vehicleMarkersRef.current[teamId] = marker;
      } else {
        vehicleMarkersRef.current[teamId].setLngLat([
          data.currentCoordinates.lng,
          data.currentCoordinates.lat,
        ]);
      }
    });
  }, [latestTelemetry]);

  return (
    <div className="relative w-full h-full bg-[#08090d] overflow-hidden select-none">
      {/* Absolute Inset MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating HUD Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-zinc-800 text-zinc-300 font-mono text-[11px] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          <span>MAPCN VECTOR ENGINE // CARTO DARK</span>
        </div>

        {selectedIncident && (
          <div className="hidden sm:flex px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-zinc-800 text-zinc-300 font-mono text-[11px] items-center gap-2">
            <span className="text-zinc-500">TARGET:</span>
            <span className="text-white font-bold">{selectedIncident.id.substring(0, 16).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Floating Tactical Coordinate Tag */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-zinc-800 text-zinc-400 font-mono text-[10px]">
          BANGALORE JURISDICTION // 12.9716° N, 77.5946° E
        </div>
      </div>
    </div>
  );
};
