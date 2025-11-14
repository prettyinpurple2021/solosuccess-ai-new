'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { useCreatePreMortem } from '@/lib/hooks/usePreMortemSimulations';

interface PreMortemFormProps {
  onCancel: () => void;
}

export function PreMortemForm({ onCancel }: PreMortemFormProps) {
  const router = useRouter();
  const { mutate: createSimulation, isPending } = useCreatePreMortem();
  
  const [formData, setFormData] = useState({
    initiativeTitle: '',
    description: '',
    businessType: '',
    timeline: '',
    budget: '',
    teamSize: '',
    riskTolerance: 'medium',
    focusAreas: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createSimulation(
      {
        initiativeTitle: formData.initiativeTitle,
        description: formData.description,
        context: {
          businessType: formData.businessType,
          timeline: formData.timeline,
          budget: formData.budget,
          teamSize: formData.teamSize,
        },
        parameters: {
          riskTolerance: formData.riskTolerance,
          focusAreas: formData.focusAreas,
        },
      },
      {
        onSuccess: (data) => {
          router.push(`/chaos-mode/${data.id}`);
        },
      }
    );
  };

  const toggleFocusArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const focusAreaOptions = [
    'Market Risk',
    'Financial Risk',
    'Operational Risk',
    'Technical Risk',
    'Legal/Compliance Risk',
    'Team/HR Risk',
    'Competition Risk',
    'Customer Risk',
  ];

  return (
    <GlassmorphicCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">New Pre-Mortem Simulation</h2>
          <p className="text-gray-400">
            Describe your initiative and we'll identify potential failure scenarios
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Initiative Title */}
        <div>
          <Label htmlFor="initiativeTitle">Initiative Title *</Label>
          <Input
            id="initiativeTitle"
            value={formData.initiativeTitle}
            onChange={(e) =>
              setFormData({ ...formData, initiativeTitle: e.target.value })
            }
            placeholder="e.g., Launch new SaaS product"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your initiative, goals, and key details..."
            rows={4}
            required
          />
        </div>

        {/* Context Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={formData.businessType}
              onChange={(e) =>
                setFormData({ ...formData, businessType: e.target.value })
              }
              placeholder="e.g., B2B SaaS"
            />
          </div>

          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              value={formData.timeline}
              onChange={(e) =>
                setFormData({ ...formData, timeline: e.target.value })
              }
              placeholder="e.g., 6 months"
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="e.g., $50,000"
            />
          </div>

          <div>
            <Label htmlFor="teamSize">Team Size</Label>
            <Input
              id="teamSize"
              value={formData.teamSize}
              onChange={(e) =>
                setFormData({ ...formData, teamSize: e.target.value })
              }
              placeholder="e.g., 3 people"
            />
          </div>
        </div>

        {/* Risk Tolerance */}
        <div>
          <Label>Risk Tolerance</Label>
          <div className="flex gap-3 mt-2">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, riskTolerance: level })}
                className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                  formData.riskTolerance === level
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <Label>Focus Areas (Optional)</Label>
          <p className="text-sm text-gray-400 mb-3">
            Select specific risk categories to analyze
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {focusAreaOptions.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocusArea(area)}
                className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                  formData.focusAreas.includes(area)
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Simulation...
              </>
            ) : (
              'Run Pre-Mortem'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </GlassmorphicCard>
  );
}
