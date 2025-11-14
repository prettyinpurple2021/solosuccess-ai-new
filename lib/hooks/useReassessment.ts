import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ReassessmentComparison {
  previousScore: number;
  currentScore: number;
  improvement: number;
  biasChanges: any[];
  newBiases: string[];
  resolvedBiases: string[];
  overallTrend: 'improving' | 'declining' | 'stable';
}

export function useReassessmentComparison(reassessmentId: string) {
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['reassessment-comparison', reassessmentId],
    queryFn: async () => {
      const response = await fetch(`/api/shadow-self/reassessment/${reassessmentId}`);
      if (!response.ok) throw new Error('Failed to fetch comparison');
      return response.json() as Promise<ReassessmentComparison>;
    },
    enabled: !!reassessmentId,
  });

  return {
    comparison,
    isLoading,
  };
}

export function useReassessments() {
  const queryClient = useQueryClient();

  const { data: upcoming, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['reassessments-upcoming'],
    queryFn: async () => {
      const response = await fetch('/api/shadow-self/reassessment/upcoming');
      if (!response.ok) throw new Error('Failed to fetch upcoming reassessments');
      return response.json();
    },
  });

  const { data: completed, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['reassessments-completed'],
    queryFn: async () => {
      const response = await fetch('/api/shadow-self/reassessment/completed');
      if (!response.ok) throw new Error('Failed to fetch completed reassessments');
      return response.json();
    },
  });

  const scheduleReassessment = useMutation({
    mutationFn: async ({
      previousAssessmentId,
      scheduledDate,
    }: {
      previousAssessmentId: string;
      scheduledDate: Date;
    }) => {
      const response = await fetch('/api/shadow-self/reassessment/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousAssessmentId, scheduledDate }),
      });
      if (!response.ok) throw new Error('Failed to schedule reassessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reassessments-upcoming'] });
    },
  });

  return {
    upcoming,
    completed,
    isLoading: isLoadingUpcoming || isLoadingCompleted,
    scheduleReassessment,
  };
}
