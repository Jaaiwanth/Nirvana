import axios from 'axios';
import { Coordinates } from '../types/index.js';
import { calculateHaversineDistance, estimateEmergencyEtaMinutes } from '../utils/haversine.js';

export interface RouteResult {
  drivingDistanceKm: number;
  durationMinutes: number;
  routeCoordinates: [number, number][]; // [lat, lng]
  isRoadNetwork: boolean;
}

export class OSRMClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches driving route from team coordinates to incident coordinates.
   * OSRM API expects: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson
   */
  async getDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResult> {
    const url = `${this.baseUrl}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    try {
      const response = await axios.get(url, { timeout: 3000 });
      const route = response.data?.routes?.[0];

      if (route && route.geometry?.coordinates) {
        const drivingDistanceKm = parseFloat((route.distance / 1000).toFixed(2));
        const durationMinutes = parseFloat((route.duration / 60).toFixed(1));

        // OSRM returns coordinates as [lng, lat], map to [lat, lng] for Leaflet
        const routeCoordinates: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        return {
          drivingDistanceKm,
          durationMinutes,
          routeCoordinates,
          isRoadNetwork: true,
        };
      }
    } catch (err: any) {
      // Graceful fallback if OSRM is offline or rate-limited
      console.warn(`[OSRMClient] Warning: OSRM route fetch failed (${err.message}). Falling back to simulated route.`);
    }

    // Fallback: Generate linear interpolated route coordinates
    const straightDistance = calculateHaversineDistance(origin, destination);
    const eta = estimateEmergencyEtaMinutes(straightDistance);

    const steps = 10;
    const interpolatedCoords: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const lat = origin.lat + (destination.lat - origin.lat) * fraction;
      const lng = origin.lng + (destination.lng - origin.lng) * fraction;
      interpolatedCoords.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))]);
    }

    return {
      drivingDistanceKm: straightDistance,
      durationMinutes: eta,
      routeCoordinates: interpolatedCoords,
      isRoadNetwork: false,
    };
  }
}

export const osrmClient = new OSRMClient();
