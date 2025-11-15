'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Responsive grid component that adapts columns based on screen size
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-5 lg:gap-6',
    lg: 'gap-6 sm:gap-7 lg:gap-8',
    xl: 'gap-8 sm:gap-10 lg:gap-12',
  };

  const colClasses = cn(
    'grid',
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `sm:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`
  );

  return (
    <div className={cn(colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
};
