import { createRequire } from 'module';
import { RescueTeam, TeamStatus, Coordinates, Incident } from '../types/index.js';

const require = createRequire(import.meta.url);
const initialSeedData: RescueTeam[] = require('../data/rescue_teams.seed.json');

export interface IResourceRepository {
  getAllTeams(): Promise<RescueTeam[]>;
  getAvailableTeams(): Promise<RescueTeam[]>;
  getTeamById(id: string): Promise<RescueTeam | null>;
  updateTeamStatus(id: string, status: TeamStatus, currentIncidentId?: string | null): Promise<RescueTeam>;
  updateTeamLocation(id: string, location: Coordinates): Promise<void>;
  createIncident(incident: Incident): Promise<Incident>;
  getIncidentById(id: string): Promise<Incident | null>;
  listIncidents(): Promise<Incident[]>;
  resetToSeed(): Promise<void>;
}

export class InMemoryResourceRepository implements IResourceRepository {
  private teamsMap: Map<string, RescueTeam> = new Map();
  private incidentsMap: Map<string, Incident> = new Map();

  constructor() {
    this.seed();
  }

  private seed(): void {
    this.teamsMap.clear();
    for (const team of initialSeedData) {
      this.teamsMap.set(team.id, { ...team });
    }
  }

  async getAllTeams(): Promise<RescueTeam[]> {
    return Array.from(this.teamsMap.values());
  }

  async getAvailableTeams(): Promise<RescueTeam[]> {
    return Array.from(this.teamsMap.values()).filter((t) => t.status === 'AVAILABLE');
  }

  async getTeamById(id: string): Promise<RescueTeam | null> {
    return this.teamsMap.get(id) || null;
  }

  async updateTeamStatus(
    id: string,
    status: TeamStatus,
    currentIncidentId: string | null = null
  ): Promise<RescueTeam> {
    const team = this.teamsMap.get(id);
    if (!team) {
      throw new Error(`Team with ID "${id}" not found.`);
    }
    team.status = status;
    team.currentIncidentId = currentIncidentId;
    this.teamsMap.set(id, team);
    return team;
  }

  async updateTeamLocation(id: string, location: Coordinates): Promise<void> {
    const team = this.teamsMap.get(id);
    if (!team) {
      throw new Error(`Team with ID "${id}" not found.`);
    }
    team.currentLocation = location;
    this.teamsMap.set(id, team);
  }

  async createIncident(incident: Incident): Promise<Incident> {
    this.incidentsMap.set(incident.id, incident);
    return incident;
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    return this.incidentsMap.get(id) || null;
  }

  async updateIncidentStatus(
    id: string,
    status: 'REPORTED' | 'TRIAGED' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVED'
  ): Promise<Incident | null> {
    const incident = this.incidentsMap.get(id);
    if (incident) {
      incident.status = status;
      this.incidentsMap.set(id, incident);
      return incident;
    }
    return null;
  }

  async listIncidents(): Promise<Incident[]> {
    return Array.from(this.incidentsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async resetToSeed(): Promise<void> {
    this.seed();
    this.incidentsMap.clear();
  }
}

export const resourceRepo = new InMemoryResourceRepository();
