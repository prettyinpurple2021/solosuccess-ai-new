'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { AGENTS } from '@/lib/constants/agents';
import { formatDistanceToNow } from 'date-fns';

interface MissionControlSession {
  id: string;
  objective: string;
  status: string;
  agentsInvolved: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  results?: any;
}

interface ActiveSessionCardProps {
  session: MissionControlSession;
  onClick: () => void;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  session,
  onClick,
}) => {
  const statusConfig = {
    in_progress: {
      label: 'In Progress',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: '⚡',
    },
    completed: {
      label: 'Completed',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: '✅',
    },
    failed: {
      label: 'Failed',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: '❌',
    },
  };

  const config = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.in_progress;

  const involvedAgents = session.agentsInvolved
    .map(id => AGENTS.find(a => a.id === id))
    .filter(Boolean);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <GlassmorphicPanel
        className="cursor-pointer hover:border-white/40 transition-all"
        onClick={onClick}
      >
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
            <span>{config.icon}</span>
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <div className="text-xs text-white/50">
            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Objective */}
        <h4 className="text-lg font-semibold text-white mb-3 line-clamp-2">
          {session.objective}
        </h4>

        {/* Agents Involved */}
        {involvedAgents.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-white/60 mb-2">Agents Working:</div>
            <div className="flex items-center gap-2">
              {involvedAgents.slice(0, 5).map((agent) => (
                <div
                  key={agent!.id}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm"
                  title={agent!.name}
                >
                  {agent!.avatar}
                </div>
              ))}
              {involvedAgents.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                  +{involvedAgents.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Indicator for In Progress */}
        {session.status === 'in_progress' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span>Processing...</span>
              <span>Analyzing objective</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: '0%' }}
                animate={{ width: '60%' }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              {session.status === 'completed' ? 'View Results' : 'View Progress'}
            </span>
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </GlassmorphicPanel>
    </motion.div>
  );
};
