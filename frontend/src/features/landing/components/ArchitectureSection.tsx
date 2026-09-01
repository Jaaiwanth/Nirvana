import React from 'react';

const NODES_DATA = [
  { code: '01_TRIAGE', name: 'Triage Node', latency: '280ms', desc: 'Groq LPU (Llama-3.3 70B) extracts raw text/audio into strict Zod schemas.' },
  { code: '02_SPATIAL', name: 'Spatial Pruner', latency: '< 1ms', desc: 'Uber H3 Res-7 hex indexing prunes 500 units to top 5 candidates.' },
  { code: '03_ROUTING', name: 'OSRM Routing', latency: '35ms', desc: 'Calculates physical street turns, duration, and GeoJSON road polylines.' },
  { code: '04_DECISION', name: 'Decision Matrix', latency: '< 2ms', desc: '50% Capability + 35% ETA + 15% Speed composite utility scorer.' },
  { code: '05_BRANCH', name: 'Contingency', latency: '15ms', desc: 'Autonomous cross-district fallback if primary units are committed.' },
  { code: '06_COMMIT', name: 'Telemetry Hub', latency: '< 5ms', desc: 'Locks unit, records route, and broadcasts 2Hz SSE events.' },
];

export const ArchitectureSection: React.FC = () => {
  return (
    <section
      id="architecture"
      className="w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#07080c] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: Animated 6-Node LangGraph StateGraph SVG */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="text-sky-400 font-bold">LANGGRAPH STATEGRAPH TOPOLOGY</span>
              <span>6 OBSERVABLE NODES</span>
            </div>

            <svg viewBox="0 0 520 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Directed Path Lines */}
              <line x1="60" y1="80" x2="140" y2="80" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="180" y1="80" x2="260" y2="80" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="300" y1="80" x2="380" y2="80" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="420" y1="80" x2="470" y2="80" stroke="#10b981" strokeWidth="2.5" />

              {/* Branching Loop Line (Exhaustion Fallback) */}
              <path d="M 400 100 L 400 170 Q 400 200 370 200 L 290 200 Q 270 200 270 170 L 270 100" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4">
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
              </path>

              {/* Animated Glowing Packet Flow */}
              <circle r="4" fill="#38bdf8" filter="url(#glow)">
                <animateMotion path="M 60 80 L 160 80 L 280 80 L 400 80 L 470 80" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* NODE 1: Triage */}
              <g transform="translate(60, 80)">
                <circle r="22" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                <text y="4" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TRIAGE</text>
                <text y="36" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="monospace">280ms</text>
              </g>

              {/* NODE 2: Spatial */}
              <g transform="translate(160, 80)">
                <circle r="22" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                <text y="4" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">H3-HEX</text>
                <text y="36" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="monospace">&lt;1ms</text>
              </g>

              {/* NODE 3: Routing */}
              <g transform="translate(280, 80)">
                <circle r="22" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                <text y="4" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OSRM</text>
                <text y="36" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="monospace">35ms</text>
              </g>

              {/* NODE 4: Decision */}
              <g transform="translate(400, 80)">
                <circle r="22" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                <text y="4" fill="#e0f2fe" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">MATRIX</text>
                <text y="36" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="monospace">&lt;2ms</text>
              </g>

              {/* NODE 6: Commit & Telemetry */}
              <g transform="translate(480, 80)">
                <circle r="20" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                <text y="4" fill="#a7f3d0" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">COMMIT</text>
                <text y="34" fill="#34d399" fontSize="8" textAnchor="middle" fontFamily="monospace">2Hz SSE</text>
              </g>

              {/* NODE 5: Contingency Fallback (Below) */}
              <g transform="translate(330, 200)">
                <rect x="-60" y="-16" width="120" height="32" rx="6" fill="#451a03" stroke="#d97706" strokeWidth="1.5" />
                <text y="4" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">05_CONTINGENCY</text>
                <text y="30" fill="#fbbf24" fontSize="8" textAnchor="middle" fontFamily="monospace">Exhaustion Fallback Loop</text>
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Section Header & 6 Compact Node Cards */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
            AGENTIC WORKFLOW TOPOLOGY
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1.5 leading-tight">
            6-Node LangGraph StateGraph Architecture
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-xl">
            Every emergency is processed through a deterministic DAG with typed Zod state boundaries, sub-millisecond pruning, and automated mutual-aid fallback.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
            {NODES_DATA.map((node) => (
              <div
                key={node.code}
                className="p-2.5 rounded-xl bg-zinc-900/35 border-0 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-sky-400 font-bold">{node.code}</span>
                    <span className="text-emerald-400">{node.latency}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{node.name}</h4>
                  <p className="text-[10px] text-zinc-400 leading-snug">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
