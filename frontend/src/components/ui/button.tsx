import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-zinc-100 text-zinc-950 shadow hover:bg-zinc-200 active:bg-zinc-300',
        primary: 'bg-sky-500 text-white shadow hover:bg-sky-400 active:bg-sky-600',
        destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700',
        outline: 'border border-zinc-800 bg-transparent text-zinc-300 shadow-sm hover:bg-zinc-900 hover:text-white',
        secondary: 'bg-zinc-800 text-zinc-200 shadow-sm hover:bg-zinc-700 hover:text-white',
        ghost: 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
        link: 'text-sky-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 rounded px-2 text-[11px]',
        lg: 'h-10 rounded-md px-5 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
