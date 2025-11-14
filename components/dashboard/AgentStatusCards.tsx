'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { AgentStatus } from '@/lib/api/dashboard';
import { Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AgentStatusCardsProps {
  agents: AgentStatus[];
}

const statusColors = {
  available: 'text-green-500',
  busy: 'text-yellow-500',
  offline: 'text-gray-500',
};

const statusLabels = {
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
};

export function AgentStatusCards({ agents }: AgentStatusCardsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">AI Agent Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/dashboard/agents/${agent.id}`}>
              <GlassmorphicCard className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  {/* Agent Avatar */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        {agent.avatar ? (
                          <img 
                            src={agent.avatar} 
                            alt={agent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {agent.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute bottom-0 right-0 flex items-center gap-1 bg-gray-900 rounded-full px-2 py-1 border border-white/10">
                      <Circle 
                        className={`w-2 h-2 fill-current ${statusColors[agent.status]}`}
                      />
                    </div>
                  </div>

                  {/* Agent Info */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    {agent.personality}
                  </p>

                  {/* Stats */}
                  <div className="w-full pt-3 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className={statusColors[agent.status]}>
                        {statusLabels[agent.status]}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Conversations</span>
                      <span className="text-white">{agent.conversationCount}</span>
                    </div>
                    {agent.lastInteraction && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Last Active</span>
                        <span className="text-white">
                          {formatDistanceToNow(new Date(agent.lastInteraction), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassmorphicCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
