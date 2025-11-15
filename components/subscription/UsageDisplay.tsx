'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Target,
  FileText,
  Users,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';

interface UsageData {
  current: number;
  limit: number;
  percentage: number;
}

interface UsageSummary {
  conversations: UsageData;
  missionControl: UsageData;
  contentGeneration: UsageData;
  competitorProfiles: UsageData;
  chaosSimulations: UsageData;
  shadowAssessments: UsageData;
}

interface UsageDisplayProps {
  userId: string;
}

const usageIcons = {
  conversations: MessageSquare,
  missionControl: Target,
  contentGeneration: FileText,
  competitorProfiles: Users,
  chaosSimulations: AlertTriangle,
  shadowAssessments: Brain,
};

const usageLabels = {
  conversations: 'Conversations',
  missionControl: 'Mission Control',
  contentGeneration: 'Content Generated',
  competitorProfiles: 'Competitor Profiles',
  chaosSimulations: 'Chaos Simulations',
  shadowAssessments: 'Shadow Assessments',
};

export function UsageDisplay({ userId }: UsageDisplayProps) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [tier, setTier] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, [userId]);

  const fetchUsage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscription/usage?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
        setTier(data.tier);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!usage) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <GlassmorphicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Usage This Month</h3>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold capitalize">
          {tier} Plan
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(usage).map(([key, data], index) => {
          const Icon = usageIcons[key as keyof typeof usageIcons];
          const label = usageLabels[key as keyof typeof usageLabels];
          const isUnlimited = data.limit === -1;
          const isLocked = data.limit === 0;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{label}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {isLocked ? (
                    <span className="text-red-400">Locked</span>
                  ) : isUnlimited ? (
                    <span className="text-green-400">Unlimited</span>
                  ) : (
                    `${data.current} / ${data.limit}`
                  )}
                </span>
              </div>

              {!isUnlimited && !isLocked && (
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`h-full ${getProgressColor(data.percentage)}`}
                  />
                </div>
              )}

              {isLocked && (
                <p className="text-xs text-gray-500">
                  Upgrade to unlock this feature
                </p>
              )}

              {!isUnlimited && !isLocked && data.percentage >= 80 && (
                <p className="text-xs text-yellow-400">
                  {data.percentage >= 100
                    ? 'Limit reached. Upgrade for unlimited access.'
                    : 'Approaching limit. Consider upgrading.'}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {tier === 'free' && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-300 text-sm mb-4">
            Upgrade to unlock unlimited access to all features
          </p>
          <Button
            onClick={() => (window.location.href = '/pricing')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            View Plans
          </Button>
        </div>
      )}
    </GlassmorphicCard>
  );
}
