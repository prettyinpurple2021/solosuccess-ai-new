'use client';

import React, { useMemo } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { getOptimalBlurIntensity, shouldReduceAnimations } from '@/lib/utils/performance';

export interface OptimizedGlassmorphicPanelProps extends Omit<HTMLMotionProps<'div'>, 'blur'> {
  children: React.ReactNode;
  className?: string;
  blur?: 'light' | 'medium' | 'strong' | 'auto';
  border?: boolean;
  padding?: boolean;
  animate?: boolean;
}

/**
 * Performance-optimized glassmorphic panel that adapts to device capabilities
 */
export const OptimizedGlassmorphicPanel = React.forwardRef<
  HTMLDivElement,
  OptimizedGlassmorphicPanelProps
>(
  (
    {
      children,
      className,
      blur = 'auto',
      border = true,
      padding = true,
      animate = true,
      ...props
    },
    ref
  ) => {
    // Determine optimal blur based on device capabilities
    const effectiveBlur = useMemo(() => {
      if (blur === 'auto') {
        return getOptimalBlurIntensity();
      }
      return blur;
    }, [blur]);

    // Check if animations should be reduced
    const reduceAnimations = useMemo(() => {
      return shouldReduceAnimations();
    }, []);

    const blurClasses = {
      light: 'backdrop-blur-sm bg-white/5 dark:bg-black/10',
      medium: 'backdrop-blur-md bg-white/10 dark:bg-black/20',
      strong: 'backdrop-blur-xl bg-white/15 dark:bg-black/30',
    };

    // Use simpler styles for low-end devices
    const optimizedClasses = useMemo(() => {
      if (effectiveBlur === 'light') {
        return 'bg-white/10 dark:bg-black/20'; // No backdrop-blur for performance
      }
      return blurClasses[effectiveBlur];
    }, [effectiveBlur]);

    const animationProps = animate && !reduceAnimations
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          optimizedClasses,
          border && 'border border-white/20 dark:border-white/10',
          'rounded-xl',
          padding && 'p-6',
          'will-change-auto', // Optimize for animations
          className
        )}
        {...animationProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

OptimizedGlassmorphicPanel.displayName = 'OptimizedGlassmorphicPanel';
