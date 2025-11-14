import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GeneratedContent {
  id: string;
  userId: string;
  contentType: string;
  title?: string;
  content: string;
  metadata?: {
    platform?: string;
    tone?: string;
    length?: string;
    targetAudience?: string;
    keywords?: string;
    brief?: string;
    variations?: ContentVariation[];
    qualityScore?: number;
    viralHooks?: string[];
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVariation {
  id: string;
  content: string;
  qualityScore: number;
}

export interface GenerateContentRequest {
  contentType: string;
  platform?: string;
  tone?: string;
  length?: string;
  targetAudience?: string;
  keywords?: string;
  brief: string;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  status?: string;
}

// Fetch all generated content for the current user
export const useGeneratedContent = (filters?: {
  contentType?: string;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (filters?.contentType) queryParams.append('contentType', filters.contentType);
  if (filters?.status) queryParams.append('status', filters.status);

  return useQuery<GeneratedContent[]>({
    queryKey: ['generated-content', filters],
    queryFn: async () => {
      const response = await fetch(`/api/content-generation/content?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch generated content');
      }
      return response.json();
    },
  });
};

// Fetch a single content item by ID
export const useGeneratedContentItem = (contentId: string) => {
  return useQuery<GeneratedContent>({
    queryKey: ['generated-content', contentId],
    queryFn: async () => {
      const response = await fetch(`/api/content-generation/content/${contentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      return response.json();
    },
    enabled: !!contentId,
  });
};

// Generate new content
export const useGenerateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateContentRequest) => {
      const response = await fetch('/api/content-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate content');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] });
    },
  });
};

// Update content
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, data }: { contentId: string; data: UpdateContentRequest }) => {
      const response = await fetch(`/api/content-generation/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update content');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] });
      queryClient.invalidateQueries({ queryKey: ['generated-content', variables.contentId] });
    },
  });
};

// Delete content
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/content-generation/content/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-content'] });
    },
  });
};

// Generate viral hooks
export const useGenerateViralHooks = () => {
  return useMutation({
    mutationFn: async (data: { topic: string; platform: string; count?: number }) => {
      const response = await fetch('/api/content-generation/viral-hooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate viral hooks');
      }

      return response.json();
    },
  });
};
