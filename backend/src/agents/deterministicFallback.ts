import { IncidentTriage, ScoredCandidate, DispatchPlan, DispatchedTeamInfo } from '../types/index.js';

/**
 * Deterministic keyword-based emergency triage parser.
 * Used as a sub-5ms failsafe fallback if LLM APIs time out or fail.
 */
export function deterministicTriage(reportText: string): IncidentTriage {
  const text = reportText.toLowerCase();

  let incidentType: IncidentTriage['incidentType'] = 'other';
  let severity: IncidentTriage['severity'] = 'MEDIUM';
  const requiredCapabilities: string[] = [];
  let estimatedVictims = 1;
  let trappedVictims = false;

  if (text.includes('collapse') || text.includes('rubble') || text.includes('building fall')) {
    incidentType = 'structural_collapse';
    severity = 'CRITICAL';
    requiredCapabilities.push('heavy_rescue', 'extrication_tools', 'structural_shoring');
    trappedVictims = true;
    estimatedVictims = 3;
  } else if (text.includes('fire') || text.includes('blaze') || text.includes('smoke')) {
    incidentType = 'fire';
    severity = text.includes('heavy') || text.includes('explosion') ? 'CRITICAL' : 'HIGH';
    requiredCapabilities.push('fire_suppression', 'extrication_tools');
    if (text.includes('chemical') || text.includes('industrial')) {
      requiredCapabilities.push('foam_fire_suppression', 'hazmat_containment');
    }
  } else if (text.includes('crash') || text.includes('collision') || text.includes('pileup') || text.includes('accident')) {
    incidentType = 'traffic_collision';
    severity = text.includes('trapped') || text.includes('pinned') ? 'CRITICAL' : 'HIGH';
    requiredCapabilities.push('extrication_tools', 'als_medical');
    if (text.includes('trapped') || text.includes('pinned')) {
      trappedVictims = true;
    }
  } else if (text.includes('chemical') || text.includes('gas leak') || text.includes('toxic') || text.includes('fumes')) {
    incidentType = 'hazmat';
    severity = 'HIGH';
    requiredCapabilities.push('hazmat_containment', 'chemical_detection', 'decontamination');
  } else if (text.includes('flood') || text.includes('drowning') || text.includes('water') || text.includes('river')) {
    incidentType = 'flood';
    severity = 'HIGH';
    requiredCapabilities.push('fast_water_rescue', 'flood_evacuation');
  } else if (text.includes('heart') || text.includes('cardiac') || text.includes('unconscious') || text.includes('bleeding')) {
    incidentType = 'medical_trauma';
    severity = 'CRITICAL';
    requiredCapabilities.push('als_medical', 'trauma_care');
  }

  // Always ensure ALS medical support for critical cases
  if (severity === 'CRITICAL' && !requiredCapabilities.includes('als_medical')) {
    requiredCapabilities.push('als_medical');
  }

  return {
    incidentType,
    severity,
    requiredCapabilities,
    estimatedVictims,
    trappedVictims,
    summary: `[Deterministic Fallback] Categorized as ${severity} ${incidentType} requiring ${requiredCapabilities.join(', ')}.`,
  };
}

/**
 * Deterministic multi-criteria unit dispatch selector.
 */
export function deterministicDispatch(
  triage: IncidentTriage,
  candidates: ScoredCandidate[]
): DispatchPlan {
  if (candidates.length === 0) {
    throw new Error('No emergency units available within operational range.');
  }

  // Primary team: highest capability match, then lowest ETA
  const primaryCandidate = candidates[0];
  const primaryTeam: DispatchedTeamInfo = {
    id: primaryCandidate.team.id,
    callsign: primaryCandidate.team.callsign,
    vehicleType: primaryCandidate.team.vehicleType,
    distanceKm: primaryCandidate.drivingDistanceKm ?? primaryCandidate.haversineDistanceKm,
    etaMinutes: primaryCandidate.etaMinutes ?? 10.0,
    routeCoordinates: primaryCandidate.routeCoordinates,
  };

  // Secondary support: if critical or trapped, find the nearest ambulance
  const secondarySupport: DispatchedTeamInfo[] = [];
  if (triage.severity === 'CRITICAL' || triage.trappedVictims) {
    const ambulanceCandidate = candidates.find(
      (c) => c.team.id !== primaryCandidate.team.id && c.team.capabilities.includes('als_medical')
    );
    if (ambulanceCandidate) {
      secondarySupport.push({
        id: ambulanceCandidate.team.id,
        callsign: ambulanceCandidate.team.callsign,
        vehicleType: ambulanceCandidate.team.vehicleType,
        distanceKm: ambulanceCandidate.drivingDistanceKm ?? ambulanceCandidate.haversineDistanceKm,
        etaMinutes: ambulanceCandidate.etaMinutes ?? 12.0,
        routeCoordinates: ambulanceCandidate.routeCoordinates,
      });
    }
  }

  return {
    primaryTeam,
    secondarySupport,
    reasoning: `[Failsafe Rule Engine] Dispatched ${primaryTeam.callsign} (${primaryTeam.vehicleType}) with estimated ETA ${primaryTeam.etaMinutes} min based on maximum capability match. ${
      secondarySupport.length > 0 ? `Assigned ${secondarySupport[0].callsign} for emergency medical support.` : ''
    }`,
    priority: triage.severity,
    isFallback: true,
  };
}
