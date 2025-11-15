'use client';

import { useState } from 'react';

interface EnrollmentStatusIndicatorProps {
  status: string;
  lastSyncAt: string | null;
  onReconnect?: () => void;
}

export function EnrollmentStatusIndicator({ 
  status, 
  lastSyncAt,
  onReconnect 
}: EnrollmentStatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = (status: string, lastSyncAt: string | null) => {
    // Check if last sync was more than 24 hours ago
    const isSyncPending = lastSyncAt 
      ? (new Date().getTime() - new Date(lastSyncAt).getTime()) > 24 * 60 * 60 * 1000
      : false;

    // Determine status based on sync status and last sync time
    if (status === 'failed' || status === 'error') {
      return {
        label: 'Sync Error',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        dotColor: 'bg-red-500',
        description: 'There was an error syncing your data. Please try reconnecting.',
        showReconnect: true,
      };
    }
    
    if (status === 'inactive' || status === 'disconnected') {
      return {
        label: 'Disconnected',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        dotColor: 'bg-gray-500',
        description: 'Your Intel Academy connection is inactive.',
        showReconnect: true,
      };
    }
    
    if (isSyncPending || status === 'pending') {
      return {
        label: 'Sync Pending',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        dotColor: 'bg-yellow-500',
        description: 'Your data will be synced shortly.',
        showReconnect: false,
      };
    }
    
    // Default to connected/active
    return {
      label: 'Connected',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      dotColor: 'bg-green-500',
      description: 'Your Intel Academy account is connected and syncing.',
      showReconnect: false,
    };
  };

  const config = getStatusConfig(status, lastSyncAt);

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Never synced';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bgColor} hover:opacity-80 transition-opacity cursor-pointer`}
        aria-label="View connection status details"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${config.label === 'Connected' ? 'animate-pulse' : ''}`}></div>
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        <svg
          className={`w-3 h-3 ${config.color} transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Status details dropdown */}
      {showDetails && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDetails(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute top-full left-0 mt-2 w-64 p-4 rounded-lg bg-gray-900 border border-white/20 shadow-xl z-20">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
                  <span className={`text-sm font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {config.description}
                </p>
              </div>

              {lastSyncAt && (
                <div className="pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-500">Last synced</div>
                  <div className="text-sm text-white mt-0.5">
                    {formatLastSync(lastSyncAt)}
                  </div>
                </div>
              )}

              {config.showReconnect && onReconnect && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(false);
                    onReconnect();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
