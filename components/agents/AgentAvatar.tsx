'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { getAgentById } from '@/lib/constants/agents';

interface AgentAvatarProps {
  agentId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'typing' | 'offline';
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agentId,
  size = 'md',
  showStatus = false,
  status = 'online',
  className
}) => {
  const agent = getAgentById(agentId);

  if (!agent) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl',
    xl: 'w-24 h-24 text-6xl'
  };

  const statusColors = {
    online: 'bg-green-500',
    typing: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center',
          'backdrop-blur-md bg-white/10 border border-white/20',
          `bg-gradient-to-br ${agent.gradient}`,
          sizeClasses[size]
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <span>{agent.avatar}</span>
      </motion.div>

      {showStatus && (
        <motion.div
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            statusColors[status]
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {status === 'typing' && (
            <motion.div
              className="w-full h-full rounded-full bg-yellow-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};
