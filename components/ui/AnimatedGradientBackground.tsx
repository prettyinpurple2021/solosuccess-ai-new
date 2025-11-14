'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export type GradientTheme = 'blue' | 'purple' | 'teal' | 'sunset' | 'ocean';

interface AnimatedGradientBackgroundProps {
  theme?: GradientTheme;
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

const gradientThemes: Record<GradientTheme, string[]> = {
  blue: [
    'from-blue-600 via-blue-700 to-indigo-800',
    'from-blue-500 via-indigo-600 to-blue-800',
    'from-indigo-600 via-blue-600 to-blue-700',
  ],
  purple: [
    'from-purple-600 via-violet-700 to-purple-800',
    'from-violet-600 via-purple-600 to-fuchsia-700',
    'from-purple-500 via-fuchsia-600 to-purple-800',
  ],
  teal: [
    'from-teal-500 via-cyan-600 to-blue-700',
    'from-cyan-500 via-teal-600 to-blue-600',
    'from-teal-600 via-blue-600 to-cyan-700',
  ],
  sunset: [
    'from-orange-500 via-pink-600 to-purple-700',
    'from-pink-500 via-rose-600 to-orange-600',
    'from-rose-500 via-pink-600 to-purple-600',
  ],
  ocean: [
    'from-blue-400 via-teal-500 to-cyan-600',
    'from-cyan-400 via-blue-500 to-teal-600',
    'from-teal-400 via-cyan-500 to-blue-600',
  ],
};

export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  theme = 'blue',
  className,
  children,
  animate = true,
}) => {
  const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
  const gradients = gradientThemes[theme];

  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setCurrentGradientIndex((prev) => (prev + 1) % gradients.length);
    }, 8000); // Change gradient every 8 seconds

    return () => clearInterval(interval);
  }, [animate, gradients.length]);

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Animated gradient layers */}
      {gradients.map((gradient, index) => (
        <motion.div
          key={index}
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            gradient
          )}
          initial={{ opacity: index === 0 ? 1 : 0 }}
          animate={{
            opacity: currentGradientIndex === index ? 1 : 0,
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Animated overlay patterns */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
          backgroundSize: '100% 100%',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
