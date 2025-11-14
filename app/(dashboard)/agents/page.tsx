'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AgentCard } from '@/components/agents/AgentCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { AGENTS } from '@/lib/constants/agents';

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);

  // Get all unique expertise areas
  const allExpertise = useMemo(() => {
    const expertiseSet = new Set<string>();
    AGENTS.forEach(agent => {
      agent.expertise.forEach(exp => expertiseSet.add(exp));
    });
    return Array.from(expertiseSet).sort();
  }, []);

  // Filter agents based on search and expertise
  const filteredAgents = useMemo(() => {
    return AGENTS.filter(agent => {
      const matchesSearch = searchQuery === '' || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesExpertise = !selectedExpertise || 
        agent.expertise.includes(selectedExpertise);

      return matchesSearch && matchesExpertise;
    });
  }, [searchQuery, selectedExpertise]);

  const handleAgentClick = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Your AI Agent Team
          </h1>
          <p className="text-white/70 text-lg">
            Select an agent to start a conversation and get expert guidance
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <GlassmorphicPanel className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <Input
                placeholder="Search agents by name, role, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Expertise Filter */}
            <div>
              <div className="text-sm text-white/70 mb-2">Filter by Expertise</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedExpertise === null ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedExpertise(null)}
                >
                  All
                </Button>
                {allExpertise.map((expertise) => (
                  <Button
                    key={expertise}
                    variant={selectedExpertise === expertise ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedExpertise(expertise)}
                  >
                    {expertise}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-white/60">
              Showing {filteredAgents.length} of {AGENTS.length} agents
            </div>
          </div>
        </GlassmorphicPanel>

        {/* Agent Grid */}
        {filteredAgents.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredAgents.map((agent) => (
              <motion.div
                key={agent.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <AgentCard
                  agent={agent}
                  onClick={() => handleAgentClick(agent.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassmorphicPanel className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No agents found
            </h3>
            <p className="text-white/70 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedExpertise(null);
              }}
            >
              Clear Filters
            </Button>
          </GlassmorphicPanel>
        )}
      </div>
    </div>
  );
}
