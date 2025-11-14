'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { CompetitorProfile } from '@/lib/hooks/useCompetitors';
import { formatDistanceToNow } from 'date-fns';

interface DossierCardProps {
  competitor: CompetitorProfile;
  onViewAction: (id: string) => void;
}

export const DossierCard: React.FC<DossierCardProps> = ({
  competitor,
  onViewAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -10 }}
      animate={{ opacity: 1, rotateY: 0 }}
      whileHover={{ scale: 1.02, rotateY: 2 }}
      transition={{ duration: 0.3 }}
      onClick={() => onViewAction(competitor.id)}
      className="cursor-pointer"
    >
      <GlassmorphicPanel className="relative overflow-hidden">
        {/* Classified stamp */}
        <div className="absolute top-4 right-4 opacity-20">
          <div className="border-4 border-red-500 rounded-full w-24 h-24 flex items-center justify-center rotate-12">
            <span className="text-red-500 font-bold text-xs">CLASSIFIED</span>
          </div>
        </div>

        {/* Dossier header */}
        <div className="border-b border-white/10 pb-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Target Dossier
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {competitor.name}
              </h3>
              {competitor.industry && (
                <div className="inline-block px-3 py-1 bg-red-500/20 text-red-300 text-xs font-mono rounded">
                  SECTOR: {competitor.industry.toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-white/40 mb-1">STATUS</div>
              {competitor.isActive ? (
                <div className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-mono">ACTIVE</span>
                </div>
              ) : (
                <div className="text-xs font-mono text-white/40">INACTIVE</div>
              )}
            </div>
          </div>
        </div>

        {/* Intelligence brief */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-xs text-white/40 uppercase w-24">Intel:</div>
            <div className="flex-1 text-sm text-white/70">
              {competitor.description || 'No intelligence available'}
            </div>
          </div>

          {competitor.website && (
            <div className="flex items-start gap-3">
              <div className="text-xs text-white/40 uppercase w-24">Location:</div>
              <div className="flex-1 text-sm text-blue-400 font-mono truncate">
                {competitor.website.replace(/^https?:\/\//, '')}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="text-xs text-white/40 uppercase w-24">Tracked:</div>
            <div className="flex-1 text-sm text-white/60">
              {formatDistanceToNow(new Date(competitor.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-xs text-white/40 uppercase w-24">Sources:</div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {Object.entries(competitor.trackingSources).map(([key, value]) => {
                  if (!value || value === false) return null;
                  return (
                    <div
                      key={key}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 font-mono"
                    >
                      {key.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-white/40 font-mono">
            ID: {competitor.id.substring(0, 8).toUpperCase()}
          </div>
          <button className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1">
            VIEW DOSSIER
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </GlassmorphicPanel>
    </motion.div>
  );
};
