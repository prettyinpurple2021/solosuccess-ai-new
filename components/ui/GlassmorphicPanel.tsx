'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassmorphicPanelProps extends Omit<HTMLMotionProps<'div'>, 'blur'> {
  children: React.ReactNode;
  className?: string;
  blur?: 'light' | 'medium' | 'strong';
  border?: boolean;
  padding?: boolean;
}

export const GlassmorphicPanel = React.forwardRef<HTMLDivElement, GlassmorphicPanelProps>(
  (
    {
      children,
      className,
      blur = 'medium',
      border = true,
      padding = true,
      ...props
    },
    ref
  ) => {
    const blurClasses = {
      light: 'backdrop-blur-sm bg-white/5 dark:bg-black/10',
      medium: 'backdrop-blur-md bg-white/10 dark:bg-black/20',
      strong: 'backdrop-blur-xl bg-white/15 dark:bg-black/30',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          blurClasses[blur],
          border && 'border border-white/20 dark:border-white/10',
          'rounded-xl',
          padding && 'p-6',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassmorphicPanel.displayName = 'GlassmorphicPanel';
