'use client';

import React, { useState } from 'react';
import { DossierCard } from '@/components/competitor-stalker/DossierCard';
import { IntelBriefingCard } from '@/components/competitor-stalker/IntelBriefingCard';
import { MarketAlertsDashboard } from '@/components/competitor-stalker/MarketAlertsDashboard';
import { Button } from '@/components/ui/Button';
import { useCompetitors } from '@/lib/hooks/useCompetitors';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CompetitorStalkerDashboard() {
  const router = useRouter();
  const { data: competitors, isLoading } = useCompetitors();
  const [activeTab, setActiveTab] = useState<'overview' | 'dossiers' | 'alerts'>('overview');

  // Mock data for briefing and alerts (would come from API in production)
  const mockBriefing = {
    period: 'Last 24 Hours',
    summary: 'Moderate activity detected across tracked competitors with 2 high-priority updates requiring attention.',
    totalActivities: 12,
    criticalAlerts: 0,
    sections: [
      {
        title: '⚠️ High Priority Updates',
        content: '2 significant updates from your competitors',
        importance: 'high' as const,
        activities: [],
      },
      {
        title: '📊 Notable Changes',
        content: '5 moderate changes detected',
        importance: 'medium' as const,
        activities: [],
      },
    ],
  };

  const mockAlerts: any[] = [];

  return (
    <div className="min-h-screen p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8 border border-white/10">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">🕵️</span>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Competitor Stalker</h1>
                <p className="text-white/70">Intelligence Operations Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-300 font-mono">SYSTEMS OPERATIONAL</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
                <span className="text-sm text-white/70 font-mono">
                  {competitors?.length || 0} TARGETS TRACKED
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`px-6 py-3 text-sm font-medium transition-all ${
            activeTab === 'dossiers'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          📁 Target Dossiers
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 text-sm font-medium transition-all ${
            activeTab === 'alerts'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🚨 Market Alerts
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Intelligence Briefing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IntelBriefingCard
              briefing={mockBriefing}
              onViewFullAction={() => router.push('/competitor-stalker/briefings')}
            />
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/competitor-stalker')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Target
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {/* Trigger manual scan */}}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Run Manual Scan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/competitor-stalker/settings')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Alert Settings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Recent Dossiers */}
          {competitors && competitors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Active Targets</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('dossiers')}
                >
                  View All →
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitors.slice(0, 3).map((competitor) => (
                  <DossierCard
                    key={competitor.id}
                    competitor={competitor}
                    onViewAction={(id) => router.push(`/competitor-stalker/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dossiers' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : competitors && competitors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitors.map((competitor) => (
                <DossierCard
                  key={competitor.id}
                  competitor={competitor}
                  onViewAction={(id) => router.push(`/competitor-stalker/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Targets Tracked</h3>
              <p className="text-white/60 mb-6">Start tracking competitors to gather intelligence</p>
              <Button variant="gradient" onClick={() => router.push('/competitor-stalker')}>
                Add First Target
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <MarketAlertsDashboard
          alerts={mockAlerts}
          onMarkReadAction={(alertId) => console.log('Mark read:', alertId)}
          onDeleteAction={(alertId) => console.log('Delete:', alertId)}
        />
      )}
    </div>
  );
}
