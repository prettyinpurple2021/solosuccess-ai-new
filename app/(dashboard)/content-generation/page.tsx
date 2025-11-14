'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentRequestForm, ContentRequestFormData } from '@/components/content-generation/ContentRequestForm';
import { useGenerateContent } from '@/lib/hooks/useContentGeneration';
import { GradientText } from '@/components/ui/GradientText';

export default function ContentGenerationPage() {
  const generateContent = useGenerateContent();

  const handleSubmit = async (data: ContentRequestFormData) => {
    try {
      await generateContent.mutateAsync(data);
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <GradientText>Content Generation</GradientText>
          </h1>
          <p className="text-white/70 text-lg">
            Create engaging, platform-optimized content powered by AI. Generate multiple variations
            and choose the one that resonates best with your audience.
          </p>
        </div>

        <ContentRequestForm
          onSubmit={handleSubmit}
          isLoading={generateContent.isPending}
        />

        {generateContent.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-medium">
                ✓ Content generated successfully! View it in your content library.
              </p>
            </div>
          </motion.div>
        )}

        {generateContent.isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-medium">
                ✗ Failed to generate content. Please try again.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
