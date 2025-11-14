'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/90 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full rounded-lg px-4 py-2 text-base',
              'backdrop-blur-md bg-white/10 dark:bg-black/20',
              'border border-white/20 dark:border-white/10',
              'text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
              'transition-all duration-200',
              'appearance-none cursor-pointer',
              error && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            disabled={disabled}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select';
