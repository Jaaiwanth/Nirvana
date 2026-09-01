import React from 'react';
import { Route, Compass } from 'lucide-react';

export const GeospatialSection: React.FC = () => {
  return (
    <section
      id="geospatial"
      className="w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#08090f] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: Technical Narrative */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
            GEOSPATIAL PRUNING & ROAD TOPOLOGY
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1.5 leading-tight">
            Why Euclidean Distance Kills in Urban Emergencies
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-xl">
            Legacy CAD picks the "closest" station as-the-crow-flies using Pythagorean formulas. 
            When rivers, rail yards, or one-way expressways intervene, the straight-line winner is actually trapped 16 minutes away.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-zinc-900/35 border-0 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Compass className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-mono text-zinc-200 font-bold">Uber H3 Res-7 Partitioning</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Screens 500 units in 0.8ms using uniform hexagons with identical neighbor distances, eliminating pole distortion.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/35 border-0 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Route className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-zinc-200 font-bold">OSRM Real Road Topology</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Calculates true street maneuvers, physical bridge crossings, and vehicle siren speed multipliers.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Euclidean vs. OSRM Interactive Simulation SVG */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="text-rose-400 font-bold">EUCLIDEAN TRAP SIMULATION</span>
              <span className="text-sky-400">OSRM TRUTH</span>
            </div>

            <svg viewBox="0 0 520 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Impassable River Barrier (Center) */}
              <path d="M 230 0 Q 250 80 230 150 T 260 300" fill="none" stroke="url(#riverGrad)" strokeWidth="36" />
              <path d="M 230 0 Q 250 80 230 150 T 260 300" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
              <text x="245" y="270" fill="#64748b" fontSize="9" fontFamily="monospace" transform="rotate(80 245 270)">IMPASSABLE RIVER / NO BRIDGE</text>

              {/* Bridge Up North */}
              <rect x="220" y="30" width="45" height="12" rx="2" fill="#334155" />
              <text x="242" y="39" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">HIGHWAY BRIDGE</text>

              {/* STATION A (Euclidean Winner / Road Disaster) */}
              <g transform="translate(100, 160)">
                <circle r="14" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
                <text y="3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">STN A</text>
                <text y="28" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1.8km straight</text>
                <text y="40" fill="#f43f5e" fontSize="8" textAnchor="middle" fontFamily="monospace">16.2 MIN ROAD DELAY</text>
              </g>

              {/* Red Dashed Straight Line (Euclidean Fallacy) */}
              <line x1="114" y1="160" x2="380" y2="160" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" opacity="0.8">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="2s" repeatCount="indefinite" />
              </line>
              <text x="240" y="152" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">EUCLIDEAN BLIND SPOT (TRAP)</text>

              {/* Station A Actual Road Path (Goes north to bridge) */}
              <path d="M 100 146 L 100 36 L 265 36 L 380 36 L 380 140" fill="none" stroke="#4c0519" strokeWidth="2.5" strokeDasharray="3 3" />

              {/* EMERGENCY INCIDENT SCENE */}
              <g transform="translate(390, 160)">
                <circle r="16" fill="#e11d48" opacity="0.3">
                  <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r="14" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                <text y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">SCENE</text>
                <text y="28" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">INCIDENT</text>
              </g>

              {/* STATION B (NIRVANA Optimal Winner) */}
              <g transform="translate(390, 45)">
                <circle r="14" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                <text y="3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">STN B</text>
                <text x="-40" y="4" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="end" fontFamily="monospace">3.2km straight</text>
                <text x="-40" y="16" fill="#a7f3d0" fontSize="8" textAnchor="end" fontFamily="monospace">(Legacy ignores)</text>
              </g>

              {/* NIRVANA Direct Road Route Line (Cyan Glowing Corridor) */}
              <path d="M 390 59 L 390 144" fill="none" stroke="#0ea5e9" strokeWidth="4" />
              <path d="M 390 59 L 390 144" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="2s" repeatCount="indefinite" />
              </path>

              {/* Moving Unit Badge */}
              <circle r="6" fill="#38bdf8">
                <animateMotion path="M 390 59 L 390 144" dur="2.5s" repeatCount="indefinite" />
              </circle>

              <g transform="translate(405, 100)">
                <rect x="0" y="-12" width="105" height="34" rx="4" fill="#0c4a6e" />
                <text x="6" y="2" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">NIRVANA DISPATCH</text>
                <text x="6" y="15" fill="#a5f3fc" fontSize="8" fontFamily="monospace">ETA: 3.1 MIN (FASTEST)</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
