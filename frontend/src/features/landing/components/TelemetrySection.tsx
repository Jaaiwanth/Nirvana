import React from 'react';
import { Terminal, Activity } from 'lucide-react';

export const TelemetrySection: React.FC = () => {
  return (
    <section
      id="telemetry"
      className="w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#08090f] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* LEFT COLUMN: Technical Narrative (No borders) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
            REAL-TIME DATA FABRIC
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1.5 leading-tight">
            2Hz Telemetry Engine & Multi-Screen SSE Hub
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-xl">
            Eliminating client polling completely. A persistent Server-Sent Events stream pushes 500ms kinematic GPS breadcrumbs, live agent thought traces, and automatic failover events across all screens simultaneously.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-zinc-900/35 border-0 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-mono text-zinc-200 font-bold">500ms Vehicle Kinematics</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Smoothly interpolates heading bearings, speed variations, and remaining road meters along active OSRM polylines.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/35 border-0 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Terminal className="h-3.5 w-3.5 text-purple-400" />
                <span className="font-mono text-zinc-200 font-bold">100% Agent Explainability</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Streams StateGraph thought traces (`triageNode`, `decisionNode`) directly to the operator's timeline in real time.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SSE Multi-Screen Fanout SVG */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 rounded-2xl bg-zinc-950/70 border-0 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="text-sky-400 font-bold">UNIVERSAL SSE HUB BROADCAST</span>
              <span>2HZ LIVE ENGINE</span>
            </div>

            <svg viewBox="0 0 500 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Central SSE HUB Node */}
              <g transform="translate(100, 140)">
                <circle r="36" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2.5" />
                <circle r="46" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
                  <animate attributeName="r" values="36;56;36" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                <text y="-6" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NIRVANA</text>
                <text y="8" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SSE HUB</text>
                <text y="22" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="monospace">/api/events</text>
              </g>

              {/* Connecting Stream Lines to 3 Consumers */}
              <path d="M 140 120 C 220 70, 260 60, 340 60" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="5 5">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 145 140 L 340 140" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="5 5">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 140 160 C 220 210, 260 220, 340 220" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 5">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="2s" repeatCount="indefinite" />
              </path>

              {/* Animated Glowing Data Packets */}
              <circle r="4" fill="#38bdf8">
                <animateMotion path="M 140 120 C 220 70, 260 60, 340 60" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="#38bdf8">
                <animateMotion path="M 145 140 L 340 140" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="#10b981">
                <animateMotion path="M 140 160 C 220 210, 260 220, 340 220" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* CONSUMER 1: EOC Command Console (Top-Right) */}
              <g transform="translate(350, 42)">
                <rect width="130" height="38" rx="6" fill="#0f172a" />
                <text x="10" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">EOC CONSOLE</text>
                <text x="10" y="28" fill="#38bdf8" fontSize="8" fontFamily="monospace">MapCN Vector Map</text>
              </g>

              {/* CONSUMER 2: Vehicle MDT Terminals (Center-Right) */}
              <g transform="translate(350, 122)">
                <rect width="130" height="38" rx="6" fill="#0f172a" />
                <text x="10" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">IN-CAB MDT TABLETS</text>
                <text x="10" y="28" fill="#38bdf8" fontSize="8" fontFamily="monospace">Turn-by-Turn GPS</text>
              </g>

              {/* CONSUMER 3: Telemetry Stream (Bottom-Right) */}
              <g transform="translate(350, 202)">
                <rect width="130" height="38" rx="6" fill="#0f172a" />
                <text x="10" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">PUBLIC TRACKER</text>
                <text x="10" y="28" fill="#34d399" fontSize="8" fontFamily="monospace">Live ETA Webhook</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
