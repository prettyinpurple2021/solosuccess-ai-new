'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { DashboardMetrics } from '@/lib/api/dashboard';
import { 
  MessageSquare, 
  Target, 
  Rocket, 
  FileText, 
  TrendingUp,
  Crown
} from 'lucide-react';

interface MetricsOverviewProps {
  metrics: DashboardMetrics;
}

const metricIcons = {
  conversations: MessageSquare,
  goals: Target,
  missions: Rocket,
  content: FileText,
  activity: TrendingUp,
  subscription: Crown,
};

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const metricCards = [
    {
      key: 'conversations',
      label: 'Total Conversations',
      value: metrics.totalConversations,
      icon: metricIcons.conversations,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'goals',
      label: 'Active Goals',
      value: metrics.activeGoals,
      icon: metricIcons.goals,
      color: 'from-purple-500 to-pink-500',
    },
    {
      key: 'missions',
      label: 'Completed Missions',
      value: metrics.completedMissions,
      icon: metricIcons.missions,
      color: 'from-green-500 to-emerald-500',
    },
    {
      key: 'content',
      label: 'Generated Content',
      value: metrics.generatedContent,
      icon: metricIcons.content,
      color: 'from-orange-500 to-red-500',
    },
    {
      key: 'activity',
      label: 'Weekly Activity',
      value: metrics.weeklyActivity,
      icon: metricIcons.activity,
      color: 'from-teal-500 to-blue-500',
    },
    {
      key: 'subscription',
      label: 'Subscription',
      value: metrics.subscriptionTier.toUpperCase(),
      icon: metricIcons.subscription,
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassmorphicCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
                    {metric.label}
                  </p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} bg-opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        );
      })}
    </div>
  );
}
