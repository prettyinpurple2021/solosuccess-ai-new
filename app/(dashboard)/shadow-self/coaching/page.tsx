'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target } from 'lucide-react';
import { useCoachingPrompts } from '@/lib/hooks/useCoachingPrompts';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { CoachingPromptCard } from '@/components/shadow-self/CoachingPromptCard';

export default function CoachingPage() {
  const { prompts, progressMetrics, completePrompt, isLoading } = useCoachingPrompts();

  const handleCompletePrompt = async (promptId: string, response: string) => {
    await completePrompt.mutateAsync({ promptId, response });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading coaching prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Coaching & Growth
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Build self-awareness through regular reflection and practice
          </p>
        </motion.div>

        {/* Progress Metrics */}
        {progressMetrics && (
          <div className="grid md:grid-cols-3 gap-6">
            <GlassmorphicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {progressMetrics.completedPrompts}/{progressMetrics.totalPrompts}
                  </div>
                  <div className="text-sm text-gray-400">Prompts Completed</div>
                </div>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {progressMetrics.completionRate}%
                  </div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                </div>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {progressMetrics.totalPrompts - progressMetrics.completedPrompts}
                  </div>
                  <div className="text-sm text-gray-400">Remaining</div>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {/* Coaching Prompts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Your Coaching Prompts</h2>
          
          {prompts && prompts.length > 0 ? (
            <div className="space-y-6">
              {prompts.map((prompt) => (
                <CoachingPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onComplete={handleCompletePrompt}
                />
              ))}
            </div>
          ) : (
            <GlassmorphicCard className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">No Active Prompts</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Complete your Shadow Self assessment to receive personalized coaching prompts.
                </p>
              </div>
            </GlassmorphicCard>
          )}
        </div>

        {/* Tips */}
        <GlassmorphicCard className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Coaching Tips</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Set aside 10-15 minutes daily for reflection exercises</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Be honest in your responses - there are no wrong answers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Track patterns in your decision-making over time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Share insights with a trusted advisor or mentor</span>
            </li>
          </ul>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
