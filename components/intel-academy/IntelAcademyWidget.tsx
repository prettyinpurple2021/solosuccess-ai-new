'use client';

import { useEffect, useState, useCallback } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CourseProgressDisplay } from './CourseProgressDisplay';
import { AchievementBadgeShowcase } from './AchievementBadgeShowcase';
import { EnrollmentStatusIndicator } from './EnrollmentStatusIndicator';

interface IntelAcademyWidgetProps {
  className?: string;
}

interface IntegrationStatus {
  connected: boolean;
  integration: {
    id: string;
    lastSyncAt: string | null;
    syncStatus: string;
    isActive: boolean;
  } | null;
  courses?: Array<{
    id: string;
    courseId: string;
    courseName: string;
    courseDescription: string | null;
    thumbnailUrl: string | null;
    progress: number;
    status: string;
    lastAccessedAt: string | null;
  }>;
  achievements?: Array<{
    id: string;
    achievementId: string;
    achievementName: string;
    achievementType: string;
    description: string | null;
    badgeUrl: string | null;
    earnedAt: string;
  }>;
}

export function IntelAcademyWidget({ className }: IntelAcademyWidgetProps) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [cachedData, setCachedData] = useState<IntegrationStatus | null>(null);

  // Fetch integration status
  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/intel-academy/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
        // Cache the data for error state display
        if (data.connected) {
          setCachedData(data);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch status');
      }
    } catch (err) {
      console.error('Error fetching Intel Academy status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load integration status');
      // Use cached data if available
      if (cachedData) {
        setStatus(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, [cachedData]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const response = await fetch('/api/intel-academy/auth');
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Failed to initiate connection');
      }
    } catch (err) {
      console.error('Error connecting to Intel Academy:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(false);
    }
  };

  const handleRedirect = async () => {
    try {
      setError(null);
      // Direct redirect - the API endpoint handles the redirect
      window.open('/api/intel-academy/redirect', '_blank');
    } catch (err) {
      console.error('Error redirecting to Intel Academy:', err);
      setError(err instanceof Error ? err.message : 'Failed to open Intel Academy');
    }
  };

  // Loading state
  if (loading) {
    return (
      <GlassmorphicCard className={className}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </GlassmorphicCard>
    );
  }

  // Disconnected state
  if (!status?.connected) {
    return (
      <GlassmorphicCard className={className}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Intel Academy</h3>
              <p className="text-sm text-gray-400">Premium Learning Platform</p>
            </div>
          </div>

          <p className="text-gray-300 mb-6">
            Connect your Intel Academy account to access courses, track progress, and showcase achievements.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={connecting}
            loading={connecting}
            className="w-full"
          >
            Connect Intel Academy
          </Button>
        </div>
      </GlassmorphicCard>
    );
  }

  // Connected state
  return (
    <GlassmorphicCard className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Intel Academy</h3>
              <EnrollmentStatusIndicator 
                status={status.integration?.syncStatus || 'active'}
                lastSyncAt={status.integration?.lastSyncAt || null}
              />
            </div>
          </div>

          <Button
            onClick={handleRedirect}
            variant="outline"
            size="sm"
          >
            Open Intel Academy
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-400">
                  {error}
                </p>
                <p className="text-xs text-yellow-400/70 mt-1">
                  Showing cached data. Will retry automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <CourseProgressDisplay 
            courses={status.courses}
            onRefresh={fetchStatus}
          />
          <AchievementBadgeShowcase 
            achievements={status.achievements}
            onRefresh={fetchStatus}
          />
        </div>

        {status.integration?.lastSyncAt && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500">
              Last synced: {new Date(status.integration.lastSyncAt).toLocaleString()}
            </p>
            <button
              onClick={fetchStatus}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}
