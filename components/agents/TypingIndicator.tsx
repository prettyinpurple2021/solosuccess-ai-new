'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AgentAvatar } from './AgentAvatar';

interface TypingIndicatorProps {
  agentId: string;
  agentName: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agentId, agentName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 mb-4"
    >
      <AgentAvatar agentId={agentId} size="sm" showStatus status="typing" />
      
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">{agentName} is typing</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
