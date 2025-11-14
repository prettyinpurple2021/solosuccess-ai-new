'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassmorphicCardProps extends Omit<HTMLMotionProps<'div'>, 'elevation'> {
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  gradient?: boolean;
  animated?: boolean;
}

export const GlassmorphicCard = React.forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  (
    {
      children,
      className,
      elevation = 'medium',
      gradient = false,
      animated = true,
      ...props
    },
    ref
  ) => {
    const elevationClasses = {
      low: 'shadow-lg',
      medium: 'shadow-2xl',
      high: 'shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'backdrop-blur-xl bg-white/10 dark:bg-black/20',
          'border border-white/20 dark:border-white/10',
          'rounded-2xl',
          elevationClasses[elevation],
          gradient && 'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
          animated && 'transition-all duration-300',
          className
        )}
        whileHover={animated ? { y: -4, scale: 1.02 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassmorphicCard.displayName = 'GlassmorphicCard';
