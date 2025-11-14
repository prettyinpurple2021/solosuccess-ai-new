'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  className
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs',
          'backdrop-blur-md border',
          isConnected
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400',
          className
        )}
      >
        <motion.div
          className={cn(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
          animate={
            isConnected
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <span className="font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
