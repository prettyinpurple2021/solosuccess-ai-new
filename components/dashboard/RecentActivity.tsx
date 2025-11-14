'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { RecentActivity as RecentActivityType } from '@/lib/api/dashboard';
import { 
  MessageSquare, 
  Rocket, 
  FileText, 
  Target,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

const activityIcons = {
  conversation: MessageSquare,
  mission: Rocket,
  content: FileText,
  goal: Target,
};

const activityColors = {
  conversation: 'from-blue-500 to-cyan-500',
  mission: 'from-purple-500 to-pink-500',
  content: 'from-orange-500 to-red-500',
  goal: 'from-green-500 to-emerald-500',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <GlassmorphicCard className="p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Recent Activity</h3>
          <p className="text-gray-400">Start using the platform to see your activity here</p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
      <GlassmorphicCard className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} bg-opacity-20 flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {activity.description}
                      </p>
                      {activity.agentName && (
                        <p className="text-xs text-gray-500 mt-1">
                          with {activity.agentName}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassmorphicCard>
    </div>
  );
}
