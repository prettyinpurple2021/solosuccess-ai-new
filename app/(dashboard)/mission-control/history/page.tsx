'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SessionHistoryCard } from '@/components/mission-control/SessionHistoryCard';
import { useMissionControlSessions, useDeleteMissionControlSession } from '@/lib/hooks/useMissionControlSessions';
import { formatDistanceToNow } from 'date-fns';

export default function MissionControlHistoryPage() {
  const router = useRouter();
  const { sessions, isLoading } = useMissionControlSessions();
  const { mutate: deleteSession } = useDeleteMissionControlSession();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    let filtered = sessions.filter(session => {
      const matchesSearch = searchQuery === '' || 
        session.objective.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [sessions, searchQuery, statusFilter, sortBy]);

  const handleDelete = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      deleteSession(sessionId);
    }
  };

  const statusCounts = useMemo(() => {
    if (!sessions) return { all: 0, completed: 0, in_progress: 0, failed: 0 };
    
    return {
      all: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      in_progress: sessions.filter(s => s.status === 'in_progress').length,
      failed: sessions.filter(s => s.status === 'failed').length,
    };
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassmorphicPanel className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/70">Loading mission history...</p>
        </GlassmorphicPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/mission-control')}
            className="mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Mission Control
          </Button>

          <h1 className="text-4xl font-bold text-white mb-2">
            Mission History
          </h1>
          <p className="text-white/70 text-lg">
            View and manage all your past missions
          </p>
        </motion.div>

        {/* Filters and Search */}
        <GlassmorphicPanel className="mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <Input
                placeholder="Search missions by objective..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Status Filter */}
            <div>
              <div className="text-sm text-white/70 mb-2">Filter by Status</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({statusCounts.all})
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed ({statusCounts.completed})
                </Button>
                <Button
                  variant={statusFilter === 'in_progress' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('in_progress')}
                >
                  In Progress ({statusCounts.in_progress})
                </Button>
                <Button
                  variant={statusFilter === 'failed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('failed')}
                >
                  Failed ({statusCounts.failed})
                </Button>
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                Showing {filteredSessions.length} of {sessions?.length || 0} missions
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70">Sort by:</span>
                <Button
                  variant={sortBy === 'recent' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Most Recent
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest First
                </Button>
              </div>
            </div>
          </div>
        </GlassmorphicPanel>

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <SessionHistoryCard
                  session={session}
                  onView={() => router.push(`/mission-control/${session.id}`)}
                  onDelete={() => handleDelete(session.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassmorphicPanel className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No missions found
            </h3>
            <p className="text-white/70 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t created any missions yet'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </GlassmorphicPanel>
        )}
      </div>
    </div>
  );
}
