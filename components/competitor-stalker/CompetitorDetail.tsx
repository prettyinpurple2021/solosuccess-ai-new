'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { useCompetitor, useCompetitorActivities, useUpdateCompetitor } from '@/lib/hooks/useCompetitors';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface CompetitorDetailProps {
  competitorId: string;
}

export const CompetitorDetail: React.FC<CompetitorDetailProps> = ({ competitorId }) => {
  const router = useRouter();
  const { data: competitor, isLoading: loadingCompetitor } = useCompetitor(competitorId);
  const { data: activities, isLoading: loadingActivities } = useCompetitorActivities(competitorId);
  const { mutate: updateCompetitor } = useUpdateCompetitor();

  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'sources'>('overview');

  const handleToggleActive = () => {
    if (competitor) {
      updateCompetitor({
        id: competitor.id,
        data: { isActive: !competitor.isActive },
      });
    }
  };

  if (loadingCompetitor) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Competitor not found</p>
      </div>
    );
  }

  const trackingSources = Object.entries(competitor.trackingSources)
    .filter(([_, value]) => {
      if (typeof value === 'boolean') return value;
      return value && value.trim() !== '';
    })
    .map(([key, value]) => ({ key, value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{competitor.name}</h1>
            {competitor.industry && (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-300 rounded">
                {competitor.industry}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={competitor.isActive ? 'outline' : 'primary'}
            onClick={handleToggleActive}
          >
            {competitor.isActive ? 'Pause Tracking' : 'Resume Tracking'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(`/competitor-stalker?edit=${competitor.id}`)}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'activities'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Activities
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'sources'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Tracking Sources
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GlassmorphicPanel>
            <h3 className="text-xl font-semibold text-white mb-4">About</h3>
            {competitor.description ? (
              <p className="text-white/70">{competitor.description}</p>
            ) : (
              <p className="text-white/40 italic">No description provided</p>
            )}
          </GlassmorphicPanel>

          {competitor.website && (
            <GlassmorphicPanel>
              <h3 className="text-xl font-semibold text-white mb-4">Website</h3>
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                {competitor.website}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </GlassmorphicPanel>
          )}

          <GlassmorphicPanel>
            <h3 className="text-xl font-semibold text-white mb-4">Tracking Status</h3>
            <div className="flex items-center gap-3">
              {competitor.isActive ? (
                <>
                  <span className="flex items-center gap-2 text-green-400">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    Active
                  </span>
                  <span className="text-white/60">
                    Monitoring {trackingSources.length} source{trackingSources.length !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <span className="text-white/40">Tracking paused</span>
              )}
            </div>
          </GlassmorphicPanel>
        </motion.div>
      )}

      {activeTab === 'activities' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {loadingActivities ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <GlassmorphicPanel key={activity.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        activity.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                        activity.importance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                        activity.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {activity.importance}
                      </span>
                      <span className="text-xs text-white/40">
                        {format(new Date(activity.detectedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{activity.title}</h4>
                    {activity.description && (
                      <p className="text-white/70 text-sm mb-2">{activity.description}</p>
                    )}
                    {activity.sourceUrl && (
                      <a
                        href={activity.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        View source
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </GlassmorphicPanel>
            ))
          ) : (
            <GlassmorphicPanel>
              <div className="text-center py-8">
                <p className="text-white/60">No activities detected yet</p>
                <p className="text-white/40 text-sm mt-2">
                  Activities will appear here as we monitor your competitor
                </p>
              </div>
            </GlassmorphicPanel>
          )}
        </motion.div>
      )}

      {activeTab === 'sources' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassmorphicPanel>
            <h3 className="text-xl font-semibold text-white mb-4">Configured Tracking Sources</h3>
            {trackingSources.length > 0 ? (
              <div className="space-y-3">
                {trackingSources.map(({ key, value }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{key}</p>
                        {typeof value === 'string' && value !== 'true' && (
                          <p className="text-white/60 text-sm">{value}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No tracking sources configured</p>
            )}
          </GlassmorphicPanel>
        </motion.div>
      )}
    </div>
  );
};
