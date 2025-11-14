'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { formatDistanceToNow } from 'date-fns';

interface Simulation {
  id: string;
  initiativeTitle: string;
  description: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  scenarios?: Array<{ id: string }>;
}

interface SimulationListProps {
  simulations: Simulation[];
  isLoading: boolean;
}

export function SimulationList({ simulations, isLoading }: SimulationListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  if (!simulations || simulations.length === 0) {
    return (
      <GlassmorphicCard className="p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Simulations Yet</h3>
        <p className="text-gray-400">
          Create your first pre-mortem simulation to identify potential risks
        </p>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Simulations</h2>
      {simulations.map((simulation) => (
        <GlassmorphicCard
          key={simulation.id}
          className="p-6 cursor-pointer hover:scale-[1.01] transition-transform"
          onClick={() => router.push(`/chaos-mode/${simulation.id}`)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">
                  {simulation.initiativeTitle}
                </h3>
                <StatusBadge status={simulation.status} />
              </div>
              
              {simulation.description && (
                <p className="text-gray-400 mb-3 line-clamp-2">
                  {simulation.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(simulation.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                {simulation.scenarios && simulation.scenarios.length > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {simulation.scenarios.length} scenarios identified
                  </div>
                )}
              </div>
            </div>

            <div className="ml-4">
              {simulation.status === 'completed' && (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
              {simulation.status === 'in_progress' && (
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              )}
            </div>
          </div>
        </GlassmorphicCard>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    in_progress: {
      label: 'In Progress',
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_progress;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
