'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { CompetitorProfile } from '@/lib/hooks/useCompetitors';
import { formatDistanceToNow } from 'date-fns';

interface CompetitorCardProps {
  competitor: CompetitorProfile;
  onViewAction: (id: string) => void;
  onEditAction: (competitor: CompetitorProfile) => void;
  onDeleteAction: (id: string) => void;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({
  competitor,
  onViewAction,
  onEditAction,
  onDeleteAction,
}) => {
  const trackingSourcesCount = Object.values(competitor.trackingSources).filter(
    (value) => value && value !== false
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <GlassmorphicPanel className="cursor-pointer" onClick={() => onViewAction(competitor.id)}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">
                {competitor.name}
              </h3>
              {competitor.industry && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded">
                  {competitor.industry}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditAction(competitor);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete ${competitor.name}?`)) {
                    onDeleteAction(competitor.id);
                  }
                }}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {competitor.description && (
            <p className="text-sm text-white/70 line-clamp-2">
              {competitor.description}
            </p>
          )}

          {/* Website */}
          {competitor.website && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:text-blue-400 transition-colors truncate"
              >
                {competitor.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{trackingSourcesCount} source{trackingSourcesCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              {competitor.isActive ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Active
                </span>
              ) : (
                <span className="text-xs text-white/40">Inactive</span>
              )}
              <span className="text-xs text-white/40">
                Added {formatDistanceToNow(new Date(competitor.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </GlassmorphicPanel>
    </motion.div>
  );
};
