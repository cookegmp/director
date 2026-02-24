import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function GradientButton({ children, className, ...props }: GradientButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm px-5 py-2 gradient-button text-white font-medium active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default GradientButton;
