'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { AGENTS } from '@/lib/constants/agents';
import { formatDistanceToNow, format } from 'date-fns';

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

interface SessionHistoryCardProps {
  session: MissionControlSession;
  onView: () => void;
  onDelete: () => void;
}

export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  session,
  onView,
  onDelete,
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
    <GlassmorphicPanel className="hover:border-white/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Status and Date */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
              <span>{config.icon}</span>
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div className="text-xs text-white/50">
              {format(new Date(session.createdAt), 'MMM d, yyyy')} • {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </div>
          </div>

          {/* Objective */}
          <h4 className="text-lg font-semibold text-white mb-3 line-clamp-2">
            {session.objective}
          </h4>

          {/* Agents */}
          {involvedAgents.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-white/60">Agents:</span>
              <div className="flex items-center gap-1">
                {involvedAgents.slice(0, 5).map((agent) => (
                  <div
                    key={agent!.id}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs"
                    title={agent!.name}
                  >
                    {agent!.avatar}
                  </div>
                ))}
                {involvedAgents.length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                    +{involvedAgents.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {session.status === 'completed' && session.completedAt && (
            <div className="text-xs text-white/50">
              Completed {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onView}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>
    </GlassmorphicPanel>
  );
};
