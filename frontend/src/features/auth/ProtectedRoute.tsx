import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#090a0f] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400 mb-3" />
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Verifying Supabase Dispatcher Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated requests to login page
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
