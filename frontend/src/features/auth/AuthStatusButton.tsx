import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from './useAuth';
import { AuthModal } from './AuthModal';

export const AuthStatusButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {isAuthenticated ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-all cursor-pointer shadow-sm ${className}`}
          title="Supabase Dispatcher Session: Admin"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse" />
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="tracking-wider uppercase">Admin</span>
        </button>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/60 text-sky-300 transition-all cursor-pointer shadow-sm ${className}`}
          title="Dispatcher Access: Sign In"
        >
          <Lock className="h-3.5 w-3.5 text-sky-400" />
          <span className="tracking-wider">Sign In</span>
        </button>
      )}

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
