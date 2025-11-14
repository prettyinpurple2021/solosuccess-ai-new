'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { MissionControlForm } from '@/components/mission-control/MissionControlForm';
import { ActiveSessionCard } from '@/components/mission-control/ActiveSessionCard';
import { useMissionControlSessions } from '@/lib/hooks/useMissionControlSessions';

export default function MissionControlPage() {
  const router = useRouter();
  const { sessions, isLoading } = useMissionControlSessions();
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);

  const activeSessions = sessions?.filter((s: any) => s.status === 'in_progress') || [];
  const hasActiveSessions = activeSessions.length > 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Mission Control
              </h1>
              <p className="text-white/70 text-lg">
                Delegate complex objectives to your AI team for comprehensive solutions
              </p>
            </div>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setShowNewSessionForm(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Mission
            </Button>
          </div>
        </motion.div>

        {/* New Session Form */}
        {showNewSessionForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <MissionControlForm
              onCancel={() => setShowNewSessionForm(false)}
              onSuccess={(sessionId) => {
                setShowNewSessionForm(false);
                router.push(`/mission-control/${sessionId}`);
              }}
            />
          </motion.div>
        )}

        {/* Active Sessions */}
        {hasActiveSessions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              Active Missions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSessions.map((session: any) => (
                <ActiveSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => router.push(`/mission-control/${session.id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Getting Started / Empty State */}
        {!hasActiveSessions && !showNewSessionForm && (
          <GlassmorphicPanel className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Welcome to Mission Control
              </h3>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Mission Control is your command center for complex business objectives. 
                Describe what you want to achieve, and our AI agents will collaborate 
                to create a comprehensive, actionable plan.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                <div className="text-left">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    1. Define Your Objective
                  </h4>
                  <p className="text-white/60 text-sm">
                    Describe your business goal or challenge in detail
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-3xl mb-2">🤖</div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    2. AI Team Collaborates
                  </h4>
                  <p className="text-white/60 text-sm">
                    Our agents work together to analyze and plan
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-3xl mb-2">✅</div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    3. Get Actionable Results
                  </h4>
                  <p className="text-white/60 text-sm">
                    Receive a comprehensive plan with clear next steps
                  </p>
                </div>
              </div>

              <Button
                variant="gradient"
                size="lg"
                onClick={() => setShowNewSessionForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Your First Mission
              </Button>
            </motion.div>
          </GlassmorphicPanel>
        )}

        {/* Recent Completed Sessions */}
        {sessions && sessions.filter((s: any) => s.status === 'completed').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white">
                Recent Missions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/mission-control/history')}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions
                .filter((s: any) => s.status === 'completed')
                .slice(0, 3)
                .map((session: any) => (
                  <ActiveSessionCard
                    key={session.id}
                    session={session}
                    onClick={() => router.push(`/mission-control/${session.id}`)}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
