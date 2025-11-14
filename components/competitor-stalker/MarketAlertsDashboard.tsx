'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  competitorName: string;
  title: string;
  message: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  sourceUrl?: string;
  read: boolean;
  createdAt: string;
}

interface MarketAlertsDashboardProps {
  alerts: Alert[];
  onMarkReadAction: (alertId?: string) => void;
  onDeleteAction: (alertId: string) => void;
}

export const MarketAlertsDashboard: React.FC<MarketAlertsDashboardProps> = ({
  alerts,
  onMarkReadAction,
  onDeleteAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredAlerts = filter === 'unread' 
    ? alerts.filter(a => !a.read)
    : alerts;

  const unreadCount = alerts.filter(a => !a.read).length;

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '📊';
      default:
        return '📝';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Market Alerts</h2>
          <p className="text-white/60">
            Real-time intelligence on competitor activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkReadAction()}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassmorphicPanel padding={false} className="p-4">
          <div className="text-xs text-white/40 uppercase mb-1">Total Alerts</div>
          <div className="text-2xl font-bold text-white">{alerts.length}</div>
        </GlassmorphicPanel>
        <GlassmorphicPanel padding={false} className="p-4">
          <div className="text-xs text-white/40 uppercase mb-1">Unread</div>
          <div className="text-2xl font-bold text-blue-400">{unreadCount}</div>
        </GlassmorphicPanel>
        <GlassmorphicPanel padding={false} className="p-4">
          <div className="text-xs text-white/40 uppercase mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-400">
            {alerts.filter(a => a.importance === 'critical').length}
          </div>
        </GlassmorphicPanel>
        <GlassmorphicPanel padding={false} className="p-4">
          <div className="text-xs text-white/40 uppercase mb-1">High Priority</div>
          <div className="text-2xl font-bold text-orange-400">
            {alerts.filter(a => a.importance === 'high').length}
          </div>
        </GlassmorphicPanel>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          All Alerts
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'unread'
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <GlassmorphicPanel>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'unread' ? 'No unread alerts' : 'No alerts yet'}
            </h3>
            <p className="text-white/60">
              {filter === 'unread' 
                ? 'All caught up! Check back later for new intelligence.'
                : 'Alerts will appear here when competitor activities are detected'}
            </p>
          </div>
        </GlassmorphicPanel>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <GlassmorphicPanel
                  className={`border-l-4 ${getImportanceColor(alert.importance)} ${
                    !alert.read ? 'ring-2 ring-blue-500/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl">{getImportanceIcon(alert.importance)}</div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-mono border ${getImportanceBadge(alert.importance)}`}>
                              {alert.importance.toUpperCase()}
                            </span>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-white">{alert.title}</h4>
                          <p className="text-sm text-blue-400 font-mono">{alert.competitorName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.read && (
                            <button
                              onClick={() => onMarkReadAction(alert.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteAction(alert.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-white/70 mb-3">{alert.message}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                        {alert.sourceUrl && (
                          <a
                            href={alert.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            View Source
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassmorphicPanel>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
