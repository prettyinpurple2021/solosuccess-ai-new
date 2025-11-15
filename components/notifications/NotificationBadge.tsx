'use client';

import { useUnreadCount } from '@/lib/hooks/useNotifications';

export function NotificationBadge() {
  const { count } = useUnreadCount();

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg">
      {count > 99 ? '99+' : count}
    </span>
  );
}
