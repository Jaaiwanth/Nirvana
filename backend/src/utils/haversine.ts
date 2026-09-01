import { Coordinates } from '../types/index.js';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @param coord1 Origin coordinate { lat, lng }
 * @param coord2 Destination coordinate { lat, lng }
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1Rad = toRadians(coord1.lat);
  const lat2Rad = toRadians(coord2.lat);
  const deltaLat = toRadians(coord2.lat - coord1.lat);
  const deltaLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Estimates driving ETA in minutes assuming an average city response speed (e.g. 40 km/h)
 * multiplied by a traffic factor.
 */
export function estimateEmergencyEtaMinutes(
  distanceKm: number,
  speedFactor: number = 1.0,
  trafficMultiplier: number = 1.25
): number {
  if (distanceKm <= 0.05) return 0.0;
  const BASE_CITY_SPEED_KMH = 45.0;
  const effectiveSpeed = (BASE_CITY_SPEED_KMH * speedFactor) / trafficMultiplier;
  const timeHours = distanceKm / effectiveSpeed;
  const timeMinutes = timeHours * 60;
  return parseFloat(Math.max(0.1, timeMinutes).toFixed(1));
}
