'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AGENTS } from '@/lib/constants/agents';
import { useCreateMissionControlSession } from '@/lib/hooks/useMissionControlSessions';

interface MissionControlFormProps {
  onCancel: () => void;
  onSuccess: (sessionId: string) => void;
}

export const MissionControlForm: React.FC<MissionControlFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [objective, setObjective] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [context, setContext] = useState({
    businessType: '',
    timeline: '',
    constraints: '',
  });

  const { mutate: createSession, isPending } = useCreateMissionControlSession();

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objective.trim()) {
      return;
    }

    createSession(
      {
        objective: objective.trim(),
        agentsInvolved: selectedAgents.length > 0 ? selectedAgents : undefined,
        context: {
          businessType: context.businessType || undefined,
          timeline: context.timeline || undefined,
          constraints: context.constraints ? context.constraints.split(',').map(c => c.trim()) : undefined,
        },
      },
      {
        onSuccess: (data: any) => {
          onSuccess(data.id);
        },
      }
    );
  };

  return (
    <GlassmorphicPanel>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">
            New Mission
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Objective Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            What do you want to achieve? *
          </label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Describe your business objective in detail. For example: 'Launch a new SaaS product targeting small businesses' or 'Create a comprehensive marketing strategy for Q2'"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            required
          />
          <p className="text-xs text-white/50 mt-1">
            Be as specific as possible for better results
          </p>
        </div>

        {/* Context Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Business Type (Optional)
            </label>
            <Input
              value={context.businessType}
              onChange={(e) => setContext(prev => ({ ...prev, businessType: e.target.value }))}
              placeholder="e.g., SaaS, E-commerce, Consulting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Timeline (Optional)
            </label>
            <Input
              value={context.timeline}
              onChange={(e) => setContext(prev => ({ ...prev, timeline: e.target.value }))}
              placeholder="e.g., 3 months, Q2 2024"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Constraints (Optional)
          </label>
          <Input
            value={context.constraints}
            onChange={(e) => setContext(prev => ({ ...prev, constraints: e.target.value }))}
            placeholder="e.g., Limited budget, Small team, Remote-first"
          />
          <p className="text-xs text-white/50 mt-1">
            Separate multiple constraints with commas
          </p>
        </div>

        {/* Agent Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Select Specific Agents (Optional)
          </label>
          <p className="text-xs text-white/50 mb-3">
            Leave unselected to let AI automatically choose the best agents for your objective
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENTS.map((agent) => (
              <motion.button
                key={agent.id}
                type="button"
                onClick={() => handleAgentToggle(agent.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAgents.includes(agent.id)
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-1">{agent.avatar}</div>
                <div className="text-xs font-medium text-white">{agent.name}</div>
                <div className="text-xs text-white/60">{agent.role}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={!objective.trim() || isPending}
            loading={isPending}
          >
            {isPending ? 'Launching Mission...' : 'Launch Mission'}
          </Button>
        </div>
      </form>
    </GlassmorphicPanel>
  );
};
