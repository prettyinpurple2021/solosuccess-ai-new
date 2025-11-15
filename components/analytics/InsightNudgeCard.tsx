'use client';

import { useState } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface InsightNudgeCardProps {
  insight: {
    id: string;
    title: string;
    description: string;
    priority: string;
    recommendations?: string[];
  };
  onAction: (insightId: string, action: string) => void;
  onDismiss: (insightId: string) => void;
}

export function InsightNudgeCard({
  insight,
  onAction,
  onDismiss,
}: InsightNudgeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/5';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/5';
      case 'medium':
        return 'border-blue-500/50 bg-blue-500/5';
      default:
        return 'border-gray-500/50 bg-gray-500/5';
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400',
      high: 'bg-orange-500/20 text-orange-400',
      medium: 'bg-blue-500/20 text-blue-400',
      low: 'bg-gray-500/20 text-gray-400',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${colors[insight.priority as keyof typeof colors]}`}
      >
        {insight.priority.toUpperCase()}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <GlassmorphicCard className={`p-6 border ${getPriorityColor()}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {insight.title}
              </h3>
              {getPriorityBadge()}
            </div>
            <p className="text-gray-300 text-sm">{insight.description}</p>
          </div>
          <button
            onClick={() => onDismiss(insight.id)}
            className="text-gray-400 hover:text-white transition-colors ml-4"
          >
            ✕
          </button>
        </div>

        {insight.recommendations && insight.recommendations.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium mb-3 flex items-center gap-2"
            >
              {expanded ? '▼' : '▶'} View Recommendations
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Recommended Actions:
                    </h4>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAction(insight.id, 'completed')}
          >
            Mark as Done
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
}
