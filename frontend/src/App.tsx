import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { LandingPage } from './features/landing';
import { TrackingDashboard, TrackingPage, FleetDashboard } from './features/tracking';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 1. Landing Page Overview */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. EOC Master Command Dashboard */}
          <Route path="/dashboard" element={<TrackingDashboard />} />

          {/* 3. Dedicated OSRM Road Tracing & Telemetry */}
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/track/:incidentId" element={<TrackingPage />} />

          {/* 4. Municipal Emergency Fleet Roster */}
          <Route path="/fleet" element={<FleetDashboard />} />

          {/* 5. Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
