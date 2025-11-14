'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

interface BiasChange {
  biasType: string;
  previousScore: number;
  currentScore: number;
  change: number;
  trend: 'improved' | 'worsened' | 'stable';
}

interface ProgressChartProps {
  biasChanges: BiasChange[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ biasChanges }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improved':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      case 'worsened':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improved':
        return 'text-green-400';
      case 'worsened':
        return 'text-red-400';
      case 'stable':
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {biasChanges.slice(0, 8).map((change, index) => (
        <motion.div
          key={change.biasType}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <GlassmorphicCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTrendIcon(change.trend)}
                <span className="font-semibold text-white capitalize">
                  {change.biasType.replace(/_/g, ' ')}
                </span>
              </div>
              <div className={`text-sm font-semibold ${getTrendColor(change.trend)}`}>
                {change.change > 0 ? '-' : '+'}
                {Math.abs(change.change)} points
              </div>
            </div>

            <div className="space-y-2">
              {/* Previous score bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Previous</span>
                  <span>{change.previousScore}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"
                    style={{ width: `${change.previousScore}%` }}
                  />
                </div>
              </div>

              {/* Current score bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Current</span>
                  <span>{change.currentScore}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      change.trend === 'improved'
                        ? 'bg-gradient-to-r from-green-500 to-teal-500'
                        : change.trend === 'worsened'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${change.currentScore}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>
      ))}
    </div>
  );
};
