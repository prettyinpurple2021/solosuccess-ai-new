'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeneratedContent, useUpdateContent, useDeleteContent } from '@/lib/hooks/useContentGeneration';
import { ContentCard } from '@/components/content-generation/ContentCard';
import { ContentEditor } from '@/components/content-generation/ContentEditor';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GeneratedContent } from '@/lib/hooks/useContentGeneration';

const contentTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'social-post', label: 'Social Media Post' },
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'email', label: 'Email' },
  { value: 'ad-copy', label: 'Ad Copy' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'landing-page', label: 'Landing Page Copy' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingContent, setEditingContent] = useState<GeneratedContent | null>(null);
  const [viewingContent, setViewingContent] = useState<GeneratedContent | null>(null);

  const { data: content, isLoading } = useGeneratedContent({
    contentType: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

  const filteredContent = content?.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  const handleEdit = (content: GeneratedContent) => {
    setEditingContent(content);
  };

  const handleView = (content: GeneratedContent) => {
    setViewingContent(content);
  };

  const handleSave = async (
    contentId: string,
    data: { title?: string; content?: string; status?: string }
  ) => {
    try {
      await updateContent.mutateAsync({ contentId, data });
      setEditingContent(null);
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent.mutateAsync(contentId);
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <GradientText>Content Library</GradientText>
          </h1>
          <p className="text-white/70 text-lg">
            Manage all your AI-generated content in one place. Search, edit, and organize your content library.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
          <Select
            options={contentTypeOptions}
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredContent && filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-white/40 text-lg mb-4">
              {searchQuery || contentTypeFilter !== 'all' || statusFilter !== 'all'
                ? 'No content found matching your filters'
                : 'No content yet'}
            </div>
            <Button variant="gradient" onClick={() => (window.location.href = '/content-generation')}>
              Generate Your First Content
            </Button>
          </div>
        )}
      </motion.div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingContent && (
          <ContentEditor
            content={editingContent}
            onSave={handleSave}
            onCancel={() => setEditingContent(null)}
            isLoading={updateContent.isPending}
          />
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingContent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {viewingContent.title || 'Untitled Content'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="capitalize">{viewingContent.contentType.replace('-', ' ')}</span>
                  {viewingContent.metadata?.platform && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{viewingContent.metadata.platform}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 whitespace-pre-wrap">{viewingContent.content}</p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setViewingContent(null)}>
                  Close
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => {
                    setViewingContent(null);
                    setEditingContent(viewingContent);
                  }}
                >
                  Edit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
