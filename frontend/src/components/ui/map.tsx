import React, {
  useEffect,
  useRef,
  useState,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl';
import type { GeoJSONSource, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '../../lib/utils';
import {
  MapContext,
  useMap,
  type MapViewport,
  TACTICAL_DARK_STYLE,
  CARTO_DARK_STYLE,
} from './useMap';

export type { MapViewport };
export { TACTICAL_DARK_STYLE, CARTO_DARK_STYLE };

interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  center?: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  mapStyle?: StyleSpecification | string;
  interactive?: boolean;
  children?: React.ReactNode;
}

export const Map: React.FC<MapProps> = ({
  viewport,
  onViewportChange,
  center = [77.5946, 12.9716],
  zoom = 12.5,
  bearing = 0,
  pitch = 0,
  mapStyle = TACTICAL_DARK_STYLE,
  className,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInternalMove = useRef(false);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const initialCenter = viewport ? viewport.center : center;
    const initialZoom = viewport ? viewport.zoom : zoom;
    const initialBearing = viewport ? viewport.bearing : bearing;
    const initialPitch = viewport ? viewport.pitch : pitch;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: mapStyle,
      center: initialCenter,
      zoom: initialZoom,
      bearing: initialBearing,
      pitch: initialPitch,
      attributionControl: false,
      dragPan: true,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
    });

    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      map.resize();
      setIsLoaded(true);
    });

    // Handle tile errors gracefully
    map.on('error', (e) => {
      console.warn('[MapCN] Tile warning, checking fallback:', e);
    });

    map.on('move', () => {
      if (onViewportChange) {
        isInternalMove.current = true;
        const c = map.getCenter();
        onViewportChange({
          center: [c.lng, c.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
        setTimeout(() => {
          isInternalMove.current = false;
        }, 50);
      }
    });

    // Resize observer to ensure map canvas fills parent flex bounds
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    // Backup timer to handle layout shifts
    const t = setTimeout(() => {
      map.resize();
    }, 150);

    setMapInstance(map);

    return () => {
      clearTimeout(t);
      resizeObserver.disconnect();
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    };
  }, []);

  // Sync controlled viewport changes from parent
  useEffect(() => {
    if (!mapInstance || !viewport || isInternalMove.current) return;
    if (mapInstance.isMoving()) return; // Never interrupt active user drag or zoom

    const currentCenter = mapInstance.getCenter();
    const currentZoom = mapInstance.getZoom();
    const currentBearing = mapInstance.getBearing();
    const currentPitch = mapInstance.getPitch();

    const centerDiff =
      Math.abs(currentCenter.lng - viewport.center[0]) > 0.0001 ||
      Math.abs(currentCenter.lat - viewport.center[1]) > 0.0001;
    const zoomDiff = Math.abs(currentZoom - viewport.zoom) > 0.05;
    const bearingDiff = Math.abs(currentBearing - viewport.bearing) > 0.5;
    const pitchDiff = Math.abs(currentPitch - viewport.pitch) > 0.5;

    if (centerDiff || zoomDiff || bearingDiff || pitchDiff) {
      mapInstance.easeTo({
        center: viewport.center,
        zoom: viewport.zoom,
        bearing: viewport.bearing,
        pitch: viewport.pitch,
        duration: 350,
      });
    }
  }, [viewport, mapInstance]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full min-h-[300px] overflow-hidden bg-[#090a0f]', className)}
      {...props}
    >
      <MapContext.Provider value={{ map: mapInstance, isLoaded }}>
        {children}
      </MapContext.Provider>
    </div>
  );
};

// MapMarker Component
interface MapMarkerProps {
  longitude: number;
  latitude: number;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  longitude,
  latitude,
  onClick,
  className,
  children,
}) => {
  const { map } = useMap();
  const [markerElement] = useState(() => {
    const el = document.createElement('div');
    el.className = 'mapcn-marker-container';
    return el;
  });
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    const marker = new Marker({ element: markerElement })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, markerElement, longitude, latitude]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }, [longitude, latitude]);

  return createPortal(
    <div onClick={onClick} className={cn('cursor-pointer select-none', className)}>
      {children}
    </div>,
    markerElement
  );
};

// MarkerContent Component
export const MarkerContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// MarkerLabel Component
interface MarkerLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const MarkerLabel: React.FC<MarkerLabelProps> = ({
  position = 'bottom',
  className,
  children,
  ...props
}) => {
  const positionClasses = {
    top: 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
    left: 'right-full mr-1.5 top-1/2 -translate-y-1/2',
    right: 'left-full ml-1.5 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={cn(
        'absolute whitespace-nowrap px-1.5 py-0.5 rounded bg-zinc-950/90 text-zinc-200 text-[10px] font-mono font-medium shadow-md pointer-events-none border border-zinc-800/80',
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// MapRoute Component
interface MapRouteProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  onClick?: () => void;
}

export const MapRoute: React.FC<MapRouteProps> = ({
  coordinates,
  color = '#38bdf8',
  width = 5,
  opacity = 0.8,
  onClick,
}) => {
  const { map, isLoaded } = useMap();
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const sourceId = `route-source-${autoId}`;
  const layerGlowId = `route-glow-${autoId}`;
  const layerMainId = `route-main-${autoId}`;

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      // Glow Underlay
      map.addLayer({
        id: layerGlowId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': width * 1.8,
          'line-opacity': opacity * 0.35,
        },
      });

      // Main Polyline
      map.addLayer({
        id: layerMainId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': width,
          'line-opacity': opacity,
        },
      });
    }

    const handleClick = () => {
      if (onClick) onClick();
    };

    map.on('click', layerMainId, handleClick);

    return () => {
      try {
        if (map.getLayer(layerMainId)) {
          map.off('click', layerMainId, handleClick);
          map.removeLayer(layerMainId);
        }
        if (map.getLayer(layerGlowId)) {
          map.removeLayer(layerGlowId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch {
        // cleanup safety
      }
    };
  }, [map, isLoaded, color, coordinates, layerGlowId, layerMainId, onClick, opacity, sourceId, width]);

  // Update line coordinates & styling when props change
  useEffect(() => {
    if (!map || !isLoaded) return;

    const source = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    }

    if (map.getLayer(layerMainId)) {
      map.setPaintProperty(layerMainId, 'line-color', color);
      map.setPaintProperty(layerMainId, 'line-width', width);
      map.setPaintProperty(layerMainId, 'line-opacity', opacity);
    }

    if (map.getLayer(layerGlowId)) {
      map.setPaintProperty(layerGlowId, 'line-color', color);
      map.setPaintProperty(layerGlowId, 'line-width', width * 1.8);
      map.setPaintProperty(layerGlowId, 'line-opacity', opacity * 0.35);
    }
  }, [coordinates, color, width, opacity, map, isLoaded, layerGlowId, layerMainId, sourceId]);

  return null;
};
