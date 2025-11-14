'use client';

import { useMemo } from 'react';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
}

interface RiskVisualizationProps {
  scenarios: Scenario[];
}

export function RiskVisualization({ scenarios }: RiskVisualizationProps) {
  const stats = useMemo(() => {
    const totalScenarios = scenarios.length;
    const criticalRisks = scenarios.filter((s) => s.riskScore >= 75).length;
    const highRisks = scenarios.filter(
      (s) => s.riskScore >= 50 && s.riskScore < 75
    ).length;
    const avgRiskScore =
      scenarios.reduce((sum, s) => sum + s.riskScore, 0) / totalScenarios || 0;

    return {
      totalScenarios,
      criticalRisks,
      highRisks,
      avgRiskScore: Math.round(avgRiskScore),
    };
  }, [scenarios]);

  const riskMatrix = useMemo(() => {
    const matrix: { [key: string]: Scenario[] } = {};
    
    scenarios.forEach((scenario) => {
      const key = `${scenario.likelihood}-${scenario.impact}`;
      if (!matrix[key]) {
        matrix[key] = [];
      }
      matrix[key].push(scenario);
    });

    return matrix;
  }, [scenarios]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Risk Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Scenarios</span>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold">{stats.totalScenarios}</p>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 bg-red-500/10 border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400">Critical Risks</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.criticalRisks}</p>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 bg-orange-500/10 border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-400">High Risks</span>
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-400">{stats.highRisks}</p>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Risk Score</span>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold">{stats.avgRiskScore}</p>
        </GlassmorphicCard>
      </div>

      {/* Risk Matrix */}
      <GlassmorphicCard className="p-6">
        <h3 className="text-xl font-bold mb-4">Risk Matrix</h3>
        <p className="text-gray-400 mb-6">
          Scenarios plotted by likelihood and impact
        </p>

        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-400 font-medium">
            Impact
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {[5, 4, 3, 2, 1].map((impact) => (
              <div key={impact} className="contents">
                {[1, 2, 3, 4, 5].map((likelihood) => {
                  const key = `${likelihood}-${impact}`;
                  const scenariosInCell = riskMatrix[key] || [];
                  const riskLevel = getRiskLevel(likelihood, impact);

                  return (
                    <div
                      key={key}
                      className={`aspect-square rounded-lg border-2 p-2 flex items-center justify-center text-center transition-all hover:scale-105 ${getRiskColor(
                        riskLevel
                      )}`}
                      title={`Likelihood: ${likelihood}, Impact: ${impact}`}
                    >
                      {scenariosInCell.length > 0 && (
                        <div className="text-sm font-bold">
                          {scenariosInCell.length}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center text-sm text-gray-400 font-medium mt-2">
            Likelihood
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500/50" />
              <span className="text-gray-400">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border-2 border-yellow-500/50" />
              <span className="text-gray-400">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20 border-2 border-orange-500/50" />
              <span className="text-gray-400">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border-2 border-red-500/50" />
              <span className="text-gray-400">Critical</span>
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

function getRiskLevel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

function getRiskColor(level: string): string {
  const colors = {
    critical: 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30',
    high: 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30',
    medium: 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30',
    low: 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30',
  };
  return colors[level as keyof typeof colors] || colors.low;
}
