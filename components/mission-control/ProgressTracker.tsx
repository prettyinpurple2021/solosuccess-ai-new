'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { AGENTS } from '@/lib/constants/agents';

interface MissionControlSession {
  id: string;
  objective: string;
  status: string;
  agentsInvolved: string[];
  context: any;
  results?: any;
  createdAt: string;
  updatedAt: string;
}

interface ProgressTrackerProps {
  session: MissionControlSession;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ session }) => {
  const involvedAgents = session.agentsInvolved
    .map(id => AGENTS.find(a => a.id === id))
    .filter(Boolean);

  // Simulate progress stages
  const stages = [
    { id: 1, label: 'Analyzing Objective', status: 'completed', icon: '🔍' },
    { id: 2, label: 'Assigning Agents', status: 'completed', icon: '🤖' },
    { id: 3, label: 'Gathering Insights', status: 'in_progress', icon: '💡' },
    { id: 4, label: 'Creating Strategy', status: 'pending', icon: '📋' },
    { id: 5, label: 'Finalizing Plan', status: 'pending', icon: '✨' },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <GlassmorphicPanel>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Mission Progress
          </h3>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-white/70">Processing...</span>
          </div>
        </div>

        {/* Progress Stages */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-start gap-4">
              {/* Stage Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                stage.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                stage.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-white/10 text-white/40'
              }`}>
                {stage.status === 'completed' ? '✓' : stage.icon}
              </div>

              {/* Stage Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${
                    stage.status === 'pending' ? 'text-white/40' : 'text-white'
                  }`}>
                    {stage.label}
                  </h4>
                  <span className={`text-xs ${
                    stage.status === 'completed' ? 'text-green-400' :
                    stage.status === 'in_progress' ? 'text-blue-400' :
                    'text-white/40'
                  }`}>
                    {stage.status === 'completed' ? 'Complete' :
                     stage.status === 'in_progress' ? 'In Progress' :
                     'Pending'}
                  </span>
                </div>

                {/* Progress Bar for In Progress */}
                {stage.status === 'in_progress' && (
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '70%' }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="absolute left-5 mt-10 w-0.5 h-8 bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </GlassmorphicPanel>

      {/* Active Agents */}
      {involvedAgents.length > 0 && (
        <GlassmorphicPanel>
          <h3 className="text-xl font-semibold text-white mb-4">
            Agents Working on This Mission
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {involvedAgents.map((agent) => (
              <motion.div
                key={agent!.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                  {agent!.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{agent!.name}</h4>
                  <p className="text-sm text-white/60">{agent!.role}</p>
                </div>
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </GlassmorphicPanel>
      )}

      {/* Context Information */}
      {session.context && Object.keys(session.context).length > 0 && (
        <GlassmorphicPanel>
          <h3 className="text-xl font-semibold text-white mb-4">
            Mission Context
          </h3>
          <div className="space-y-3">
            {session.context.businessType && (
              <div>
                <span className="text-sm text-white/60">Business Type:</span>
                <p className="text-white">{session.context.businessType}</p>
              </div>
            )}
            {session.context.timeline && (
              <div>
                <span className="text-sm text-white/60">Timeline:</span>
                <p className="text-white">{session.context.timeline}</p>
              </div>
            )}
            {session.context.constraints && session.context.constraints.length > 0 && (
              <div>
                <span className="text-sm text-white/60">Constraints:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {session.context.constraints.map((constraint: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
                    >
                      {constraint}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassmorphicPanel>
      )}
    </div>
  );
};
