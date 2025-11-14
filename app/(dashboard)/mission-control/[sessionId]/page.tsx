'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { ProgressTracker } from '@/components/mission-control/ProgressTracker';
import { ResultsDisplay } from '@/components/mission-control/ResultsDisplay';
import { useMissionControlSession } from '@/lib/hooks/useMissionControlSessions';
import { formatDistanceToNow } from 'date-fns';

export default function MissionControlSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { session, isLoading, refetch } = useMissionControlSession(sessionId);

  // Poll for updates when session is in progress
  useEffect(() => {
    if (session?.status === 'in_progress') {
      const interval = setInterval(() => {
        refetch();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [session?.status, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassmorphicPanel className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/70">Loading mission details...</p>
        </GlassmorphicPanel>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassmorphicPanel className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Mission Not Found
          </h3>
          <p className="text-white/70 mb-6">
            The mission you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="outline" onClick={() => router.push('/mission-control')}>
            Back to Mission Control
          </Button>
        </GlassmorphicPanel>
      </div>
    );
  }

  const isInProgress = session.status === 'in_progress';
  const isCompleted = session.status === 'completed';
  const isFailed = session.status === 'failed';

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/mission-control')}
                className="mb-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Mission Control
              </Button>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {session.objective}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>
                  Started {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </span>
                {isCompleted && session.completedAt && (
                  <span>
                    • Completed {formatDistanceToNow(new Date(session.completedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              isInProgress ? 'bg-blue-500/20 text-blue-400' :
              isCompleted ? 'bg-green-500/20 text-green-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              <span>
                {isInProgress ? '⚡' : isCompleted ? '✅' : '❌'}
              </span>
              <span className="font-medium">
                {isInProgress ? 'In Progress' : isCompleted ? 'Completed' : 'Failed'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker (for in-progress sessions) */}
        {isInProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ProgressTracker session={session} />
          </motion.div>
        )}

        {/* Results Display (for completed sessions) */}
        {isCompleted && session.results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ResultsDisplay session={session} />
          </motion.div>
        )}

        {/* Failed State */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassmorphicPanel className="p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Mission Failed
              </h3>
              <p className="text-white/70 mb-6">
                We encountered an error while processing your mission. Please try again.
              </p>
              <Button
                variant="gradient"
                onClick={() => router.push('/mission-control')}
              >
                Start New Mission
              </Button>
            </GlassmorphicPanel>
          </motion.div>
        )}
      </div>
    </div>
  );
}
