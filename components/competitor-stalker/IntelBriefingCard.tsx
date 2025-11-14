'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { format } from 'date-fns';

interface IntelBriefingCardProps {
  briefing: {
    period: string;
    summary: string;
    totalActivities: number;
    criticalAlerts: number;
    sections: Array<{
      title: string;
      content: string;
      importance: 'low' | 'medium' | 'high' | 'critical';
      activities: any[];
    }>;
  };
  onViewFullAction: () => void;
}

export const IntelBriefingCard: React.FC<IntelBriefingCardProps> = ({
  briefing,
  onViewFullAction,
}) => {
  const importanceColors = {
    critical: 'from-red-500 to-red-600',
    high: 'from-orange-500 to-orange-600',
    medium: 'from-yellow-500 to-yellow-600',
    low: 'from-blue-500 to-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassmorphicPanel className="relative overflow-hidden">
        {/* Top secret header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
        
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🕵️</span>
                <h3 className="text-xl font-bold text-white">Intelligence Briefing</h3>
              </div>
              <div className="text-sm text-white/60 font-mono">{briefing.period}</div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300 font-mono mb-2">
                TOP SECRET
              </div>
              <div className="text-xs text-white/40">
                {format(new Date(), 'HH:mm:ss')}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-xs text-white/40 uppercase mb-2">Executive Summary</div>
            <p className="text-sm text-white/80">{briefing.summary}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-blue-300 uppercase mb-1">Total Intel</div>
              <div className="text-2xl font-bold text-white">{briefing.totalActivities}</div>
              <div className="text-xs text-white/60">Activities Detected</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg">
              <div className="text-xs text-red-300 uppercase mb-1">Priority</div>
              <div className="text-2xl font-bold text-white">{briefing.criticalAlerts}</div>
              <div className="text-xs text-white/60">Critical Alerts</div>
            </div>
          </div>

          {/* Sections preview */}
          {briefing.sections.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-white/40 uppercase">Intelligence Sections</div>
              {briefing.sections.slice(0, 3).map((section, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${importanceColors[section.importance]}`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-1">{section.title}</div>
                    <div className="text-xs text-white/60">{section.activities.length} activities</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-mono ${
                    section.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                    section.importance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    section.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {section.importance.toUpperCase()}
                  </div>
                </div>
              ))}
              {briefing.sections.length > 3 && (
                <div className="text-xs text-white/40 text-center">
                  +{briefing.sections.length - 3} more sections
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={onViewFullAction}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Full Briefing
          </button>
        </div>
      </GlassmorphicPanel>
    </motion.div>
  );
};
