import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreatePreMortemInput {
  initiativeTitle: string;
  description: string;
  context: {
    businessType?: string;
    timeline?: string;
    budget?: string;
    teamSize?: string;
  };
  parameters: {
    riskTolerance: string;
    focusAreas: string[];
  };
}

interface PreMortemSimulation {
  id: string;
  initiativeTitle: string;
  description: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  scenarios?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    likelihood: number;
    impact: number;
    riskScore: number;
    detailedAnalysis: string | null;
    mitigationStrategies?: Array<{
      id: string;
      title: string;
      description: string;
      priority: string;
      estimatedCost: string | null;
      estimatedTime: string | null;
      effectiveness: number | null;
    }>;
  }>;
  report?: {
    id: string;
    executiveSummary: string;
    riskMatrix: any;
    topRisks: any[];
    mitigationPlan: any;
    contingencyPlans: any[];
    recommendations: any;
  };
}

export function usePreMortemSimulations() {
  return useQuery<PreMortemSimulation[]>({
    queryKey: ['pre-mortem-simulations'],
    queryFn: async () => {
      const response = await fetch('/api/chaos-mode/simulations');
      if (!response.ok) {
        throw new Error('Failed to fetch simulations');
      }
      return response.json();
    },
  });
}

export function usePreMortemSimulation(simulationId: string) {
  return useQuery<PreMortemSimulation>({
    queryKey: ['pre-mortem-simulation', simulationId],
    queryFn: async () => {
      const response = await fetch(`/api/chaos-mode/simulations/${simulationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch simulation');
      }
      return response.json();
    },
    enabled: !!simulationId,
  });
}

export function useCreatePreMortem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePreMortemInput) => {
      const response = await fetch('/api/chaos-mode/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create simulation');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-mortem-simulations'] });
    },
  });
}
