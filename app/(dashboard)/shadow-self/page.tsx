'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Eye, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AssessmentForm } from '@/components/shadow-self/AssessmentForm';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { useShadowSelfAssessments } from '@/lib/hooks/useShadowSelfAssessments';

export default function ShadowSelfPage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const { createAssessment, isCreating } = useShadowSelfAssessments();

  const handleStart = async () => {
    try {
      const assessment = await createAssessment.mutateAsync();
      setHasStarted(true);
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  };

  const handleComplete = async (responses: Record<string, string>) => {
    // This will be handled by the API
    router.push('/shadow-self/processing');
  };

  if (hasStarted) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Shadow Self Assessment
            </h1>
            <p className="text-gray-400 mt-2">
              Discover your cognitive biases and blind spots
            </p>
          </div>

          <AssessmentForm onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Meet Your Shadow Self
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Uncover the hidden biases and blind spots that may be sabotaging your business decisions
          </p>
        </motion.div>

        {/* What You'll Discover */}
        <GlassmorphicCard className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            What You'll Discover
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cognitive Biases</h3>
                  <p className="text-sm text-gray-400">
                    Identify mental shortcuts that lead to poor decisions
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Blind Spots</h3>
                  <p className="text-sm text-gray-400">
                    Reveal areas where you consistently miss important information
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Decision Patterns</h3>
                  <p className="text-sm text-gray-400">
                    Understand your unique decision-making tendencies
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Actionable Insights</h3>
                  <p className="text-sm text-gray-400">
                    Get personalized strategies to overcome your biases
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </GlassmorphicCard>

        {/* How It Works */}
        <GlassmorphicCard className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            How It Works
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                1
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Answer 15 Questions</h3>
                <p className="text-gray-400">
                  Respond honestly to scenario-based questions about your business decisions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center font-bold text-white">
                2
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">AI Analysis</h3>
                <p className="text-gray-400">
                  Our AI analyzes your response patterns to identify cognitive biases
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center font-bold text-white">
                3
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Get Your Report</h3>
                <p className="text-gray-400">
                  Receive a detailed report with personalized recommendations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center font-bold text-white">
                4
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Ongoing Coaching</h3>
                <p className="text-gray-400">
                  Receive regular prompts and exercises to build self-awareness
                </p>
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold px-8 py-6 text-lg gap-3"
          >
            <Brain className="w-5 h-5" />
            {isCreating ? 'Starting...' : 'Begin Assessment'}
          </Button>
          
          <p className="text-sm text-gray-500">
            Takes approximately 10-15 minutes • Your responses are private and secure
          </p>
        </motion.div>
      </div>
    </div>
  );
}
