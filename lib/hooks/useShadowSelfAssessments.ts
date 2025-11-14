import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Assessment {
  id: string;
  userId: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  responses: Record<string, string>;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentReport {
  id: string;
  assessmentId: string;
  identifiedBiases: any;
  blindSpots: any;
  decisionPatterns: any;
  impactExamples: any;
  recommendations: any;
  overallScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useShadowSelfAssessments() {
  const queryClient = useQueryClient();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['shadow-self-assessments'],
    queryFn: async () => {
      const response = await fetch('/api/shadow-self/assessments');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return response.json() as Promise<Assessment[]>;
    },
  });

  const createAssessment = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/shadow-self/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create assessment');
      return response.json() as Promise<Assessment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadow-self-assessments'] });
    },
  });

  const updateAssessment = useMutation({
    mutationFn: async ({
      assessmentId,
      responses,
      currentStep,
    }: {
      assessmentId: string;
      responses: Record<string, string>;
      currentStep: number;
    }) => {
      const response = await fetch(`/api/shadow-self/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, currentStep }),
      });
      if (!response.ok) throw new Error('Failed to update assessment');
      return response.json() as Promise<Assessment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadow-self-assessments'] });
    },
  });

  const completeAssessment = useMutation({
    mutationFn: async ({
      assessmentId,
      responses,
    }: {
      assessmentId: string;
      responses: Record<string, string>;
    }) => {
      const response = await fetch(`/api/shadow-self/assessments/${assessmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      if (!response.ok) throw new Error('Failed to complete assessment');
      return response.json() as Promise<Assessment>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shadow-self-assessments'] });
    },
  });

  return {
    assessments,
    isLoading,
    createAssessment,
    updateAssessment,
    completeAssessment,
    isCreating: createAssessment.isPending,
    isUpdating: updateAssessment.isPending,
    isCompleting: completeAssessment.isPending,
  };
}

export function useShadowSelfReport(assessmentId: string) {
  const { data: report, isLoading } = useQuery({
    queryKey: ['shadow-self-report', assessmentId],
    queryFn: async () => {
      const response = await fetch(`/api/shadow-self/assessments/${assessmentId}/report`);
      if (!response.ok) throw new Error('Failed to fetch report');
      return response.json() as Promise<AssessmentReport>;
    },
    enabled: !!assessmentId,
  });

  return {
    report,
    isLoading,
  };
}
