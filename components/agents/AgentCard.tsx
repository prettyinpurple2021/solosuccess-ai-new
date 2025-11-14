'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { cn } from '@/lib/utils/cn';
import type { Agent } from '@/lib/constants/agents';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
  selected?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, selected = false }) => {
  return (
    <GlassmorphicCard
      className={cn(
        'p-6 cursor-pointer relative overflow-hidden',
        selected && 'ring-2 ring-white/50'
      )}
      onClick={onClick}
      animated={true}
    >
      {/* Gradient overlay */}
      <div 
        className={cn(
          'absolute inset-0 opacity-10 bg-gradient-to-br',
          agent.gradient
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Avatar and Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{agent.avatar}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
            <p className="text-sm text-white/70">{agent.role}</p>
          </div>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-white/80 mb-4 line-clamp-2">
          {agent.description}
        </p>

        {/* Personality indicator */}
        <div className="mb-4">
          <div className="text-xs text-white/60 mb-1">Personality</div>
          <div className="text-sm text-white/90 italic">"{agent.personality}"</div>
        </div>

        {/* Expertise tags */}
        <div className="flex flex-wrap gap-2">
          {agent.expertise.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className={cn(
                'px-2 py-1 text-xs rounded-full',
                'bg-white/10 text-white/90',
                'border border-white/20'
              )}
            >
              {skill}
            </span>
          ))}
          {agent.expertise.length > 3 && (
            <span className="px-2 py-1 text-xs text-white/60">
              +{agent.expertise.length - 3} more
            </span>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
};
