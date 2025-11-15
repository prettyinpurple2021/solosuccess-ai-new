import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationCategory } from '@/lib/services/notification-service';

interface Notification {
  id: string;
  userId: string;
  type: string;
  category: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  category?: NotificationCategory;
  limit?: number;
  offset?: number;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.unreadOnly) params.append('unreadOnly', 'true');
      if (options?.category) params.append('category', options.category);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const result = await response.json();
      return result.data as Notification[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

export function useUnreadCount() {
  const query = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const result = await response.json();
      return result.data.count as number;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    count: query.data || 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
