'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { GeneratedContent } from '@/lib/hooks/useContentGeneration';
import { cn } from '@/lib/utils/cn';

interface ContentCardProps {
  content: GeneratedContent;
  onEdit: (content: GeneratedContent) => void;
  onDelete: (contentId: string) => void;
  onView: (content: GeneratedContent) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onEdit,
  onDelete,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-400 bg-green-500/20';
      case 'draft':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'archived':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const qualityScore = content.metadata?.qualityScore || 0;

  return (
    <GlassmorphicCard className="p-6 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
              {content.title || 'Untitled Content'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="capitalize">{content.contentType.replace('-', ' ')}</span>
              {content.metadata?.platform && (
                <>
                  <span>•</span>
                  <span className="capitalize">{content.metadata.platform}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor(content.status)
              )}
            >
              {content.status}
            </span>
          </div>
        </div>

        <div className="flex-1 mb-4">
          <p className="text-white/70 text-sm line-clamp-3">{content.content}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>{formatDate(content.createdAt)}</span>
            {qualityScore > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-white/80">Quality:</span>
                <span
                  className={cn(
                    'font-semibold',
                    qualityScore >= 80 && 'text-green-400',
                    qualityScore >= 60 && qualityScore < 80 && 'text-yellow-400',
                    qualityScore < 60 && 'text-orange-400'
                  )}
                >
                  {qualityScore}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(content)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(content)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(content.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
