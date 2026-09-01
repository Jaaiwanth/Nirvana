import React from 'react';

export const ComparisonSection: React.FC = () => {
  return (
    <section
      id="comparison"
      className="w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#08090e] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: Narrative & Architecture Breakdown */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
            OPERATIONAL ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1.5 leading-tight">
            Why Legacy Emergency CAD Fails in Critical Minutes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-xl">
            In mass casualties or acute trauma, irreversible brain and cardiac death occurs within 4–6 minutes. 
            Legacy CAD relies on fragmented telephone relays, while NIRVANA computes autonomous road dispatch in &lt; 1.5 seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {/* Legacy Box (No borders) */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 text-xs text-zinc-400 border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-rose-400 font-bold uppercase">
                  TRADITIONAL CAD
                </span>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded">
                  3–7 MIN DELAY
                </span>
              </div>
              <p className="leading-snug text-zinc-300 text-[11px]">
                Fragmented operator queues, verbal telephone chains, and straight-line Euclidean distance errors.
              </p>
            </div>

            {/* NIRVANA Box (No borders) */}
            <div className="p-3.5 rounded-xl bg-sky-950/25 text-xs text-zinc-300 border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-sky-400 font-bold uppercase">
                  NIRVANA STATEGRAPH
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                  &lt; 1.5S DISPATCH
                </span>
              </div>
              <p className="leading-snug text-zinc-200 text-[11px]">
                Autonomous multimodal triage, H3 spatial screening, true street routing, and real-time 2Hz push.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive SVG Latency Waterfall */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-3">
              <span>RESPONSE LATENCY TIMELINE</span>
              <span className="text-sky-400">BENCHMARK COMPARISON</span>
            </div>

            {/* SVG Latency Diagram */}
            <svg viewBox="0 0 500 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="legacyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#881337" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="nirvanaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Time markers (Grid) */}
              <line x1="60" y1="20" x2="60" y2="240" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="160" y1="20" x2="160" y2="240" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="260" y1="20" x2="260" y2="240" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="360" y1="20" x2="360" y2="240" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="460" y1="20" x2="460" y2="240" stroke="#ef4444" strokeWidth="1.5" />

              <text x="60" y="15" fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">0:00</text>
              <text x="160" y="15" fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">1:30</text>
              <text x="260" y="15" fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">3:00</text>
              <text x="360" y="15" fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">4:30</text>
              <text x="460" y="15" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle">6:00 (DEATH)</text>

              {/* TOP LANE: Legacy CAD */}
              <text x="20" y="60" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="monospace">LEGACY CAD</text>
              
              {/* Call intake bar */}
              <rect x="60" y="75" width="90" height="26" rx="4" fill="#3f121d" />
              <text x="105" y="92" fill="#fca5a5" fontSize="9" textAnchor="middle" fontFamily="monospace">Intake (1.5m)</text>

              {/* Verbal Relay bar */}
              <rect x="155" y="75" width="110" height="26" rx="4" fill="#4c0519" />
              <text x="210" y="92" fill="#fda4af" fontSize="9" textAnchor="middle" fontFamily="monospace">Radio Relay (2.0m)</text>

              {/* Manual Selection */}
              <rect x="270" y="75" width="140" height="26" rx="4" fill="url(#legacyGrad)" />
              <text x="340" y="92" fill="#ffe4e6" fontSize="9" textAnchor="middle" fontFamily="monospace">Manual Dispatch (2.5m)</text>

              {/* Red warning crossbar */}
              <circle cx="410" cy="88" r="6" fill="#e11d48" />
              <text x="425" y="92" fill="#fb7185" fontSize="9" fontFamily="monospace">Unit Rolls: 5.8 min</text>

              {/* BOTTOM LANE: NIRVANA */}
              <text x="20" y="160" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">NIRVANA STATEGRAPH</text>

              {/* Autonomous bar (Sub-second) */}
              <rect x="60" y="175" width="22" height="28" rx="4" fill="url(#nirvanaGrad)">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
              </rect>
              <text x="90" y="193" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">1.25s Total</text>

              {/* Instant Route Corridor */}
              <line x1="82" y1="189" x2="480" y2="189" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="4 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
              </line>

              {/* Moving Ambulance Node */}
              <circle cx="210" cy="189" r="7" fill="#38bdf8">
                <animate attributeName="cx" values="85;460" dur="6s" repeatCount="indefinite" />
              </circle>

              {/* Target Scene Flag */}
              <circle cx="480" cy="189" r="6" fill="#10b981" />
              <text x="440" y="225" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">SCENE REACHED</text>
              <text x="440" y="240" fill="#a1a1aa" fontSize="9" fontFamily="monospace">IN GOLDEN HOUR</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
