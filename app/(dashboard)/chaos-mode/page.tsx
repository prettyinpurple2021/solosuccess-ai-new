'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { PreMortemForm } from '@/components/chaos-mode/PreMortemForm';
import { SimulationList } from '@/components/chaos-mode/SimulationList';
import { usePreMortemSimulations } from '@/lib/hooks/usePreMortemSimulations';

export default function ChaosModeePage() {
  const [showForm, setShowForm] = useState(false);
  const { data: simulations, isLoading } = usePreMortemSimulations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Chaos Mode
        </h1>
        <p className="text-gray-400 text-lg">
          Pre-mortem simulations to identify risks before they become reality
        </p>
      </div>

      {/* Create New Simulation */}
      {!showForm && (
        <GlassmorphicCard className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Run a Pre-Mortem Simulation
              </h2>
              <p className="text-gray-400">
                Identify potential failure scenarios and prepare mitigation strategies
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Simulation
            </Button>
          </div>
        </GlassmorphicCard>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          <PreMortemForm onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Simulations List */}
      <SimulationList simulations={simulations || []} isLoading={isLoading} />
    </div>
  );
}
