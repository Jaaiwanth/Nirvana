import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Truck,
  GitBranch,
  Settings,
  Headphones,
  Home,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TrackingSidebarProps {
  activeView: 'dashboard' | 'missions' | 'fleet' | 'analytics';
  onViewChange: (view: 'dashboard' | 'missions' | 'fleet' | 'analytics') => void;
  onGoHome: () => void;
  activeCount?: number;
}

export const TrackingSidebar: React.FC<TrackingSidebarProps> = ({
  activeView,
  onViewChange,
  onGoHome,
  activeCount = 0,
}) => {
  return (
    <aside className="w-14 shrink-0 bg-[#090a0f] border-r border-zinc-900 flex flex-col items-center justify-between py-3 z-30 select-none">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onGoHome}
          title="Back to Landing Page"
          className="group relative p-1 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <img
            src="/symbol.png"
            alt="NIRVANA"
            className="h-7 w-7 rounded object-contain border border-zinc-800"
          />
        </button>

        <div className="w-8 h-[1px] bg-zinc-800/80 my-1" />

        {/* Navigation Icon Stack */}
        <nav className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => onViewChange('missions')}
            title="Tracking Feed"
            className={cn(
              'p-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors relative cursor-pointer',
              activeView === 'missions' && 'bg-zinc-900 text-sky-400 border border-zinc-850'
            )}
          >
            <Radio className="h-4 w-4" />
            {activeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            title="Overview Map"
            className={cn(
              'p-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors cursor-pointer',
              activeView === 'dashboard' && 'bg-zinc-900 text-sky-400'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>

          <button
            onClick={() => onViewChange('fleet')}
            title="Municipal Fleet"
            className={cn(
              'p-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors cursor-pointer',
              activeView === 'fleet' && 'bg-zinc-900 text-sky-400'
            )}
          >
            <Truck className="h-4 w-4" />
          </button>

          <button
            onClick={() => onViewChange('analytics')}
            title="OSRM Road Routing"
            className={cn(
              'p-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors cursor-pointer',
              activeView === 'analytics' && 'bg-zinc-900 text-sky-400'
            )}
          >
            <GitBranch className="h-4 w-4" />
          </button>
        </nav>
      </div>

      {/* Bottom Icons & Avatar */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onGoHome}
          title="Return to Home Overview"
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 rounded-md transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4" />
        </button>

        <button
          title="Dispatcher Comms"
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 rounded-md transition-colors cursor-pointer"
        >
          <Headphones className="h-4 w-4" />
        </button>

        <button
          title="Settings"
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 rounded-md transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>

        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-sky-400 cursor-pointer mt-1">
          EOC
        </div>
      </div>
    </aside>
  );
};
