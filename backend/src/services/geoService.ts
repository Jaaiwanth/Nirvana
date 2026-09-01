import { Coordinates, RescueTeam, ScoredCandidate } from '../types/index.js';
import { calculateHaversineDistance, estimateEmergencyEtaMinutes } from '../utils/haversine.js';

export class GeoService {
  /**
   * Filters and ranks rescue teams within a maximum radius (default 25 km),
   * scoring them by capability match and proximity.
   */
  filterCandidateTeams(
    incidentLocation: Coordinates,
    teams: RescueTeam[],
    requiredCapabilities: string[] = [],
    maxRadiusKm: number = 25.0,
    topK: number = 5
  ): ScoredCandidate[] {
    const candidates: ScoredCandidate[] = [];

    for (const team of teams) {
      const distanceKm = calculateHaversineDistance(team.currentLocation, incidentLocation);

      if (distanceKm <= maxRadiusKm) {
        // Count how many required capabilities this team satisfies
        let capabilityMatchCount = 0;
        if (requiredCapabilities.length > 0) {
          capabilityMatchCount = requiredCapabilities.filter((cap) =>
            team.capabilities.includes(cap)
          ).length;
        }

        const estimatedEta = estimateEmergencyEtaMinutes(distanceKm, team.speedFactor);

        candidates.push({
          team,
          haversineDistanceKm: distanceKm,
          etaMinutes: estimatedEta,
          capabilityMatchCount,
        });
      }
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
