import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CompetitorProfile {
  id: string;
  userId: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  trackingSources: {
    website?: boolean;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    blog?: string;
  };
  metadata?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorActivity {
  id: string;
  competitorId: string;
  activityType: string;
  title: string;
  description?: string;
  sourceUrl?: string;
  detectedAt: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
  createdAt: string;
}

interface CreateCompetitorRequest {
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  trackingSources: {
    website?: boolean;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    blog?: string;
  };
}

interface UpdateCompetitorRequest extends Partial<CreateCompetitorRequest> {
  isActive?: boolean;
}

// Fetch all competitors for the current user
export const useCompetitors = () => {
  return useQuery<CompetitorProfile[]>({
    queryKey: ['competitors'],
    queryFn: async () => {
      const response = await fetch('/api/competitor-stalker/competitors');
      if (!response.ok) {
        throw new Error('Failed to fetch competitors');
      }
      return response.json();
    },
  });
};

// Fetch a single competitor by ID
export const useCompetitor = (competitorId: string) => {
  return useQuery<CompetitorProfile>({
    queryKey: ['competitor', competitorId],
    queryFn: async () => {
      const response = await fetch(`/api/competitor-stalker/competitors/${competitorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch competitor');
      }
      return response.json();
    },
    enabled: !!competitorId,
  });
};

// Fetch activities for a competitor
export const useCompetitorActivities = (competitorId: string) => {
  return useQuery<CompetitorActivity[]>({
    queryKey: ['competitor-activities', competitorId],
    queryFn: async () => {
      const response = await fetch(`/api/competitor-stalker/competitors/${competitorId}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
    enabled: !!competitorId,
  });
};

// Fetch all recent activities
export const useRecentActivities = (limit = 20) => {
  return useQuery<CompetitorActivity[]>({
    queryKey: ['recent-activities', limit],
    queryFn: async () => {
      const response = await fetch(`/api/competitor-stalker/activities?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
  });
};

// Create a new competitor
export const useCreateCompetitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompetitorRequest) => {
      const response = await fetch('/api/competitor-stalker/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create competitor');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
  });
};

// Update a competitor
export const useUpdateCompetitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCompetitorRequest }) => {
      const response = await fetch(`/api/competitor-stalker/competitors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update competitor');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      queryClient.invalidateQueries({ queryKey: ['competitor', variables.id] });
    },
  });
};

// Delete a competitor
export const useDeleteCompetitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      const response = await fetch(`/api/competitor-stalker/competitors/${competitorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete competitor');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
  });
};
