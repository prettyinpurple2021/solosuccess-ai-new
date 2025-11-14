'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ViralHookGenerator } from '@/components/content-generation/ViralHookGenerator';
import { GradientText } from '@/components/ui/GradientText';

export default function ViralHooksPage() {
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
            <GradientText>Viral Hook Generator</GradientText>
          </h1>
          <p className="text-white/70 text-lg">
            Create attention-grabbing hooks that stop the scroll and drive engagement. 
            Get AI-powered suggestions optimized for each platform with engagement prediction scores.
          </p>
        </div>

        <ViralHookGenerator />

        <div className="mt-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tips for Viral Hooks</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Use numbers and specific data points to add credibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Ask questions that resonate with your audience's pain points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Create curiosity gaps that make people want to learn more</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Use power words that trigger emotional responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Test multiple variations to see what resonates best</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
