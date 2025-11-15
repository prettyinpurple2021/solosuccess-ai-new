'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  touchOptimized?: boolean; // Ensures minimum 44px height for touch devices
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      inputSize = 'md',
      type = 'text',
      disabled,
      touchOptimized = true,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: touchOptimized ? 'px-4 py-2.5 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm',
      md: touchOptimized ? 'px-4 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
      lg: touchOptimized ? 'px-5 py-4 text-lg min-h-[56px]' : 'px-5 py-3 text-lg',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/90 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full rounded-lg',
              'backdrop-blur-md bg-white/10 dark:bg-black/20',
              'border border-white/20 dark:border-white/10',
              'text-white placeholder:text-white/50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
              'transition-all duration-200',
              error && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50',
              disabled && 'opacity-50 cursor-not-allowed',
              icon && 'pl-10',
              sizeClasses[inputSize],
              className
            )}
            disabled={disabled}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-white/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
