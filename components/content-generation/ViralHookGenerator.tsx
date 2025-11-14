'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { useGenerateViralHooks } from '@/lib/hooks/useContentGeneration';
import { cn } from '@/lib/utils/cn';

const platforms = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
];

interface ViralHook {
  id: string;
  hook: string;
  engagementScore: number;
  platform: string;
}

export const ViralHookGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [hooks, setHooks] = useState<ViralHook[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateHooks = useGenerateViralHooks();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    try {
      const result = await generateHooks.mutateAsync({
        topic,
        platform,
        count: 5,
      });
      setHooks(result.hooks);
    } catch (error) {
      console.error('Failed to generate hooks:', error);
    }
  };

  const handleCopy = (hook: ViralHook) => {
    navigator.clipboard.writeText(hook.hook);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Viral Hook Generator</h3>
          <p className="text-white/70 text-sm">
            Generate scroll-stopping hooks that capture attention and drive engagement.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Topic"
            placeholder="e.g., AI productivity tools for entrepreneurs"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Select
            label="Platform"
            options={platforms}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          />

          <Button
            variant="gradient"
            onClick={handleGenerate}
            loading={generateHooks.isPending}
            disabled={!topic.trim() || generateHooks.isPending}
            className="w-full"
          >
            Generate Viral Hooks
          </Button>
        </div>
      </GlassmorphicCard>

      <AnimatePresence>
        {hooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-white mb-3">Generated Hooks</h4>
            {hooks.map((hook, index) => (
              <motion.div
                key={hook.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassmorphicCard className="p-4 hover:scale-[1.01] transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white mb-2">{hook.hook}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white/60">Engagement Score:</span>
                          <span className={cn('font-semibold', getScoreColor(hook.engagementScore))}>
                            {hook.engagementScore}%
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={copiedId === hook.id ? 'primary' : 'outline'}
                          onClick={() => handleCopy(hook)}
                        >
                          {copiedId === hook.id ? (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {generateHooks.isError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <p className="text-red-400 font-medium">
            ✗ Failed to generate viral hooks. Please try again.
          </p>
        </motion.div>
      )}
    </div>
  );
};
