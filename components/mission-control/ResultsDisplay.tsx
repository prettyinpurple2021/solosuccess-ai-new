'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { AGENTS } from '@/lib/constants/agents';
import { useExportSession } from '@/lib/hooks/useMissionControlSessions';

interface MissionControlSession {
  id: string;
  objective: string;
  status: string;
  agentsInvolved: string[];
  context: any;
  results: {
    executiveSummary: string;
    detailedPlan: {
      overview: string;
      phases: Array<{
        name: string;
        description: string;
        duration: string;
        tasks: string[];
      }>;
    };
    actionItems: Array<{
      id: string;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      assignedTo?: string;
      estimatedTime?: string;
    }>;
    resources: Array<{
      type: string;
      title: string;
      description: string;
      url?: string;
    }>;
    agentContributions: Array<{
      agentId: string;
      agentName: string;
      analysis: string;
      recommendations: string[];
      resources?: string[];
    }>;
    risks: Array<{
      risk: string;
      impact: string;
      mitigation: string;
    }>;
    successMetrics: string[];
  };
  createdAt: string;
  completedAt?: string;
}

interface ResultsDisplayProps {
  session: MissionControlSession;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'actions' | 'agents'>('overview');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { mutate: exportSession, isPending: isExporting } = useExportSession();

  const results = session.results;

  const handleCheckItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleExport = (format: 'json' | 'markdown' = 'markdown') => {
    exportSession({ sessionId: session.id, format });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'plan', label: 'Detailed Plan', icon: '📋' },
    { id: 'actions', label: 'Action Items', icon: '✅' },
    { id: 'agents', label: 'Agent Insights', icon: '🤖' },
  ];

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          loading={isExporting}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Plan
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Executive Summary */}
          <GlassmorphicPanel>
            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>📝</span>
              Executive Summary
            </h3>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {results.executiveSummary}
            </p>
          </GlassmorphicPanel>

          {/* Success Metrics */}
          <GlassmorphicPanel>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              Success Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.successMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-white/80">{metric}</p>
                </div>
              ))}
            </div>
          </GlassmorphicPanel>

          {/* Risks */}
          <GlassmorphicPanel>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>⚠️</span>
              Potential Risks & Mitigations
            </h3>
            <div className="space-y-4">
              {results.risks.map((risk, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{risk.risk}</h4>
                      <p className="text-sm text-white/60 mb-2">
                        <span className="font-medium">Impact:</span> {risk.impact}
                      </p>
                      <p className="text-sm text-green-400">
                        <span className="font-medium">Mitigation:</span> {risk.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicPanel>

          {/* Resources */}
          <GlassmorphicPanel>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔧</span>
              Recommended Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.resources.map((resource, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {resource.type === 'tool' ? '🛠️' : '📄'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{resource.title}</h4>
                      <p className="text-sm text-white/60">{resource.description}</p>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1"
                        >
                          Learn more
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicPanel>
        </motion.div>
      )}

      {/* Detailed Plan Tab */}
      {activeTab === 'plan' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GlassmorphicPanel>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Plan Overview
            </h3>
            <p className="text-white/80 leading-relaxed">
              {results.detailedPlan.overview}
            </p>
          </GlassmorphicPanel>

          {results.detailedPlan.phases.map((phase, index) => (
            <GlassmorphicPanel key={index}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {phase.name}
                  </h3>
                  <p className="text-sm text-white/60 mb-2">{phase.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-sm text-blue-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {phase.duration}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-white/70 mb-2">Key Tasks:</h4>
                {phase.tasks.map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="w-5 h-5 rounded border-2 border-white/30 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{task}</span>
                  </div>
                ))}
              </div>
            </GlassmorphicPanel>
          ))}
        </motion.div>
      )}

      {/* Action Items Tab */}
      {activeTab === 'actions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <GlassmorphicPanel>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">
                Action Items Checklist
              </h3>
              <div className="text-sm text-white/60">
                {checkedItems.size} of {results.actionItems.length} completed
              </div>
            </div>

            <div className="space-y-3">
              {results.actionItems.map((item) => (
                <motion.div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    checkedItems.has(item.id)
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => handleCheckItem(item.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      checkedItems.has(item.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-white/30'
                    }`}>
                      {checkedItems.has(item.id) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className={`font-semibold ${
                          checkedItems.has(item.id) ? 'text-white/60 line-through' : 'text-white'
                        }`}>
                          {item.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          priorityColors[item.priority]
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${
                        checkedItems.has(item.id) ? 'text-white/40' : 'text-white/70'
                      }`}>
                        {item.description}
                      </p>
                      {item.estimatedTime && (
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.estimatedTime}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassmorphicPanel>
        </motion.div>
      )}

      {/* Agent Insights Tab */}
      {activeTab === 'agents' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {results.agentContributions.map((contribution) => {
            const agent = AGENTS.find(a => a.id === contribution.agentId);
            
            return (
              <GlassmorphicPanel key={contribution.agentId}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${agent?.gradient || 'from-blue-500 to-purple-500'} flex items-center justify-center text-3xl flex-shrink-0`}>
                    {agent?.avatar || '🤖'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {contribution.agentName}
                    </h3>
                    <p className="text-sm text-white/60">{agent?.role || 'AI Agent'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">Analysis:</h4>
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                      {contribution.analysis}
                    </p>
                  </div>

                  {contribution.recommendations && contribution.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-2">Recommendations:</h4>
                      <ul className="space-y-2">
                        {contribution.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-white/80">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {contribution.resources && contribution.resources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-2">Resources:</h4>
                      <ul className="space-y-2">
                        {contribution.resources.map((resource, index) => (
                          <li key={index} className="flex items-start gap-2 text-white/70 text-sm">
                            <span className="text-purple-400 mt-1">→</span>
                            <span>{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </GlassmorphicPanel>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
