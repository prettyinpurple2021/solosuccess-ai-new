'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { GlassmorphicChart } from '@/components/analytics/GlassmorphicChart';
import { InsightNudgeCard } from '@/components/analytics/InsightNudgeCard';
import { ExportButton } from '@/components/analytics/ExportButton';
import { ShareButton } from '@/components/analytics/ShareButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import {
  useAnalyticsMetrics,
  useAnalyticsTrends,
  useAnalyticsData,
  useIntegrations,
} from '@/lib/hooks/useAnalytics';
import {
  useInsights,
  useGenerateInsights,
  useMarkInsightAsActioned,
  useDismissInsight,
} from '@/lib/hooks/useInsights';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }, []);

  const { data: metricsData, isLoading: metricsLoading } =
    useAnalyticsMetrics(dateRange);
  const { data: trendsData, isLoading: trendsLoading } =
    useAnalyticsTrends(dateRange);
  const { data: chartData, isLoading: chartLoading } =
    useAnalyticsData(dateRange, 'day');
  const { data: integrationsData } = useIntegrations();
  const { data: insightsData } = useInsights(5);
  const generateInsights = useGenerateInsights();
  const markAsActioned = useMarkInsightAsActioned();
  const dismissInsight = useDismissInsight();

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getTrendForMetric = (metricName: string) => {
    if (!trendsData?.trends) return undefined;
    const trend = trendsData.trends.find((t: any) => t.metric === metricName);
    return trend?.direction;
  };

  const getChangeForMetric = (metricName: string) => {
    if (!trendsData?.trends) return undefined;
    const trend = trendsData.trends.find((t: any) => t.metric === metricName);
    return trend?.changePercent;
  };

  if (metricsLoading || trendsLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const metrics = metricsData?.metrics || {};
  const hasIntegrations = integrationsData?.integrations?.length > 0;

  // Transform chart data for visualization
  const transformedChartData = chartData?.data?.map((item: any) => {
    const result: any = { period: item.period };
    
    // Extract metrics from different sources
    if (item.sources.google_analytics) {
      result.users = item.sources.google_analytics.users || 0;
      result.sessions = item.sources.google_analytics.sessions || 0;
    }
    
    if (item.sources.stripe) {
      result.revenue = item.sources.stripe.revenue || 0;
    }
    
    return result;
  }) || [];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">
              Track your business metrics and insights
            </p>
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={transformedChartData}
              filename={`analytics-${dateRange.startDate}-to-${dateRange.endDate}`}
              formats={['json', 'csv']}
            />
            <ShareButton
              title="Analytics Dashboard"
              description="Check out my business analytics"
            />
          </div>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector onDateRangeChange={handleDateRangeChange} />

        {/* Insight Nudges */}
        {insightsData?.insights && insightsData.insights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                💡 Insights & Recommendations
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateInsights.mutate()}
                disabled={generateInsights.isPending}
              >
                {generateInsights.isPending ? 'Generating...' : 'Refresh Insights'}
              </Button>
            </div>
            <div className="space-y-4">
              {insightsData.insights.map((insight: any) => (
                <InsightNudgeCard
                  key={insight.id}
                  insight={insight}
                  onAction={(id, action) =>
                    markAsActioned.mutate({ insightId: id, action })
                  }
                  onDismiss={(id) => dismissInsight.mutate(id)}
                />
              ))}
            </div>
          </div>
        )}

        {!hasIntegrations && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              Connect your data sources to see analytics. Go to integrations to
              connect Google Analytics, Stripe, or other platforms.
            </p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue || 0)}
            change={getChangeForMetric('revenue')}
            changeLabel="vs previous period"
            trend={getTrendForMetric('revenue')}
            icon="💰"
          />
          <MetricCard
            title="Total Users"
            value={formatNumber(metrics.totalUsers || 0)}
            change={getChangeForMetric('users')}
            changeLabel="vs previous period"
            trend={getTrendForMetric('users')}
            icon="👥"
          />
          <MetricCard
            title="Total Sessions"
            value={formatNumber(metrics.totalSessions || 0)}
            change={getChangeForMetric('sessions')}
            changeLabel="vs previous period"
            trend={getTrendForMetric('sessions')}
            icon="📊"
          />
          <MetricCard
            title="Avg Session Duration"
            value={`${Math.round(metrics.avgSessionDuration || 0)}s`}
            icon="⏱️"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transformedChartData.some((d: any) => d.revenue > 0) && (
            <GlassmorphicChart
              title="Revenue Over Time"
              subtitle="Track your revenue growth"
              data={transformedChartData}
              dataKeys={[
                { key: 'revenue', label: 'Revenue', color: '#10B981' },
              ]}
              type="area"
              height={300}
              animated={true}
            />
          )}

          {transformedChartData.some((d: any) => d.users > 0) && (
            <GlassmorphicChart
              title="Users & Sessions"
              subtitle="Monitor user engagement"
              data={transformedChartData}
              dataKeys={[
                { key: 'users', label: 'Users', color: '#3B82F6' },
                { key: 'sessions', label: 'Sessions', color: '#8B5CF6' },
              ]}
              type="line"
              height={300}
              animated={true}
            />
          )}
        </div>

        {/* Growth Rate */}
        {metrics.growthRate !== undefined && (
          <div className="grid grid-cols-1 gap-6">
            <MetricCard
              title="Growth Rate"
              value={`${metrics.growthRate.toFixed(1)}%`}
              trend={metrics.growthRate > 0 ? 'up' : metrics.growthRate < 0 ? 'down' : 'stable'}
              icon="📈"
            />
          </div>
        )}
      </div>
    </div>
  );
}
