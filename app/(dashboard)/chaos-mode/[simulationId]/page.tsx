'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { RiskVisualization } from '@/components/chaos-mode/RiskVisualization';
import { ScenarioExplorer } from '@/components/chaos-mode/ScenarioExplorer';
import { PreMortemReport } from '@/components/chaos-mode/PreMortemReport';
import { usePreMortemSimulation } from '@/lib/hooks/usePreMortemSimulations';

interface PageProps {
  params: Promise<{ simulationId: string }>;
}

export default function SimulationDetailPage({ params }: PageProps) {
  const { simulationId } = use(params);
  const router = useRouter();
  const { data: simulation, isLoading } = usePreMortemSimulation(simulationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GlassmorphicCard className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Simulation Not Found</h2>
          <p className="text-gray-400 mb-6">
            The simulation you're looking for doesn't exist
          </p>
          <Button onClick={() => router.push('/chaos-mode')}>
            Back to Chaos Mode
          </Button>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/chaos-mode')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Simulations
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {simulation.initiativeTitle}
            </h1>
            {simulation.description && (
              <p className="text-gray-400 text-lg">{simulation.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10"
              onClick={() => {
                window.open(`/api/chaos-mode/simulations/${simulationId}/export`, '_blank');
              }}
              disabled={simulation.status !== 'completed'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {simulation.status === 'in_progress' && (
        <GlassmorphicCard className="p-4 mb-6 bg-orange-500/10 border-orange-500/30">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
            <div>
              <p className="font-semibold text-orange-400">
                Simulation in Progress
              </p>
              <p className="text-sm text-gray-400">
                AI agents are analyzing potential failure scenarios...
              </p>
            </div>
          </div>
        </GlassmorphicCard>
      )}

      {/* Risk Visualization Dashboard */}
      {simulation.scenarios && simulation.scenarios.length > 0 && (
        <div className="mb-8">
          <RiskVisualization scenarios={simulation.scenarios} />
        </div>
      )}

      {/* Pre-Mortem Report */}
      {simulation.report && simulation.status === 'completed' && (
        <div className="mb-8">
          <PreMortemReport report={simulation.report} />
        </div>
      )}

      {/* Scenario Explorer */}
      <ScenarioExplorer
        simulationId={simulationId}
        scenarios={simulation.scenarios || []}
      />
    </div>
  );
}
