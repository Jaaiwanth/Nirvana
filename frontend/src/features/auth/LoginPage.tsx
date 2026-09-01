import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/button';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Radio,
  MapPin,
  Flame,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated and not loading, give quick transition option or auto-redirect if desired
  useEffect(() => {
    // Keep user on page if they want to view details or click Go to Dashboard
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await signIn(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials or authentication error.');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#090a0f] text-white">
      {/* LEFT COLUMN: Login Image with Tactical Overlay */}
      <div className="relative w-full md:w-1/2 lg:w-3/5 min-h-[320px] md:min-h-screen flex flex-col justify-between overflow-hidden bg-zinc-950">
        <img
          src="/login_image.jpeg"
          alt="Emergency Dispatch Command Center"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80 filter brightness-90 contrast-110"
        />

        {/* Ambient Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-black/40 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#090a0f] hidden md:block pointer-events-none" />

        {/* Top Header Branding on Image */}
        <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors group"
          >
            <div className="h-9 w-9 rounded-lg bg-zinc-900/80 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:border-sky-400/50 transition-colors">
              <img src="/symbol.png" alt="Nirvana Logo" className="h-5 w-5 object-contain" />
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm uppercase text-zinc-100">
                NIRVANA EOC
              </span>
              <span className="block text-[10px] font-mono text-zinc-400">
                Autonomous Emergency Dispatch
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-md border border-white/10 backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Bottom Hero Narrative on Image */}
        <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 backdrop-blur-md text-sky-300 text-xs font-mono">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>MUNICIPAL TACTICAL DISPATCH NETWORK</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Coordinated Emergency Command & Multi-Agent Fleet Telematics
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Nirvana bridges multimodal citizen distress calls with automated LangGraph agentic reasoning,
            OSRM road routing, and native Supabase PostGIS spatial indexing for rapid disaster intervention.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-sky-400" />
              PostGIS Geospatial Engine
            </span>
            <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Supabase JWT Auth Guard
            </span>
            <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-amber-400" />
              Real-Time Siren Kinematics
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dispatcher Login Form & Template */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 bg-[#090a0f] border-t md:border-t-0 md:border-l border-zinc-900">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Dispatcher Access Control</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              EOC Portal Sign In
            </h2>
            <p className="text-xs text-zinc-400">
              Authenticate via Supabase Auth to access live incident dispatch, telemetry streams, and municipal fleet controls.
            </p>
          </div>

          {/* If already authenticated */}
          {isAuthenticated && user ? (
            <div className="space-y-4 p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-200">
                    Session Already Active
                  </p>
                  <p className="text-xs text-zinc-300 font-mono">
                    Signed in as: <span className="text-white font-bold">{user.email}</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Role: Emergency Operations Admin
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                  className="w-full gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer"
                >
                  <span>Proceed to EOC Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  onClick={async () => {
                    await signOut();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/60 cursor-pointer"
                >
                  <span>Sign Out Session</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}


              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Dispatcher Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition-colors"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Authorization Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition-colors"
                    placeholder="admin123"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isLoading}
                  className="w-full h-10 gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer shadow-lg shadow-sky-600/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>Sign In with Supabase</span>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </form>
          )}

          {/* Security Footer Details */}
          <div className="pt-4 border-t border-zinc-900 text-center space-y-1">
            <p className="text-[11px] text-zinc-500 font-mono">
              Protected by Supabase Auth (ES256 JWT) & PostGIS Guard
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">
              Municipal Crisis Command & Autonomous Emergency Response
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
