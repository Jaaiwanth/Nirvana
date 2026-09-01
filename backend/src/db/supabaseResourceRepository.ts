import { supabase } from './supabaseClient.js';
import { RescueTeam, TeamStatus, Coordinates, Incident } from '../types/index.js';
import { IResourceRepository } from './resourceRepository.js';

export class SupabaseResourceRepository implements IResourceRepository {
  private mapTeamRow(row: any): RescueTeam {
    return {
      id: row.id,
      callsign: row.callsign,
      baseStationName: row.base_station_name,
      vehicleType: row.vehicle_type,
      status: row.status as TeamStatus,
      capabilities: row.capabilities || [],
      equipmentList: row.equipment_list || [],
      currentLocation: {
        lat: Number(row.lat),
        lng: Number(row.lng),
      },
      speedFactor: Number(row.speed_factor) || 1.0,
      currentIncidentId: row.current_incident_id || null,
    };
  }

  private mapIncidentRow(row: any): Incident {
    return {
      id: row.id,
      rawReport: row.raw_report,
      location: {
        lat: Number(row.lat),
        lng: Number(row.lng),
      },
      triage: row.triage || {},
      dispatchPlan: row.dispatch_plan || undefined,
      status: row.status,
      assignedTeamIds: row.assigned_team_ids || [],
      createdAt: row.created_at,
    };
  }

  async getAllTeams(): Promise<RescueTeam[]> {
    const { data, error } = await supabase
      .from('rescue_teams')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[Supabase getAllTeams Error]', error);
      return [];
    }
    return (data || []).map((row) => this.mapTeamRow(row));
  }

  async getAvailableTeams(): Promise<RescueTeam[]> {
    const { data, error } = await supabase
      .from('rescue_teams')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('id', { ascending: true });

    if (error) {
      console.error('[Supabase getAvailableTeams Error]', error);
      return [];
    }
    return (data || []).map((row) => this.mapTeamRow(row));
  }

  async getTeamById(id: string): Promise<RescueTeam | null> {
    const { data, error } = await supabase
      .from('rescue_teams')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapTeamRow(data);
  }

  async updateTeamStatus(
    id: string,
    status: TeamStatus,
    currentIncidentId: string | null = null
  ): Promise<RescueTeam> {
    const { data, error } = await supabase
      .from('rescue_teams')
      .update({
        status,
        current_incident_id: currentIncidentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[Supabase updateTeamStatus Error for ${id}]`, error);
      throw new Error(`Failed to update team ${id}: ${error.message}`);
    }
    return this.mapTeamRow(data);
  }

  async updateTeamLocation(id: string, location: Coordinates): Promise<void> {
    const { error } = await supabase
      .from('rescue_teams')
      .update({
        lat: location.lat,
        lng: location.lng,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error(`[Supabase updateTeamLocation Error for ${id}]`, error);
    }
  }

  async createIncident(incident: Incident): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        id: incident.id,
        raw_report: incident.rawReport,
        location: `SRID=4326;POINT(${incident.location.lng} ${incident.location.lat})`,
        lat: incident.location.lat,
        lng: incident.location.lng,
        triage: incident.triage,
        dispatch_plan: incident.dispatchPlan || null,
        status: incident.status,
        assigned_team_ids: incident.assignedTeamIds || [],
        created_at: incident.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase createIncident Error]', error);
      throw new Error(`Failed to insert incident: ${error.message}`);
    }
    return this.mapIncidentRow(data);
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapIncidentRow(data);
  }

  async listIncidents(): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase listIncidents Error]', error);
      return [];
    }
    return (data || []).map((row) => this.mapIncidentRow(row));
  }

  async updateIncidentStatus(
    id: string,
    status: 'REPORTED' | 'TRIAGED' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVED'
  ): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return this.mapIncidentRow(data);
  }

  async resetToSeed(): Promise<void> {
    // Reset teams to AVAILABLE and clear incidents
    await supabase.from('incidents').delete().neq('id', 'keep_schema_valid');
    await supabase.from('rescue_teams').update({
      status: 'AVAILABLE',
      current_incident_id: null,
      updated_at: new Date().toISOString(),
    }).neq('id', 'keep_valid');
  }

  /**
   * Native PostGIS Stored Procedure Call:
   * Uses PostGIS ST_DWithin and ST_Distance indexed with GIST.
   */
  async findCandidateRescueTeams(
    incidentLocation: Coordinates,
    requiredCapabilities: string[] = [],
    maxRadiusKm: number = 35.0
  ): Promise<any[]> {
    const { data, error } = await supabase.rpc('find_candidate_rescue_teams', {
      incident_lat: incidentLocation.lat,
      incident_lng: incidentLocation.lng,
      max_radius_km: maxRadiusKm,
      required_caps: requiredCapabilities,
    });

    if (error) {
      console.warn('[Supabase PostGIS RPC Warning]', error);
      return [];
    }
    return data || [];
  }
}
