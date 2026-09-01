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

  // Medical Trauma & Cardiac
  if (text.includes('cardiac') || text.includes('heart') || text.includes('cpr') || (text.includes('collapsed') && (text.includes('passenger') || text.includes('person') || text.includes('man') || text.includes('woman')))) {
    incidentType = 'medical_trauma';
    severity = 'CRITICAL';
    requiredCapabilities.push('als_medical', 'cardiac_life_support', 'patient_transport');
  } 
  // Structural Collapse
  else if (text.includes('building collapse') || text.includes('cave-in') || (text.includes('collapse') && (text.includes('structure') || text.includes('wall') || text.includes('ceiling') || text.includes('slab') || text.includes('foundation') || text.includes('warehouse')))) {
    incidentType = 'structural_collapse';
    severity = 'CRITICAL';
    requiredCapabilities.push('heavy_rescue', 'extrication_tools', 'structural_shoring');
    trappedVictims = true;
    estimatedVictims = 3;
  } 
  // Fire & Explosions
  else if (text.includes('fire') || text.includes('blaze') || text.includes('smoke') || text.includes('flames')) {
    incidentType = 'fire';
    severity = text.includes('heavy') || text.includes('explosion') || text.includes('trapped') ? 'CRITICAL' : 'HIGH';
    requiredCapabilities.push('fire_suppression');
    if (text.includes('high-rise') || text.includes('tower') || text.includes('floor')) {
      requiredCapabilities.push('aerial_master_stream', 'high_angle_rescue');
    }
    if (text.includes('oil') || text.includes('chemical') || text.includes('industrial') || text.includes('transformer')) {
      requiredCapabilities.push('foam_fire_suppression', 'gas_leak_isolation');
    }
  } 
  // Traffic Collisions
  else if (text.includes('crash') || text.includes('collision') || text.includes('pileup') || text.includes('accident')) {
    incidentType = 'traffic_collision';
    severity = text.includes('trapped') || text.includes('pinned') ? 'CRITICAL' : 'HIGH';
    requiredCapabilities.push('extrication_tools', 'als_medical');
    if (text.includes('trapped') || text.includes('pinned')) {
      trappedVictims = true;
    }
  } 
  // Hazmat & Gas Leaks
  else if (text.includes('chemical') || text.includes('chlorine') || text.includes('gas leak') || text.includes('gas main') || text.includes('rupture') || text.includes('toxic') || text.includes('fumes')) {
    incidentType = 'hazmat';
    severity = 'HIGH';
    requiredCapabilities.push('hazmat_containment', 'chemical_detection', 'decontamination');
    if (text.includes('gas')) {
      requiredCapabilities.push('gas_leak_isolation');
    }
  } 
  // Floods & Water Distress
  else if (text.includes('flood') || text.includes('drowning') || text.includes('water') || text.includes('river') || text.includes('lake')) {
    incidentType = 'flood';
    severity = 'HIGH';
    requiredCapabilities.push('fast_water_rescue', 'flood_evacuation');
  } 
  // Missing Persons / Wilderness
  else if (text.includes('missing') || text.includes('lost') || text.includes('hiker') || text.includes('child')) {
    incidentType = 'other';
    severity = 'HIGH';
    requiredCapabilities.push('search_dogs', 'aerial_reconnaissance', 'scent_tracking');
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

  // Check for fleet exhaustion (no available unit matched the required capabilities)
  let isExhaustionSubstitute = false;
  let exhaustionWarning: string | undefined = undefined;

  if (triage.requiredCapabilities.length > 0 && primaryCandidate.capabilityMatchCount === 0) {
    isExhaustionSubstitute = true;
    exhaustionWarning = `⚠️ FLEET EXHAUSTION NOTICE: All specialized units for required capabilities [${triage.requiredCapabilities.join(', ')}] are currently committed on other incidents. Dispatched nearest available unit ${primaryTeam.callsign} (${primaryTeam.vehicleType}) as emergency cross-trained substitute.`;
  }

  return {
    primaryTeam,
    secondarySupport,
    reasoning: isExhaustionSubstitute
      ? `${exhaustionWarning} Estimated ETA: ${primaryTeam.etaMinutes} min.`
      : `[Failsafe Rule Engine] Dispatched ${primaryTeam.callsign} (${primaryTeam.vehicleType}) with estimated ETA ${primaryTeam.etaMinutes} min based on maximum capability match (${primaryCandidate.capabilityMatchCount} matched). ${
          secondarySupport.length > 0 ? `Assigned ${secondarySupport[0].callsign} for emergency medical support.` : ''
        }`,
    priority: triage.severity,
    isFallback: true,
    isExhaustionSubstitute,
    exhaustionWarning,
  };
}
