import React from 'react';
import { Play, Flame, Droplets, Wind, Car, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { StatusPill } from '../../../components/ui/status-pill';
import type { PresetScenario } from '../../../types/api';

interface PresetScenariosPartProps {
  onTriggerScenario: (scenarioId: string) => void;
  isLoading?: boolean;
}

const BATCH_1_SCENARIOS: Array<PresetScenario & { icon: React.ComponentType<{ className?: string }>; category: string }> = [
  {
    id: 'scen_collapse_01',
    title: 'Urban Structural Collapse',
    category: 'USAR / Heavy Rescue',
    icon: Building2,
    locationName: '4th Main Industrial Estate',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    severity: 'CRITICAL',
    description: 'Four-story warehouse collapsed. 4 workers trapped under reinforced concrete beams.',
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
    description: 'Ruptured valve on 10,000L pressurized transport leaking toxic yellow gas cloud.',
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
    description: 'Electrical fire on 12th floor with thick black smoke trapping occupants.',
    expectedType: 'fire',
    expectedPrimaryCapabilities: ['high_volume_pump', 'aerial_ladder', 'scba_air_pack'],
  },
  {
    id: 'scen_flood_04',
    title: 'Flash Flood Submerged Cars',
    category: 'Water / Swiftwater',
    icon: Droplets,
    locationName: 'Underpass Causeway',
    coordinates: { lat: 12.9812, lng: 77.6085 },
    severity: 'HIGH',
    description: 'Monsoon downpour filled underpass to 2.5 meters. 3 passenger cars submerged.',
    expectedType: 'flood',
    expectedPrimaryCapabilities: ['water_rescue', 'inflatable_boat', 'high_ground_clearance'],
  },
  {
    id: 'scen_mci_05',
    title: 'Multi-Vehicle Highway MCI',
    category: 'MCI / Paramedic ALS',
    icon: Car,
    locationName: 'Ring Road Flyover',
    coordinates: { lat: 12.9554, lng: 77.5854 },
    severity: 'CRITICAL',
    description: 'Bumper-to-bumper pileup with transit bus and chemical truck. Multiple traumas.',
    expectedType: 'mci',
    expectedPrimaryCapabilities: ['advanced_life_support', 'multiple_stretchers', 'triage_kits'],
  },
];

export const PresetScenariosPart1: React.FC<PresetScenariosPartProps> = ({
  onTriggerScenario,
  isLoading,
}) => {
  return (
    <section
      id="benchmarks-part1"
      className="w-full h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#07080c] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: 5 Scenario Cards (No outlines) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
              BENCHMARK CATALOG // PART 1
            </span>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
              SCENARIOS 01–05
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mb-1">
            Structural & Urban Crisis Benchmarks
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-4">
            Test immediate autonomous triage, spatial candidate pruning, and turn-by-turn routing with one click.
          </p>

          <div className="flex flex-col gap-2">
            {BATCH_1_SCENARIOS.map((scen) => {
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
        </div>

        {/* RIGHT COLUMN: Multi-Incident City Vector Grid SVG */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="text-sky-400 font-bold">DISASTER COORDINATE MATRIX</span>
              <span>METROPOLITAN GRID</span>
            </div>

            <svg viewBox="0 0 500 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* City Grid Background */}
              <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18181b" strokeWidth="1" />
              </pattern>
              <rect width="500" height="280" fill="url(#cityGrid)" />

              {/* Major Ring Road Arcs */}
              <circle cx="250" cy="140" r="110" fill="none" stroke="#27272a" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="250" cy="140" r="180" fill="none" stroke="#27272a" strokeWidth="1.5" strokeDasharray="8 6" />

              {/* Station Bases (Blue Dots) */}
              <g transform="translate(180, 80)">
                <circle r="5" fill="#0284c7" />
                <text x="8" y="3" fill="#7dd3fc" fontSize="8" fontFamily="monospace">STATION 01 (USAR)</text>
              </g>
              <g transform="translate(320, 90)">
                <circle r="5" fill="#0284c7" />
                <text x="8" y="3" fill="#7dd3fc" fontSize="8" fontFamily="monospace">STATION 04 (HAZMAT)</text>
              </g>
              <g transform="translate(160, 200)">
                <circle r="5" fill="#0284c7" />
                <text x="8" y="3" fill="#7dd3fc" fontSize="8" fontFamily="monospace">STATION 07 (ALS)</text>
              </g>

              {/* Incident 1: Structural Collapse */}
              <g transform="translate(220, 150)">
                <circle r="12" fill="url(#beaconGlow)">
                  <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill="#ef4444" />
                <text x="10" y="3" fill="#fca5a5" fontSize="8" fontWeight="bold" fontFamily="monospace">INC_01: COLLAPSE</text>
              </g>
              {/* OSRM Route to Incident 1 */}
              <path d="M 180 80 L 180 120 L 220 150" fill="none" stroke="#38bdf8" strokeWidth="2.5">
                <animate attributeName="stroke-dashoffset" from="60" to="0" dur="2s" repeatCount="indefinite" />
              </path>

              {/* Incident 2: Chlorine Plume */}
              <g transform="translate(360, 140)">
                <circle r="12" fill="url(#beaconGlow)">
                  <animate attributeName="r" values="8;18;8" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill="#f59e0b" />
                <text x="10" y="3" fill="#fde68a" fontSize="8" fontWeight="bold" fontFamily="monospace">INC_02: HAZMAT</text>
              </g>
              {/* OSRM Route to Incident 2 */}
              <path d="M 320 90 L 360 90 L 360 140" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

              {/* Incident 3: High Rise Fire */}
              <g transform="translate(290, 210)">
                <circle r="12" fill="url(#beaconGlow)">
                  <animate attributeName="r" values="8;18;8" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill="#ea580c" />
                <text x="10" y="3" fill="#fdba74" fontSize="8" fontWeight="bold" fontFamily="monospace">INC_03: HIGH-RISE</text>
              </g>

              {/* Central Status Overlay */}
              <g transform="translate(20, 245)">
                <rect width="210" height="24" rx="4" fill="#090a0f" />
                <text x="10" y="16" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">✓ 5/5 SCENARIOS DISPATCHABLE</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
