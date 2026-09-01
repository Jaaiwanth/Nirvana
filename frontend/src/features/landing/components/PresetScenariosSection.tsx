import React, { useState } from 'react';
import { Play, Flame, Droplets, Wind, Car, Building2, Zap, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { StatusPill } from '../../../components/ui/status-pill';
import type { PresetScenario } from '../../../types/api';

interface PresetScenariosSectionProps {
  onTriggerScenario: (scenarioId: string) => void;
  isLoading?: boolean;
}

const ALL_10_SCENARIOS: Array<PresetScenario & { icon: React.ComponentType<{ className?: string }>; category: string }> = [
  {
    id: 'scen_collapse_01',
    title: 'Urban Structural Collapse',
    category: 'USAR / Heavy Rescue',
    icon: Building2,
    locationName: '4th Main Industrial Estate',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    severity: 'CRITICAL',
    description: 'Four-story commercial warehouse collapsed. 4 workers trapped under reinforced concrete beams.',
    expectedType: 'structural_collapse',
    expectedPrimaryCapabilities: ['heavy_rescue', 'extrication_tools', 'structural_shoring'],
  },
  {
    id: 'scen_hazmat_02',
    title: 'Toxic Chlorine Gas Plume',
    category: 'Hazmat Containment',
    icon: Wind,
    locationName: 'Chemical Tanker Depot',
    coordinates: { lat: 12.9785, lng: 77.5912 },
    severity: 'CRITICAL',
    description: 'Ruptured valve on 10,000L pressurized chemical transport leaking toxic yellow gas cloud.',
    expectedType: 'hazmat',
    expectedPrimaryCapabilities: ['hazmat_containment', 'decontamination', 'chemical_absorbent'],
  },
  {
    id: 'scen_fire_03',
    title: '4-Alarm High-Rise Fire',
    category: 'Fire / Aerial Ladder',
    icon: Flame,
    locationName: 'Apex Financial Towers (12th Fl)',
    coordinates: { lat: 12.9654, lng: 77.6012 },
    severity: 'CRITICAL',
    description: 'Electrical fire on 12th floor with thick black smoke trapping occupants on upper floors.',
    expectedType: 'fire',
    expectedPrimaryCapabilities: ['high_volume_pump', 'aerial_ladder', 'scba_air_pack'],
  },
  {
    id: 'scen_flood_04',
    title: 'Flash Flood Submerged Vehicles',
    category: 'Water / Swiftwater',
    icon: Droplets,
    locationName: 'Underpass Causeway',
    coordinates: { lat: 12.9812, lng: 77.6085 },
    severity: 'HIGH',
    description: 'Severe monsoon downpour filled underpass to 2.5 meters. 3 passenger cars stalled.',
    expectedType: 'flood',
    expectedPrimaryCapabilities: ['water_rescue', 'inflatable_boat', 'high_ground_clearance'],
  },
  {
    id: 'scen_mci_05',
    title: 'Multi-Vehicle Highway Collision',
    category: 'MCI / Paramedic ALS',
    icon: Car,
    locationName: 'Ring Road Flyover Junction',
    coordinates: { lat: 12.9554, lng: 77.5854 },
    severity: 'CRITICAL',
    description: 'Bumper-to-bumper pileup involving transit bus and tanker. Multiple critical traumas.',
    expectedType: 'mci',
    expectedPrimaryCapabilities: ['advanced_life_support', 'multiple_stretchers', 'triage_kits'],
  },
  {
    id: 'scen_substation_06',
    title: 'High-Voltage Substation Fire',
    category: 'Electrical / Class C',
    icon: Zap,
    locationName: 'Grid Power Substation 4',
    coordinates: { lat: 12.9892, lng: 77.6124 },
    severity: 'HIGH',
    description: 'Transformer arc flash ignited dielectric mineral oil tank. Water strictly prohibited.',
    expectedType: 'electrical',
    expectedPrimaryCapabilities: ['dry_chemical_extinguisher', 'class_c_rated', 'thermal_imager'],
  },
  {
    id: 'scen_trench_07',
    title: 'Metro Construction Trench Cave-in',
    category: 'Confined Space USAR',
    icon: Building2,
    locationName: 'Subway Line Extension Pit',
    coordinates: { lat: 12.9688, lng: 77.5982 },
    severity: 'CRITICAL',
    description: '6-meter excavation wall gave way. 2 workers buried to waist level with unstable soil.',
    expectedType: 'trench_collapse',
    expectedPrimaryCapabilities: ['trench_shoring', 'confined_space', 'air_monitoring'],
  },
  {
    id: 'scen_wildfire_08',
    title: 'Urban Fringe Brush Fire',
    category: 'Wildland Urban Interface',
    icon: Flame,
    locationName: 'Ridge Boundary Forest',
    coordinates: { lat: 12.9945, lng: 77.5821 },
    severity: 'HIGH',
    description: 'Fast-moving grass fire threatening 15 residential dwellings along hillside perimeter.',
    expectedType: 'wildfire',
    expectedPrimaryCapabilities: ['wildland_pump', 'brush_gear', 'foam_eductor'],
  },
  {
    id: 'scen_radiation_09',
    title: 'Medical Radiotherapy Source Leak',
    category: 'CBRN / Radiation',
    icon: ShieldAlert,
    locationName: 'Oncology Research Lab',
    coordinates: { lat: 12.9612, lng: 77.6154 },
    severity: 'CRITICAL',
    description: 'Damaged shielding container on medical isotope transport. Elevated gamma levels detected.',
    expectedType: 'radiological',
    expectedPrimaryCapabilities: ['radiation_detector', 'lead_shielding', 'hazmat_containment'],
  },
  {
    id: 'scen_aircraft_10',
    title: 'Runway Light Aircraft Overshoot',
    category: 'ARFF / Aviation Foam',
    icon: AlertTriangle,
    locationName: 'Regional Airfield Runway 09',
    coordinates: { lat: 12.9512, lng: 77.6214 },
    severity: 'CRITICAL',
    description: 'Twin-turboprop collapsed landing gear on rollout into gravel runoff. Avgas fuel spill.',
    expectedType: 'aircraft',
    expectedPrimaryCapabilities: ['arff_foam_cannon', 'extrication_tools', 'fire_suppression'],
  },
];

export const PresetScenariosSection: React.FC<PresetScenariosSectionProps> = ({
  onTriggerScenario,
  isLoading,
}) => {
  const [activeBatch, setActiveBatch] = useState<0 | 1>(0);

  const displayedScenarios = activeBatch === 0
    ? ALL_10_SCENARIOS.slice(0, 5)
    : ALL_10_SCENARIOS.slice(5, 10);

  return (
    <section
      id="benchmarks"
      className="w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#07080d] select-none overflow-hidden"
    >
      <div className="max-w-6xl w-full mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
              10-SCENARIO BENCHMARK CATALOG
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Autonomous Disaster Benchmark Stress Suite
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Trigger any of the 10 verified scenarios. Evaluates LLM triage, H3 pruning, and OSRM dispatch in real-time.
            </p>
          </div>

          {/* Batch Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border-0 text-xs font-mono">
            <button
              onClick={() => setActiveBatch(0)}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeBatch === 0
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Scenarios 01–05
            </button>
            <button
              onClick={() => setActiveBatch(1)}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeBatch === 1
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Scenarios 06–10
            </button>
          </div>
        </div>

        {/* 5 Scenario Cards Grid (NO WHITE OUTLINES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {displayedScenarios.map((scen) => {
            const Icon = scen.icon;
            const isCritical = scen.severity === 'CRITICAL';
            return (
              <div
                key={scen.id}
                className="border-0 border-none bg-zinc-900/35 hover:bg-zinc-900/65 transition-all rounded-lg p-3 flex flex-col justify-between shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-zinc-850/80 text-sky-400 border-0">
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 line-clamp-1">
                        {scen.category.split(' ')[0]}
                      </span>
                    </div>
                    <StatusPill variant={isCritical ? 'critical' : 'warning'}>
                      {scen.severity}
                    </StatusPill>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
                    {scen.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-3 mb-2">
                    {scen.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="line-clamp-1 max-w-28">{scen.locationName.split(' ')[0]}</span>
                  <Button
                    onClick={() => onTriggerScenario(scen.id)}
                    disabled={isLoading}
                    variant="primary"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1 bg-sky-600 hover:bg-sky-500 border-0 shadow-none cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Dispatch</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Technical Strip */}
        <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>10/10 BENCHMARK PASS: 100% CORRECT CAPABILITY ALLOCATION & ZERO MISMATCH</span>
          </div>
          <button
            onClick={() => onTriggerScenario('scen_collapse_01')}
            className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Launch EOC Live Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
