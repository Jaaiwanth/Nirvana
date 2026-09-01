import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { trackingApi } from '../../tracking';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { ComparisonSection } from './ComparisonSection';
import { ArchitectureSection } from './ArchitectureSection';
import { GeospatialSection } from './GeospatialSection';
import { RuleOfFiveSection } from './RuleOfFiveSection';
import { TelemetrySection } from './TelemetrySection';
import { PresetScenariosPart1 } from './PresetScenariosPart1';
import { PresetScenariosPart2 } from './PresetScenariosPart2';
import { ContactSection } from './ContactSection';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Trigger Scenario Mutation from Landing Page
  const triggerScenarioMutation = useMutation({
    mutationFn: trackingApi.triggerScenario,
    onSuccess: (data) => {
      navigate(data.incidentId ? `/track/${data.incidentId}` : '/track');
    },
    onError: (err) => {
      console.error('Failed to trigger scenario:', err);
      navigate('/track');
    },
  });

  const handleTriggerScenario = (scenarioId: string) => {
    triggerScenarioMutation.mutate(scenarioId);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight > clientHeight) {
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  return (
    <div
      onScroll={handleScroll}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#07080c] text-zinc-100 selection:bg-sky-500/30 selection:text-sky-200 overflow-x-hidden relative"
    >
      {/* 1. Scroll Progress Bar at the Very Top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-950/80 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-300 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(56,189,248,0.9)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Fixed Header Navigation */}
      <LandingNavbar />

      {/* Page 1: Full-Screen Hero Section */}
      <HeroSection onLaunchEOC={() => navigate('/login')} />

      {/* Page 2: Operational Breakdown (Why Legacy CAD Fails) */}
      <ComparisonSection />

      {/* Page 3: 6-Node LangGraph StateGraph Architecture (Left SVG, Right Text) */}
      <ArchitectureSection />

      {/* Page 4: Geospatial Routing & Euclidean Trap Simulation (Left Text, Right SVG) */}
      <GeospatialSection />

      {/* Page 5: The Rule of 5 Focused Engineering Pillars (Left SVG, Right Text) */}
      <RuleOfFiveSection />

      {/* Page 6: 2Hz Telemetry Engine & Multi-Screen SSE Hub (Left Text, Right SVG) */}
      <TelemetrySection />

      {/* Page 7: 10-Scenario Benchmark Part 1 - Scenarios 01 to 05 (Left Cards, Right SVG) */}
      <PresetScenariosPart1
        onTriggerScenario={handleTriggerScenario}
        isLoading={triggerScenarioMutation.isPending}
      />

      {/* Page 8: 10-Scenario Benchmark Part 2 - Scenarios 06 to 10 (Left SVG, Right Cards + EOC Launch) */}
      <PresetScenariosPart2
        onTriggerScenario={handleTriggerScenario}
        isLoading={triggerScenarioMutation.isPending}
      />

      {/* Page 9: Open Source Contact & GitHub Repository Section */}
      <ContactSection />
    </div>
  );
};
