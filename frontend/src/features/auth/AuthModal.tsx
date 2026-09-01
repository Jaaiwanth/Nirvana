import React, { useState } from 'react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { ShieldCheck, Lock, Mail, Key, LogOut, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from './useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, session, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await signIn(email, password);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase JWT Authentication"
      description="Secure Emergency Operations Center Dispatch Authorization"
      className="max-w-md"
    >
      <div className="space-y-4 pt-2">
        {/* Supabase Security Badge */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Supabase Auth Protected</p>
              <p className="text-[11px] text-zinc-500 font-mono">RS256/ES256 Cryptographic JWT</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
            isAuthenticated
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
              : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
          }`}>
            {isAuthenticated ? 'AUTHORIZED' : 'LOGIN REQUIRED'}
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="space-y-3 p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-emerald-200">Active Dispatcher Session</p>
                <p className="text-xs text-zinc-300 font-mono mt-0.5">{user.email}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  Token: {session?.access_token.substring(0, 24)}...
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
              }}
              className="w-full gap-2 border-zinc-700 text-zinc-300 hover:text-rose-400 hover:border-rose-900/60"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Session</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Dispatcher Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                  placeholder="admin123"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoading}
                className="w-full gap-2 bg-sky-600 hover:bg-sky-500 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                <span>Sign In with Supabase</span>
              </Button>
            </div>
          </form>
        )}

        
      </div>
    </Modal>
  );
};
