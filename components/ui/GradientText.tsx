'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { ColorTheme, getThemeGradient } from '@/lib/theme/colors';

export interface GradientTextProps extends Omit<HTMLMotionProps<'span'>, 'theme'> {
  children: React.ReactNode;
  className?: string;
  theme?: ColorTheme;
  animate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  theme = 'blue',
  animate = true,
  ...props
}) => {
  const gradient = getThemeGradient(theme);

  return (
    <motion.span
      className={cn(
        'bg-clip-text text-transparent font-bold',
        className
      )}
      style={{
        backgroundImage: gradient,
      }}
      animate={
        animate
          ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.span>
  );
};
