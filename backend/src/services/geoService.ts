import { Coordinates, RescueTeam, ScoredCandidate } from '../types/index.js';
import { calculateHaversineDistance, estimateEmergencyEtaMinutes } from '../utils/haversine.js';

export class GeoService {
  /**
   * Filters and ranks rescue teams within a maximum radius (default 35 km),
   * scoring them by capability match and proximity.
   * If all units are outside maxRadiusKm, falls back to the nearest units in jurisdiction.
   */
  filterCandidateTeams(
    incidentLocation: Coordinates,
    teams: RescueTeam[],
    requiredCapabilities: string[] = [],
    maxRadiusKm: number = 35.0,
    topK: number = 6
  ): ScoredCandidate[] {
    if (!teams || teams.length === 0) {
      return [];
    }

    const allScored: ScoredCandidate[] = teams.map((team) => {
      const distanceKm = calculateHaversineDistance(team.currentLocation, incidentLocation);
      let capabilityMatchCount = 0;
      if (requiredCapabilities.length > 0) {
        capabilityMatchCount = requiredCapabilities.filter((cap) =>
          team.capabilities.includes(cap)
        ).length;
      }
      const estimatedEta = estimateEmergencyEtaMinutes(distanceKm, team.speedFactor);
      return {
        team,
        haversineDistanceKm: distanceKm,
        etaMinutes: estimatedEta,
        capabilityMatchCount,
      };
    });

    // 1. Primary candidate filter: within radius
    let candidates = allScored.filter((c) => c.haversineDistanceKm <= maxRadiusKm);

    // 2. Fallback: If all available units are outside radius, select the closest units in the city
    if (candidates.length === 0) {
      candidates = allScored;
    }

    // Sort priority:
    // 1. Teams with more capability matches first
    // 2. Teams with lower ETA / closer distance next
    candidates.sort((a, b) => {
      if (b.capabilityMatchCount !== a.capabilityMatchCount) {
        return b.capabilityMatchCount - a.capabilityMatchCount;
      }
      return (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999);
    });

    return candidates.slice(0, topK);
  }
}

export const geoService = new GeoService();
