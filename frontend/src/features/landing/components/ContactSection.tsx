import React from 'react';
import { ExternalLink, Mail, MessageSquare, Terminal, GitBranch, Star } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="w-full h-screen snap-start snap-always shrink-0 flex flex-col justify-center border-0 bg-[#07080c] select-none overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* LEFT COLUMN: Contact & Team Narrative */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">
            OPEN SOURCE & COLLABORATION
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1.5 leading-tight">
            Connect with the NIRVANA Engineering Team
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-xl">
            NIRVANA is built as an open-architecture emergency coordination system. We partner with municipal fire authorities, emergency services, and civic technologists to eliminate dispatch latency.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-zinc-900/35 border-0 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-mono text-zinc-200 font-bold">Municipal Inquiries</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Connect with our maintainers for live municipal CAD pilots, GIS map ingestion, and emergency district integrations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/35 border-0 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-zinc-200 font-bold">Hackathon Demo & Pitch</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Review our complete pitch document, actor system boundaries, and 3-minute live presentation script in <code className="text-sky-300">PITCH.md</code>.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GitHub Repository Showcase Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-zinc-950/75 border-0 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-4">
                <div className="flex items-center gap-2">
                  <GithubIcon className="h-4 w-4 text-white" />
                  <span className="font-bold text-white">GitHub Repository</span>
                </div>
                <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">
                  OPEN SOURCE
                </span>
              </div>

              {/* Repo Details */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border-0 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-bold font-mono text-sky-400">
                    Jaaiwanth/Nirvana
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-current" />
                      <span>Main</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3 text-zinc-400" />
                      <span>v1.0</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Autonomous Emergency Operations Center Dispatch Coordinator with LangGraph StateGraph, Uber H3 Spatial Pruning, OSRM Road Graph Routing, and 2Hz SSE Telemetry.
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300">TypeScript</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300">LangGraph</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300">Groq LPU</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300">OSRM</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300">MapCN</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-300">Tailwind v4</span>
                </div>
              </div>

              {/* Clone command snippet */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/70 border-0 text-xs font-mono text-zinc-400 mb-5">
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate text-zinc-300">git clone https://github.com/Jaaiwanth/Nirvana.git</span>
                </div>
              </div>
            </div>

            {/* Direct GitHub CTA Link */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
              <span className="text-[11px] font-mono text-zinc-500">
                Released under MIT License
              </span>
              <a
                href="https://github.com/Jaaiwanth/Nirvana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <span>View on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
