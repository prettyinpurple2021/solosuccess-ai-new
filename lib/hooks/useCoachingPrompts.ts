import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface CoachingPrompt {
  id: string;
  assessmentId: string;
  promptType: string;
  title: string;
  content: string;
  targetBias: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  userResponse: string | null;
}

interface ProgressMetrics {
  totalPrompts: number;
  completedPrompts: number;
  completionRate: number;
  lastCompletedAt: string | null;
}

export function useCoachingPrompts() {
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['coaching-prompts'],
    queryFn: async () => {
      const response = await fetch('/api/shadow-self/coaching/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      return response.json() as Promise<CoachingPrompt[]>;
    },
  });

  const { data: progressMetrics } = useQuery({
    queryKey: ['coaching-progress'],
    queryFn: async () => {
      const response = await fetch('/api/shadow-self/coaching/progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json() as Promise<ProgressMetrics>;
    },
  });

  const completePrompt = useMutation({
    mutationFn: async ({
      promptId,
      response,
    }: {
      promptId: string;
      response: string;
    }) => {
      const res = await fetch(`/api/shadow-self/coaching/prompts/${promptId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error('Failed to complete prompt');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['coaching-progress'] });
    },
  });

  return {
    prompts,
    progressMetrics,
    isLoading,
    completePrompt,
  };
}
