import { resourceRepo } from '../db/resourceRepository.js';
import { sseHub } from './sseHub.js';
import { Coordinates, TeamStatus } from '../types/index.js';
import { estimateEmergencyEtaMinutes } from '../utils/haversine.js';

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
    let finalCoords = routeCoordinates;
    if (finalCoords.length < 2) {
      finalCoords = [
        [12.9716, 77.5946],
        [12.9725, 77.5960],
        [12.9735, 77.5975],
        [12.9745, 77.5990],
        [12.9755, 77.6005],
      ];
    }

    const missionKey = `${incidentId}_${teamId}`;
    this.activeMissions.set(missionKey, {
      incidentId,
      teamId,
      routeCoordinates: finalCoords,
      currentStepIndex: 0,
      totalSteps: finalCoords.length,
      initialDistanceKm: Math.max(0.5, initialDistanceKm),
      isComplete: false,
    });
  }

  /**
   * Advances all active missions smoothly along their respective road polylines.
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

      // Smooth step increment: advance across ~12 ticks
      const stepIncrement = Math.max(1, Math.ceil(mission.totalSteps / 12));
      mission.currentStepIndex = Math.min(mission.currentStepIndex + stepIncrement, mission.totalSteps - 1);

      const [currLat, currLng] = mission.routeCoordinates[mission.currentStepIndex];
      const newCoord: Coordinates = { lat: currLat, lng: currLng };

      // Update location in repository
      await resourceRepo.updateTeamLocation(mission.teamId, newCoord);

      // Remaining distance estimation with accurate formula
      const isDestinationReached = mission.currentStepIndex >= mission.totalSteps - 1;
      const progressFraction = mission.totalSteps > 1 ? mission.currentStepIndex / (mission.totalSteps - 1) : 1;
      const progressPercentage = isDestinationReached ? 100 : Math.min(99, Math.round(progressFraction * 100));

      const remainingDistanceKm = isDestinationReached
        ? 0.0
        : parseFloat(Math.max(0.01, mission.initialDistanceKm * (1 - progressFraction)).toFixed(2));

      const remainingEtaMin = isDestinationReached
        ? 0.0
        : estimateEmergencyEtaMinutes(remainingDistanceKm);

      let status: TeamStatus = 'EN_ROUTE';
      let speedKmh = 54;

      // Compute heading to face next step along the street
      let heading = 90;
      if (!isDestinationReached && mission.currentStepIndex < mission.totalSteps - 1) {
        const [nextLat, nextLng] = mission.routeCoordinates[mission.currentStepIndex + 1];
        const dLng = nextLng - currLng;
        const dLat = nextLat - currLat;
        heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
        if (heading < 0) heading += 360;
      }

      if (isDestinationReached) {
        status = 'ON_SCENE';
        speedKmh = 0;
        mission.isComplete = true;
        missionsToComplete.push(key);
        await resourceRepo.updateTeamStatus(mission.teamId, 'ON_SCENE', mission.incidentId);
        await resourceRepo.updateIncidentStatus(mission.incidentId, 'ON_SCENE');
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
        speedKmh,
        heading,
        status,
        progressPercentage,
      });
    }

    // Auto-close and resolve missions once destination is reached
    for (const key of missionsToComplete) {
      const mission = this.activeMissions.get(key);
      if (mission) {
        this.activeMissions.delete(key);
        // Delay 2.5 seconds so user visibly sees ON_SCENE status before task auto-closes to RESOLVED
        setTimeout(async () => {
          try {
            await resourceRepo.updateIncidentStatus(mission.incidentId, 'RESOLVED');
            await resourceRepo.updateTeamStatus(mission.teamId, 'AVAILABLE', null);
            sseHub.broadcast('incident:resolved', {
              incidentId: mission.incidentId,
              teamId: mission.teamId,
              message: `Unit ${mission.teamId} secured scene at incident ${mission.incidentId}. Task AUTO-CLOSED & RESOLVED.`,
            });
          } catch (err) {
            console.error('[AutoClose Error]', err);
          }
        }, 2500);
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
