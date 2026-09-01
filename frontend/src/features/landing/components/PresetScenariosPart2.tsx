import React from 'react';
import { Play, Flame, Zap, Building2, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { StatusPill } from '../../../components/ui/status-pill';
import type { PresetScenario } from '../../../types/api';

interface PresetScenariosPartProps {
  onTriggerScenario: (scenarioId: string) => void;
  isLoading?: boolean;
}

const BATCH_2_SCENARIOS: Array<PresetScenario & { icon: React.ComponentType<{ className?: string }>; category: string }> = [
  {
    id: 'scen_substation_06',
    title: 'High-Voltage Substation Fire',
    category: 'Electrical / Class C',
    icon: Zap,
    locationName: 'Grid Substation 4',
    coordinates: { lat: 12.9892, lng: 77.6124 },
    severity: 'HIGH',
    description: 'Transformer arc flash ignited dielectric oil tank. Water strictly prohibited.',
    expectedType: 'electrical',
    expectedPrimaryCapabilities: ['dry_chemical_extinguisher', 'class_c_rated', 'thermal_imager'],
  },
  {
    id: 'scen_trench_07',
    title: 'Metro Construction Cave-in',
    category: 'Confined Space USAR',
    icon: Building2,
    locationName: 'Subway Extension Pit',
    coordinates: { lat: 12.9688, lng: 77.5982 },
    severity: 'CRITICAL',
    description: '6-meter excavation wall collapsed. 2 workers buried with unstable soil.',
    expectedType: 'trench_collapse',
    expectedPrimaryCapabilities: ['trench_shoring', 'confined_space', 'air_monitoring'],
  },
  {
    id: 'scen_wildfire_08',
    title: 'Urban Fringe Wildland Fire',
    category: 'Wildland Interface',
    icon: Flame,
    locationName: 'Ridge Boundary Forest',
    coordinates: { lat: 12.9945, lng: 77.5821 },
    severity: 'HIGH',
    description: 'Fast-moving grass fire threatening 15 residential dwellings along hillside.',
    expectedType: 'wildfire',
    expectedPrimaryCapabilities: ['wildland_pump', 'brush_gear', 'foam_eductor'],
  },
  {
    id: 'scen_radiation_09',
    title: 'Radiotherapy Source Leak',
    category: 'CBRN / Radiation',
    icon: ShieldAlert,
    locationName: 'Oncology Research Lab',
    coordinates: { lat: 12.9612, lng: 77.6154 },
    severity: 'CRITICAL',
    description: 'Damaged shielding container on medical isotope. Elevated gamma levels detected.',
    expectedType: 'radiological',
    expectedPrimaryCapabilities: ['radiation_detector', 'lead_shielding', 'hazmat_containment'],
  },
  {
    id: 'scen_aircraft_10',
    title: 'Aircraft Runway Overshoot',
    category: 'ARFF / Aviation Foam',
    icon: AlertTriangle,
    locationName: 'Airfield Runway 09',
    coordinates: { lat: 12.9512, lng: 77.6214 },
    severity: 'CRITICAL',
    description: 'Turboprop collapsed landing gear into gravel runoff. High-octane fuel spill.',
    expectedType: 'aircraft',
    expectedPrimaryCapabilities: ['arff_foam_cannon', 'extrication_tools', 'fire_suppression'],
  },
];

export const PresetScenariosPart2: React.FC<PresetScenariosPartProps> = ({
  onTriggerScenario,
  isLoading,
}) => {
  return (
    <section
      id="benchmarks-part2"
      className="w-full h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#07080c] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: Capability Matching Matrix & Contingency SVG */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="text-sky-400 font-bold">CAPABILITY MATCHER & MUTUAL AID</span>
              <span>ZERO ALLOCATION MISMATCH</span>
            </div>

            <svg viewBox="0 0 500 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              {/* Incident Hazard Column */}
              <text x="30" y="30" fill="#a1a1aa" fontSize="9" fontWeight="bold" fontFamily="monospace">INCIDENT HAZARDS</text>
              <rect x="20" y="45" width="130" height="30" rx="4" fill="#450a0a" />
              <text x="30" y="64" fill="#fca5a5" fontSize="8" fontFamily="monospace">06: Class-C Electric</text>

              <rect x="20" y="85" width="130" height="30" rx="4" fill="#431407" />
              <text x="30" y="104" fill="#fdba74" fontSize="8" fontFamily="monospace">07: Trench Soil Collapse</text>

              <rect x="20" y="125" width="130" height="30" rx="4" fill="#422006" />
              <text x="30" y="144" fill="#fde047" fontSize="8" fontFamily="monospace">08: Wildland Brush</text>

              <rect x="20" y="165" width="130" height="30" rx="4" fill="#3b0764" />
              <text x="30" y="184" fill="#d8b4fe" fontSize="8" fontFamily="monospace">09: Gamma Radiation</text>

              <rect x="20" y="205" width="130" height="30" rx="4" fill="#032b40" />
              <text x="30" y="224" fill="#7dd3fc" fontSize="8" fontFamily="monospace">10: Avgas ARFF Foam</text>

              {/* Connecting Logic Channels */}
              <path d="M 150 60 L 250 140" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 150 100 L 250 140" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 150 140 L 250 140" stroke="#10b981" strokeWidth="2" opacity="0.8" />
              <path d="M 150 180 L 250 140" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 150 220 L 250 140" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

              {/* Central Matching Scorer */}
              <g transform="translate(250, 140)">
                <circle r="32" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
                <text y="-4" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">COMPOSITE</text>
                <text y="8" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SCORER</text>
                <text y="20" fill="#10b981" fontSize="7" textAnchor="middle" fontFamily="monospace">100% MATCH</text>
              </g>

              {/* Dispatched Unit Column (Right) */}
              <text x="360" y="30" fill="#a1a1aa" fontSize="9" fontWeight="bold" fontFamily="monospace">ALLOCATED ASSETS</text>
              <rect x="350" y="45" width="130" height="30" rx="4" fill="#064e3b" />
              <text x="360" y="64" fill="#6ee7b7" fontSize="8" fontFamily="monospace">Dry Chem Tender (CO2)</text>

              <rect x="350" y="85" width="130" height="30" rx="4" fill="#064e3b" />
              <text x="360" y="104" fill="#6ee7b7" fontSize="8" fontFamily="monospace">Heavy Shoring Tender</text>

              <rect x="350" y="125" width="130" height="30" rx="4" fill="#064e3b" />
              <text x="360" y="144" fill="#6ee7b7" fontSize="8" fontFamily="monospace">Wildland Attack Unit</text>

              <rect x="350" y="165" width="130" height="30" rx="4" fill="#064e3b" />
              <text x="360" y="184" fill="#6ee7b7" fontSize="8" fontFamily="monospace">Hazmat Lead Shielder</text>

              <rect x="350" y="205" width="130" height="30" rx="4" fill="#064e3b" />
              <text x="360" y="224" fill="#6ee7b7" fontSize="8" fontFamily="monospace">ARFF Airport Crash</text>

              <path d="M 282 140 L 350 60" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 282 140 L 350 100" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 282 140 L 350 140" stroke="#10b981" strokeWidth="2" />
              <path d="M 282 140 L 350 180" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 282 140 L 350 220" stroke="#10b981" strokeWidth="1.5" />

              {/* Bottom Note */}
              <text x="250" y="260" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">
                Cross-district substitute dispatches automatically if local asset committed
              </text>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 Scenarios Cards + EOC Launch Button (No borders) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
              BENCHMARK CATALOG // PART 2
            </span>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
              SCENARIOS 06–10
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mb-1">
            Industrial, CBRN & Aviation Disasters
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-4">
            Tests specialized equipment pairing, hazardous material bans (e.g. water prohibition on Class-C), and cross-trained mutual aid.
          </p>

          <div className="flex flex-col gap-2">
            {BATCH_2_SCENARIOS.map((scen) => {
              const Icon = scen.icon;
              const isCritical = scen.severity === 'CRITICAL';
              return (
                <div
                  key={scen.id}
                  className="border-0 border-none bg-zinc-900/35 hover:bg-zinc-900/65 transition-colors rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-zinc-800/50 text-sky-400 shrink-0 border-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{scen.title}</h4>
                        <StatusPill variant={isCritical ? 'critical' : 'warning'}>
                          {scen.severity}
                        </StatusPill>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{scen.description}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => onTriggerScenario(scen.id)}
                    disabled={isLoading}
                    variant="primary"
                    size="sm"
                    className="h-7 px-2.5 text-[11px] gap-1 bg-sky-600 hover:bg-sky-500 border-0 shadow-none shrink-0 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Dispatch</span>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Bottom EOC Command Console Trigger */}
          <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">
              Ready for real-time operations?
            </span>
            <button
              onClick={() => onTriggerScenario('scen_collapse_01')}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <span>Launch Live EOC Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
