'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  glassmorphic?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  glassmorphic = true,
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden',
        glassmorphic
          ? 'bg-white/10 backdrop-blur-sm'
          : 'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        className
      )}
      style={style}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        className={cn(
          'absolute inset-0',
          glassmorphic
            ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
        )}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" height={24} width="60%" />
      <Skeleton variant="text" height={16} width="80%" />
      <Skeleton variant="text" height={16} width="70%" />
    </div>
  );
};

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={20} width="40%" />
            <Skeleton variant="text" height={16} width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" height={20} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              height={16}
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};
