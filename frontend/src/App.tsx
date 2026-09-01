import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { LandingPage } from './features/landing';
import { TrackingDashboard, TrackingPage, FleetDashboard } from './features/tracking';

import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* 1. Landing Page Overview */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Authentication Portal */}
          <Route path="/login" element={<LoginPage />} />

          {/* 3. Protected EOC Operational Routes (Requires Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<TrackingDashboard />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/track/:incidentId" element={<TrackingPage />} />
            <Route path="/fleet" element={<FleetDashboard />} />
          </Route>

          {/* 4. Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
