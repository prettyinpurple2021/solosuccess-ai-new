'use client';

import { useEffect, useState } from 'react';
import { AnimatedGradientBackground } from '@/components/ui/AnimatedGradientBackground';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AgentStatusCards } from '@/components/dashboard/AgentStatusCards';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dashboardApi, DashboardMetrics, RecentActivity as RecentActivityType, AgentStatus } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityType[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [metricsData, activityData, agentsData] = await Promise.all([
          dashboardApi.getMetrics(),
          dashboardApi.getRecentActivity(10),
          dashboardApi.getAgentStatuses(),
        ]);

        setMetrics(metricsData);
        setRecentActivity(activityData);
        setAgentStatuses(agentsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedGradientBackground />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedGradientBackground />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-400">{error || 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <AnimatedGradientBackground />
      <div className="relative z-10 space-y-8 p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Metrics Overview */}
        <MetricsOverview metrics={metrics} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />

          {/* Placeholder for future widgets */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Insights</h2>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-gray-400">
                AI-powered insights coming soon
              </p>
            </div>
          </div>
        </div>

        {/* AI Agent Status Cards */}
        <AgentStatusCards agents={agentStatuses} />
      </div>
    </DashboardLayout>
  );
}
