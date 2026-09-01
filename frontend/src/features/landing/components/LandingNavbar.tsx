import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          onClick={() => scrollTo('overview')}
          className="flex items-center gap-3 select-none cursor-pointer"
        >
          <img
            src="/symbol.png"
            alt="NIRVANA Logo"
            className="h-8 w-8 object-contain rounded"
          />
          <span className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
            NIRVANA
          </span>
        </div>

        {/* Clean, Focused Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs text-zinc-400 font-medium">
          <button
            onClick={() => scrollTo('overview')}
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Overview
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollTo('rule-of-five')}
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Philosophy
          </button>
          <button
            onClick={() => scrollTo('benchmarks-part1')}
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Scenario
          </button>
        </nav>

        {/* Action Button & GitHub Link */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Jaaiwanth/Nirvana"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="GitHub Repository"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          <Button
            onClick={() => navigate('/login')}
            variant="primary"
            size="sm"
            className="gap-1.5 font-medium bg-sky-500 hover:bg-sky-400 text-white cursor-pointer border-0 shadow-none px-4"
          >
            <span>Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
