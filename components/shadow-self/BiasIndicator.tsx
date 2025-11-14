'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BiasIndicatorProps {
  biasType: string;
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  name: string;
  description: string;
}

export const BiasIndicator: React.FC<BiasIndicatorProps> = ({
  biasType,
  score,
  severity,
  name,
  description,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-orange-500';
      case 'high':
        return 'from-orange-500 to-yellow-500';
      case 'medium':
        return 'from-yellow-500 to-blue-500';
      case 'low':
        return 'from-green-500 to-teal-500';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityBg = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-xl backdrop-blur-xl border',
        getSeverityBg()
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg bg-gradient-to-br',
            getSeverityColor()
          )}>
            {getSeverityIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{name}</h3>
            <p className="text-sm text-gray-400 capitalize">{severity} severity</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-xs text-gray-400">Risk Score</div>
        </div>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Score bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r', getSeverityColor())}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};
