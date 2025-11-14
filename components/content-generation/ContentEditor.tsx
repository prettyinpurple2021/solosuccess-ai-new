'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { GeneratedContent } from '@/lib/hooks/useContentGeneration';

interface ContentEditorProps {
  content: GeneratedContent;
  onSave: (contentId: string, data: { title?: string; content?: string; status?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(content.title || '');
  const [contentText, setContentText] = useState(content.content);
  const [status, setStatus] = useState(content.status);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);

  const variations = content.metadata?.variations || [];
  const hasVariations = variations.length > 0;

  const handleSave = () => {
    onSave(content.id, {
      title,
      content: contentText,
      status,
    });
  };

  const handleVariationSelect = (index: number) => {
    setSelectedVariation(index);
    setContentText(variations[index].content);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <GlassmorphicCard className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Edit Content</h2>
            <p className="text-white/70 text-sm">
              Make changes to your content and save when ready.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
            />

            {hasVariations && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Content Variations
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {variations.map((variation: any, index: number) => (
                    <Button
                      key={index}
                      variant={selectedVariation === index ? 'gradient' : 'outline'}
                      size="sm"
                      onClick={() => handleVariationSelect(index)}
                    >
                      Variation {index + 1}
                      {variation.qualityScore && (
                        <span className="ml-2 text-xs">({variation.qualityScore}%)</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              label="Content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={12}
              placeholder="Enter your content here..."
            />

            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-sm text-white/60">
                <span>Word count: {contentText.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </motion.div>
    </motion.div>
  );
};
