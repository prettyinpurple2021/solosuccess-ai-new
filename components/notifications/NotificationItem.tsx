'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    category: string;
    title: string;
    message: string;
    read: boolean;
    actionUrl?: string;
    priority: string;
    createdAt: string;
  };
  onMarkAsRead: (id: string) => void;
}

const priorityColors = {
  low: 'from-gray-500/20 to-gray-600/20',
  medium: 'from-blue-500/20 to-purple-500/20',
  high: 'from-orange-500/20 to-red-500/20',
  critical: 'from-red-500/20 to-pink-500/20',
};

const categoryIcons: Record<string, string> = {
  ai_agents: '🤖',
  mission_control: '🎯',
  competitor_intelligence: '🕵️',
  insights: '💡',
  billing: '💳',
  security: '🔒',
  documents: '📄',
  content: '✨',
  system: '⚙️',
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
        notification.read
          ? 'border-white/10 bg-white/5'
          : `border-white/20 bg-gradient-to-br ${priorityColors[notification.priority as keyof typeof priorityColors]}`
      }`}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 text-2xl">
            {categoryIcons[notification.category] || '📬'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`text-sm font-semibold ${
                  notification.read ? 'text-gray-300' : 'text-white'
                }`}
              >
                {notification.title}
              </h4>
              <span className="flex-shrink-0 text-xs text-gray-400">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p
              className={`mt-1 text-sm ${
                notification.read ? 'text-gray-400' : 'text-gray-200'
              }`}
            >
              {notification.message}
            </p>

            {/* Priority badge */}
            {notification.priority === 'high' || notification.priority === 'critical' ? (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    notification.priority === 'critical'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-orange-500/20 text-orange-300'
                  }`}
                >
                  {notification.priority === 'critical' ? '🚨 Critical' : '⚠️ High Priority'}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
