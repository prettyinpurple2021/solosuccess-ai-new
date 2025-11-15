'use client';

import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <GlassmorphicCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <motion.p
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {value}
          </motion.p>
          {change !== undefined && (
            <div className={`flex items-center gap-2 text-sm ${getTrendColor()}`}>
              <span className="font-semibold">
                {getTrendIcon()} {Math.abs(change).toFixed(1)}%
              </span>
              {changeLabel && <span className="text-gray-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-blue-400 opacity-50 text-3xl">{icon}</div>
        )}
      </div>
    </GlassmorphicCard>
  );
}
