'use client';

import { useEffect, useState } from 'react';
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
}

export function IntelAcademyWidget({ className }: IntelAcademyWidgetProps) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/intel-academy/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching Intel Academy status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await fetch('/api/intel-academy/auth');
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Intel Academy:', error);
      setConnecting(false);
    }
  };

  const handleRedirect = async () => {
    try {
      const response = await fetch('/api/intel-academy/redirect');
      const data = await response.json();
      
      if (data.success && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
    } catch (error) {
      console.error('Error redirecting to Intel Academy:', error);
    }
  };

  if (loading) {
    return (
      <GlassmorphicCard className={className}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </GlassmorphicCard>
    );
  }

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

          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full"
          >
            {connecting ? 'Connecting...' : 'Connect Intel Academy'}
          </Button>
        </div>
      </GlassmorphicCard>
    );
  }

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
              <EnrollmentStatusIndicator status={status.integration?.syncStatus || 'active'} />
            </div>
          </div>

          <Button
            onClick={handleRedirect}
            variant="outline"
            size="sm"
          >
            Open Academy
          </Button>
        </div>

        <div className="space-y-6">
          <CourseProgressDisplay />
          <AchievementBadgeShowcase />
        </div>

        {status.integration?.lastSyncAt && (
          <p className="text-xs text-gray-500 mt-4">
            Last synced: {new Date(status.integration.lastSyncAt).toLocaleString()}
          </p>
        )}
      </div>
    </GlassmorphicCard>
  );
}
