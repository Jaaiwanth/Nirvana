import React from 'react';
import { ArrowRight, Terminal, Activity, ShieldCheck, Navigation } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface HeroSectionProps {
  onLaunchEOC: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchEOC }) => {
  return (
    <section
      id="overview"
      className="relative w-screen h-screen snap-start snap-always shrink-0 flex flex-col justify-end pb-12 sm:pb-16 overflow-hidden bg-[#07080c] select-none"
    >
      {/* 1. Full-Screen Video Background with Reduced Tint */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/hero_video.mp4"
          className="w-full h-full object-cover"
        />

        {/* Reduced Tint Overlays: Clear, bright video with subtle readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c]/85 via-[#07080c]/25 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/70 via-[#07080c]/20 to-transparent pointer-events-none" />
      </div>

      {/* 2. Left-Aligned Content Container */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-12 flex flex-col justify-end text-left pointer-events-auto">
        {/* Main Display Headline (Left-Aligned, Authoritative) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.06] mb-3 max-w-4xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          Zero-Latency Autonomous <br className="hidden sm:inline" />
          Emergency Response.
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-200 max-w-2xl leading-relaxed mb-6 font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
          Replacing manual 911 dispatch bottlenecks with LangGraph StateGraph orchestration, sub-second Groq LPU reasoning, and turn-by-turn road network routing.
        </p>

        {/* Left-Aligned Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={onLaunchEOC}
            variant="primary"
            size="lg"
            className="gap-2 text-xs sm:text-sm font-semibold h-10 px-5 bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 border-0"
          >
            <span>Open Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => {
              const el = document.getElementById('benchmarks');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            variant="outline"
            size="lg"
            className="gap-2 text-xs sm:text-sm h-10 px-4 bg-black/60 backdrop-blur-md text-zinc-200 hover:bg-zinc-900 hover:text-white border-0"
          >
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            <span>Test 10 Disaster Scenarios</span>
          </Button>
        </div>
      </div>
    </section>
  );
};
