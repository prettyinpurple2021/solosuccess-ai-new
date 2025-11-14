import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MissionControlSession {
  id: string;
  objective: string;
  status: string;
  agentsInvolved: string[];
  context: any;
  results?: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface CreateSessionRequest {
  objective: string;
  agentsInvolved?: string[];
  context?: {
    businessType?: string;
    timeline?: string;
    constraints?: string[];
  };
}

// Fetch all sessions for the current user
export const useMissionControlSessions = () => {
  return useQuery<MissionControlSession[]>({
    queryKey: ['mission-control-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/mission-control/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json();
    },
  });
};

// Fetch a single session by ID
export const useMissionControlSession = (sessionId: string) => {
  return useQuery<MissionControlSession>({
    queryKey: ['mission-control-session', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/mission-control/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
};

// Create a new Mission Control session
export const useCreateMissionControlSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionRequest) => {
      const response = await fetch('/api/mission-control/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create session');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate sessions list to refetch
      queryClient.invalidateQueries({ queryKey: ['mission-control-sessions'] });
    },
  });
};

// Delete a Mission Control session
export const useDeleteMissionControlSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/mission-control/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-control-sessions'] });
    },
  });
};

// Export session data
export const useExportSession = () => {
  return useMutation({
    mutationFn: async ({ sessionId, format = 'markdown' }: { sessionId: string; format?: 'json' | 'markdown' }) => {
      const response = await fetch(`/api/mission-control/sessions/${sessionId}/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to export session');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'json' ? 'json' : 'md';
      a.download = `mission-control-${sessionId}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};
