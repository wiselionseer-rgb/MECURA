import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-mecura-silver ml-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 flex items-center justify-center pointer-events-none text-mecura-silver">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-14 w-full rounded-xl border border-mecura-elevated bg-mecura-surface-light px-4 py-2 text-base text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:ring-1 focus:ring-mecura-neon focus:border-mecura-neon transition-all",
              icon && "pl-12",
              error && "border-red-500/50 focus:ring-red-500/50",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
