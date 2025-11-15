import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function useAnalyticsMetrics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'metrics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const response = await fetch(`/api/analytics/metrics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      return response.json();
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
}

export function useAnalyticsTrends(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'trends', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const response = await fetch(`/api/analytics/trends?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }
      return response.json();
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
}

export function useAnalyticsData(
  dateRange: DateRange,
  period: 'day' | 'week' | 'month' = 'day'
) {
  return useQuery({
    queryKey: ['analytics', 'data', dateRange, period],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period,
      });
      const response = await fetch(`/api/analytics/data?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await fetch('/api/integrations');
      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }
      return response.json();
    },
  });
}

export function useConnectIntegration() {
  return useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(`/api/integrations/${provider}/connect`);
      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }
      const data = await response.json();
      window.location.href = data.authUrl;
    },
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(
        `/api/integrations/${provider}/disconnect`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to disconnect integration');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useSyncIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      provider,
      startDate,
      endDate,
      propertyId,
    }: {
      provider: string;
      startDate?: string;
      endDate?: string;
      propertyId?: string;
    }) => {
      const response = await fetch(`/api/integrations/${provider}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate, propertyId }),
      });
      if (!response.ok) {
        throw new Error('Failed to sync data');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
