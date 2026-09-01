import { resourceRepo } from '../db/resourceRepository.js';
import { sseHub } from './sseHub.js';
import { Coordinates, TeamStatus } from '../types/index.js';
import { calculateHaversineDistance, estimateEmergencyEtaMinutes } from '../utils/haversine.js';

export interface ActiveMission {
  incidentId: string;
  teamId: string;
  routeCoordinates: [number, number][]; // [lat, lng]
  currentStepIndex: number;
  totalSteps: number;
  initialDistanceKm: number;
  isComplete: boolean;
}

export class SimulationEngine {
  private activeMissions: Map<string, ActiveMission> = new Map();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    if (process.env.ENABLE_SIMULATION_TICK !== 'false') {
      this.startAutoTick(2000);
    }
  }

  /**
   * Registers a newly dispatched unit for real-time telemetry simulation along its route.
   */
  registerMission(
    incidentId: string,
    teamId: string,
    routeCoordinates: [number, number][] = [],
    initialDistanceKm: number = 5.0
  ): void {
    if (routeCoordinates.length < 2) {
      return;
    }

    const missionKey = `${incidentId}_${teamId}`;
    this.activeMissions.set(missionKey, {
      incidentId,
      teamId,
      routeCoordinates,
      currentStepIndex: 0,
      totalSteps: routeCoordinates.length,
      initialDistanceKm,
      isComplete: false,
    });
  }

  /**
   * Advances all active missions by one step along their respective road polylines.
   */
  async tick(): Promise<{ updatedMissionsCount: number; activeMissions: ActiveMission[] }> {
    if (this.activeMissions.size === 0) {
      return { updatedMissionsCount: 0, activeMissions: [] };
    }

    const missionsToComplete: string[] = [];

    for (const [key, mission] of this.activeMissions.entries()) {
      if (mission.isComplete) {
        continue;
      }

      mission.currentStepIndex = Math.min(mission.currentStepIndex + 1, mission.totalSteps - 1);
      const [currLat, currLng] = mission.routeCoordinates[mission.currentStepIndex];
      const newCoord: Coordinates = { lat: currLat, lng: currLng };

      // Update location in repository
      await resourceRepo.updateTeamLocation(mission.teamId, newCoord);

      // Remaining distance estimation
      const progressFraction = mission.currentStepIndex / (mission.totalSteps - 1);
      const remainingDistanceKm = parseFloat(
        Math.max(0, mission.initialDistanceKm * (1 - progressFraction)).toFixed(2)
      );
      const remainingEtaMin = estimateEmergencyEtaMinutes(remainingDistanceKm);

      let status: TeamStatus = 'EN_ROUTE';

      if (mission.currentStepIndex >= mission.totalSteps - 1) {
        status = 'ON_SCENE';
        mission.isComplete = true;
        missionsToComplete.push(key);
        await resourceRepo.updateTeamStatus(mission.teamId, 'ON_SCENE', mission.incidentId);
      } else {
        await resourceRepo.updateTeamStatus(mission.teamId, 'EN_ROUTE', mission.incidentId);
      }

      // Broadcast real-time telemetry update over SSE
      sseHub.broadcast('telemetry:update', {
        incidentId: mission.incidentId,
        teamId: mission.teamId,
        currentCoordinates: newCoord,
        remainingDistanceKm,
        etaMinutes: remainingEtaMin,
        status,
        progressPercentage: Math.round(progressFraction * 100),
      });
    }

    // Clean up completed missions
    for (const key of missionsToComplete) {
      const mission = this.activeMissions.get(key);
      if (mission) {
        sseHub.broadcast('incident:resolved', {
          incidentId: mission.incidentId,
          teamId: mission.teamId,
          message: `Unit ${mission.teamId} has successfully arrived on scene at incident ${mission.incidentId}.`,
        });
        this.activeMissions.delete(key);
      }
    }

    return {
      updatedMissionsCount: this.activeMissions.size,
      activeMissions: Array.from(this.activeMissions.values()),
    };
  }

  startAutoTick(intervalMs: number = 2000): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.tick().catch((err) => {
        console.error('[SimulationEngine Tick Error]', err);
      });
    }, intervalMs);
  }

  stopAutoTick(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getActiveMissions(): ActiveMission[] {
    return Array.from(this.activeMissions.values());
  }

  reset(): void {
    this.activeMissions.clear();
  }
}

export const simulationEngine = new SimulationEngine();
