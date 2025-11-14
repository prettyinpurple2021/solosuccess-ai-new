'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Shield } from 'lucide-react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';

interface MitigationStrategy {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedCost?: string | null;
  estimatedTime?: string | null;
  effectiveness?: number | null;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  detailedAnalysis?: string | null;
  mitigationStrategies?: MitigationStrategy[];
}

interface ScenarioExplorerProps {
  simulationId: string;
  scenarios: Scenario[];
}

export function ScenarioExplorer({
  simulationId,
  scenarios,
}: ScenarioExplorerProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...new Set(scenarios.map((s) => s.category))];

  const filteredScenarios =
    filterCategory === 'all'
      ? scenarios
      : scenarios.filter((s) => s.category === filterCategory);

  const sortedScenarios = [...filteredScenarios].sort(
    (a, b) => b.riskScore - a.riskScore
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Failure Scenarios</h2>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filterCategory === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(category)}
              className={
                filterCategory === category
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : ''
              }
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>
      </div>

      {sortedScenarios.length === 0 ? (
        <GlassmorphicCard className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Scenarios Found</h3>
          <p className="text-gray-400">
            {filterCategory === 'all'
              ? 'Scenarios are being generated...'
              : `No scenarios in the ${filterCategory} category`}
          </p>
        </GlassmorphicCard>
      ) : (
        <div className="space-y-4">
          {sortedScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isExpanded={expandedScenario === scenario.id}
              onToggle={() =>
                setExpandedScenario(
                  expandedScenario === scenario.id ? null : scenario.id
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ScenarioCardProps {
  scenario: Scenario;
  isExpanded: boolean;
  onToggle: () => void;
}

function ScenarioCard({ scenario, isExpanded, onToggle }: ScenarioCardProps) {
  const riskLevel = getRiskLevel(scenario.riskScore);

  return (
    <GlassmorphicCard className="overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle
                className={`w-5 h-5 ${getRiskColor(riskLevel)}`}
              />
              <h3 className="text-xl font-semibold">{scenario.title}</h3>
              <span className="px-2 py-1 rounded text-xs font-medium bg-white/10">
                {scenario.category}
              </span>
            </div>

            <p className="text-gray-400 mb-4">{scenario.description}</p>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Likelihood: </span>
                <span className="font-semibold">{scenario.likelihood}/5</span>
              </div>
              <div>
                <span className="text-gray-400">Impact: </span>
                <span className="font-semibold">{scenario.impact}/5</span>
              </div>
              <div>
                <span className="text-gray-400">Risk Score: </span>
                <span className={`font-bold ${getRiskColor(riskLevel)}`}>
                  {scenario.riskScore}
                </span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-6 space-y-6">
          {/* Detailed Analysis */}
          {scenario.detailedAnalysis && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Detailed Analysis
              </h4>
              <p className="text-gray-400">{scenario.detailedAnalysis}</p>
            </div>
          )}

          {/* Mitigation Strategies */}
          {scenario.mitigationStrategies &&
            scenario.mitigationStrategies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Mitigation Strategies
                </h4>
                <div className="space-y-3">
                  {scenario.mitigationStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold">{strategy.title}</h5>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                            strategy.priority
                          )}`}
                        >
                          {strategy.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        {strategy.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {strategy.estimatedCost && (
                          <div>
                            <span className="font-medium">Cost: </span>
                            {strategy.estimatedCost}
                          </div>
                        )}
                        {strategy.estimatedTime && (
                          <div>
                            <span className="font-medium">Time: </span>
                            {strategy.estimatedTime}
                          </div>
                        )}
                        {strategy.effectiveness && (
                          <div>
                            <span className="font-medium">Effectiveness: </span>
                            {strategy.effectiveness}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </GlassmorphicCard>
  );
}

function getRiskLevel(score: number): string {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function getRiskColor(level: string): string {
  const colors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  };
  return colors[level as keyof typeof colors] || colors.low;
}

function getPriorityColor(priority: string): string {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border border-green-500/30',
  };
  return colors[priority as keyof typeof colors] || colors.medium;
}
