import React from 'react';
import { cn } from '../../lib/utils';

export type StatusVariant = 'critical' | 'warning' | 'info' | 'success' | 'neutral';

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  dot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
  critical: {
    badge: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    dot: 'bg-rose-500',
  },
  warning: {
    badge: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    dot: 'bg-amber-500',
  },
  info: {
    badge: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    dot: 'bg-sky-400',
  },
  success: {
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  neutral: {
    badge: 'bg-zinc-900/80 text-zinc-400 border-zinc-800',
    dot: 'bg-zinc-500',
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  variant = 'neutral',
  dot = true,
  children,
  className,
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide border select-none uppercase',
        styles.badge,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />}
      {children}
    </span>
  );
};
