import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useInsights(limit: number = 10) {
  return useQuery({
    queryKey: ['insights', limit],
    queryFn: async () => {
      const response = await fetch(`/api/insights?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      return response.json();
    },
  });
}

export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/insights', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useMarkInsightAsActioned() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      insightId,
      action,
    }: {
      insightId: string;
      action: string;
    }) => {
      const response = await fetch(`/api/insights/${insightId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark insight as actioned');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      const response = await fetch(`/api/insights/${insightId}/dismiss`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to dismiss insight');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}
