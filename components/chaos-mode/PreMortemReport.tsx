'use client';

import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import {
  FileText,
  AlertTriangle,
  Shield,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface ReportProps {
  report: {
    id: string;
    executiveSummary: string;
    riskMatrix: any;
    topRisks: any[];
    mitigationPlan: any;
    contingencyPlans: any[];
    recommendations: any;
  };
}

export function PreMortemReport({ report }: ReportProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <FileText className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Pre-Mortem Report</h2>
          <p className="text-gray-400">
            Comprehensive risk analysis and mitigation plan
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <GlassmorphicCard className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Executive Summary
        </h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>
      </GlassmorphicCard>

      {/* Top Risks */}
      <GlassmorphicCard className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Top Risks
        </h3>
        <div className="space-y-4">
          {report.topRisks.map((risk, index) => (
            <div
              key={risk.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-lg">{risk.title}</h4>
                    <span className="text-sm text-gray-400">
                      {risk.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">
                    {risk.riskScore}
                  </div>
                  <div className="text-xs text-gray-400">Risk Score</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">{risk.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <div>Likelihood: {risk.likelihood}/5</div>
                <div>Impact: {risk.impact}/5</div>
                <div>{risk.mitigationCount} mitigation strategies</div>
              </div>
            </div>
          ))}
        </div>
      </GlassmorphicCard>

      {/* Mitigation Plan */}
      <GlassmorphicCard className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Mitigation Plan
        </h3>
        <p className="text-gray-400 mb-4">
          {report.mitigationPlan.totalStrategies} strategies identified across
          all risk scenarios
        </p>

        {/* Critical Mitigations */}
        {report.mitigationPlan.critical.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-red-400">
              Critical Priority ({report.mitigationPlan.critical.length})
            </h4>
            <div className="space-y-2">
              {report.mitigationPlan.critical.map((mitigation: any) => (
                <div
                  key={mitigation.id}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="font-medium">{mitigation.title}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    For: {mitigation.scenarioTitle}
                  </div>
                  {mitigation.estimatedTime && (
                    <div className="text-xs text-gray-400 mt-1">
                      Time: {mitigation.estimatedTime}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High Priority Mitigations */}
        {report.mitigationPlan.high.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-orange-400">
              High Priority ({report.mitigationPlan.high.length})
            </h4>
            <div className="space-y-2">
              {report.mitigationPlan.high.slice(0, 5).map((mitigation: any) => (
                <div
                  key={mitigation.id}
                  className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30"
                >
                  <div className="font-medium">{mitigation.title}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    For: {mitigation.scenarioTitle}
                  </div>
                </div>
              ))}
              {report.mitigationPlan.high.length > 5 && (
                <div className="text-sm text-gray-400 text-center py-2">
                  +{report.mitigationPlan.high.length - 5} more high priority
                  strategies
                </div>
              )}
            </div>
          </div>
        )}
      </GlassmorphicCard>

      {/* Contingency Plans */}
      {report.contingencyPlans.length > 0 && (
        <GlassmorphicCard className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Contingency Plans
          </h3>
          <div className="space-y-4">
            {report.contingencyPlans.map((plan: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <h4 className="font-semibold mb-2">{plan.riskTitle}</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Trigger Conditions:</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {plan.triggerConditions.map(
                        (condition: string, i: number) => (
                          <li key={i}>{condition}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Response Actions:</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {plan.responseActions.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Escalation Path:</div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300">
                      {plan.escalationPath.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassmorphicCard>
      )}

      {/* Recommendations */}
      <GlassmorphicCard className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Key Recommendations
        </h3>
        <ul className="space-y-3">
          {report.recommendations.map((recommendation: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{recommendation}</span>
            </li>
          ))}
        </ul>
      </GlassmorphicCard>
    </div>
  );
}
