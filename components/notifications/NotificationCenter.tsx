'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationCategory } from '@/lib/services/notification-service';

const categories: { value: NotificationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai_agents', label: 'AI Agents' },
  { value: 'mission_control', label: 'Mission Control' },
  { value: 'competitor_intelligence', label: 'Competitors' },
  { value: 'insights', label: 'Insights' },
  { value: 'billing', label: 'Billing' },
  { value: 'security', label: 'Security' },
  { value: 'documents', label: 'Documents' },
  { value: 'content', label: 'Content' },
];

export function NotificationCenter() {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { notifications, isLoading, markAsRead, markAllAsRead, isMarkingAllAsRead } =
    useNotifications({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      unreadOnly: showUnreadOnly,
    });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
          >
            {isMarkingAllAsRead ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                selectedCategory === category.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Unread filter */}
        <label className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-white/10">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          Unread only
        </label>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white">No notifications</h3>
            <p className="mt-2 text-gray-400">
              {showUnreadOnly
                ? "You're all caught up! No unread notifications."
                : 'Check back later for updates.'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
