'use client';

import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, BookOpen } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { cn } from '@/lib/utils';

interface Recommendation {
  biasType: string;
  priority: string;
  title: string;
  actions: string[];
  resources: string[];
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index,
}) => {
  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'critical':
        return 'from-red-500 to-orange-500';
      case 'high':
        return 'from-orange-500 to-yellow-500';
      case 'medium':
        return 'from-blue-500 to-purple-500';
      case 'low':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassmorphicCard className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
            getPriorityColor()
          )}>
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">
              {recommendation.title}
            </h3>
            <span className="text-sm text-gray-400 capitalize">
              {recommendation.priority} Priority
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Action Steps
            </h4>
            <div className="space-y-2">
              {recommendation.actions.map((action, actionIndex) => (
                <motion.div
                  key={actionIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + actionIndex * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-white">{actionIndex + 1}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">
                    {action}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {recommendation.resources && recommendation.resources.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Resources
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendation.resources.map((resource, resourceIndex) => (
                  <span
                    key={resourceIndex}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs"
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};
