'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'variant' | 'size'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  touchOptimized?: boolean; // Ensures minimum 44x44px touch target
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      touchOptimized = true,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';

    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500',
      secondary: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white focus:ring-purple-500',
      outline: 'border-2 border-white/30 hover:border-white/50 active:border-white/60 bg-transparent hover:bg-white/10 active:bg-white/20 text-white',
      ghost: 'bg-transparent hover:bg-white/10 active:bg-white/20 text-white',
      gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 text-white shadow-lg hover:shadow-xl',
    };

    const sizeClasses = {
      sm: touchOptimized ? 'px-4 py-2.5 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm',
      md: touchOptimized ? 'px-5 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
      lg: touchOptimized ? 'px-7 py-4 text-lg min-h-[56px]' : 'px-6 py-3 text-lg',
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          (disabled || loading) && disabledClasses,
          className
        )}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.05 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
