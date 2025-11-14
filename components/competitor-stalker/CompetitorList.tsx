'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompetitorCard } from './CompetitorCard';
import { CompetitorForm } from './CompetitorForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCompetitors, useDeleteCompetitor, CompetitorProfile } from '@/lib/hooks/useCompetitors';
import { useRouter } from 'next/navigation';

export const CompetitorList: React.FC = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorProfile | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: competitors, isLoading, error } = useCompetitors();
  const { mutate: deleteCompetitor } = useDeleteCompetitor();

  const handleView = (id: string) => {
    router.push(`/competitor-stalker/${id}`);
  };

  const handleEdit = (competitor: CompetitorProfile) => {
    setEditingCompetitor(competitor);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteCompetitor(id);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCompetitor(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCompetitor(undefined);
  };

  // Filter competitors
  const filteredCompetitors = competitors?.filter((competitor) => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competitor.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competitor.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterActive === 'all' ||
      (filterActive === 'active' && competitor.isActive) ||
      (filterActive === 'inactive' && !competitor.isActive);

    return matchesSearch && matchesFilter;
  });

  if (showForm) {
    return (
      <CompetitorForm
        competitor={editingCompetitor}
        onCancelAction={handleFormCancel}
        onSuccessAction={handleFormSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Competitors</h2>
          <p className="text-white/60">
            Monitor and track your competition
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => setShowForm(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Competitor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search competitors..."
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterActive === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterActive === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterActive === 'inactive'
                ? 'bg-gray-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load competitors</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCompetitors?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <svg className="w-16 h-16 mx-auto mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No competitors found' : 'No competitors yet'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Start tracking your competition by adding your first competitor'}
          </p>
          {!searchQuery && (
            <Button variant="gradient" onClick={() => setShowForm(true)}>
              Add Your First Competitor
            </Button>
          )}
        </motion.div>
      )}

      {/* Competitors Grid */}
      {!isLoading && !error && filteredCompetitors && filteredCompetitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCompetitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onViewAction={handleView}
                onEditAction={handleEdit}
                onDeleteAction={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
