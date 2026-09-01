import React from 'react';

const PILLARS_LIST = [
  { step: '01', title: 'Understand Emergency', tech: 'Groq LPU Llama 3.3', desc: 'Zod schemas extracting victims, hazards, and required gear in 280ms.' },
  { step: '02', title: 'Prune Candidate Fleet', tech: 'Uber H3 Res-7 Hex', desc: 'Sub-millisecond screening of 500 units down to top 5 candidates.' },
  { step: '03', title: 'Calculate Real Roads', tech: 'OSRM Routing Machine', desc: 'Physical street maneuvers, siren factors, and turn-by-turn GeoJSON.' },
  { step: '04', title: 'Decision Scoring', tech: 'Composite Scorer', desc: '50% Capability + 35% ETA + 15% Speed locks primary and backup units.' },
  { step: '05', title: 'Live 2Hz Telemetry', tech: 'Server-Sent Events', desc: 'Real-time GPS breadcrumbs, explainability stream, and auto-failover.' },
];

export const RuleOfFiveSection: React.FC = () => {
  return (
    <section
      id="rule-of-five"
      className="w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#07080c] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: 5-Pillar Integrated Cycle SVG */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="text-sky-400 font-bold">THE RULE OF 5 ARCHITECTURE</span>
              <span>CLOSED-LOOP ORCHESTRATION</span>
            </div>

            <svg viewBox="0 0 500 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Central Radar Circle */}
              <circle cx="250" cy="140" r="100" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="250" cy="140" r="60" fill="none" stroke="#0f172a" strokeWidth="1.5" />

              {/* Connecting Pentagon Orbit Line */}
              <polygon points="250,40 345,105 310,215 190,215 155,105" fill="none" stroke="url(#circleGrad)" strokeWidth="2" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0 250 140" to="360 250 140" dur="20s" repeatCount="indefinite" />
              </polygon>

              {/* Central Core Emblem */}
              <circle cx="250" cy="140" r="28" fill="#0369a1" />
              <text x="250" y="137" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NIRVANA</text>
              <text x="250" y="149" fill="#7dd3fc" fontSize="7" textAnchor="middle" fontFamily="monospace">ENGINE</text>

              {/* Node 1: Intake / Understand (Top) */}
              <g transform="translate(250, 40)">
                <circle r="18" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                <text y="4" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">01_TRIAGE</text>
              </g>

              {/* Node 2: Prune (Top-Right) */}
              <g transform="translate(345, 105)">
                <circle r="18" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                <text y="4" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">02_PRUNE</text>
              </g>

              {/* Node 3: Route (Bottom-Right) */}
              <g transform="translate(310, 215)">
                <circle r="18" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                <text y="4" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">03_ROUTE</text>
              </g>

              {/* Node 4: Decide (Bottom-Left) */}
              <g transform="translate(190, 215)">
                <circle r="18" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                <text y="4" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">04_DECIDE</text>
              </g>

              {/* Node 5: Dispatch / Telemetry (Top-Left) */}
              <g transform="translate(155, 105)">
                <circle r="18" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                <text y="4" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">05_PUSH</text>
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Five Pillars Detailed Descriptions (No borders) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
            DESIGN PHILOSOPHY
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1.5 leading-tight">
            The Rule of 5: Five Focused Steps Executed Flawlessly
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-xl">
            NIRVANA rejects bloated monolithic systems in favor of 5 mathematical, atomic stages executed with absolute determinism.
          </p>

          <div className="flex flex-col gap-2 mt-5">
            {PILLARS_LIST.map((pillar) => (
              <div
                key={pillar.step}
                className="p-2.5 rounded-xl bg-zinc-900/35 border-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded">
                    {pillar.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{pillar.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{pillar.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded shrink-0">
                  {pillar.tech}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
