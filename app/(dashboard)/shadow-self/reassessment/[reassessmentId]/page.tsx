'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Award, Target, Calendar } from 'lucide-react';
import { useReassessmentComparison } from '@/lib/hooks/useReassessment';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { ProgressChart } from '@/components/shadow-self/ProgressChart';

export default function ReassessmentComparisonPage() {
  const params = useParams();
  const reassessmentId = params.reassessmentId as string;
  const { comparison, isLoading } = useReassessmentComparison(reassessmentId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Comparison not found</p>
        </div>
      </div>
    );
  }

  const isImproving = comparison.overallTrend === 'improving';
  const isDeclining = comparison.overallTrend === 'declining';

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
            <Award className="w-10 h-10 text-purple-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Your Progress Report
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comparing your growth over the past quarter
          </p>
        </motion.div>

        {/* Overall Progress */}
        <div className="grid md:grid-cols-3 gap-6">
          <GlassmorphicCard className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isImproving
                  ? 'bg-gradient-to-br from-green-500/20 to-teal-500/20'
                  : isDeclining
                  ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20'
                  : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
              }`}>
                {isImproving ? (
                  <TrendingDown className="w-6 h-6 text-green-400" />
                ) : isDeclining ? (
                  <TrendingUp className="w-6 h-6 text-red-400" />
                ) : (
                  <Target className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {comparison.improvement > 0 ? '-' : '+'}
                  {Math.abs(comparison.improvement)}
                </div>
                <div className="text-sm text-gray-400">Overall Change</div>
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {comparison.resolvedBiases.length}
                </div>
                <div className="text-sm text-gray-400">Biases Resolved</div>
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {comparison.currentScore}
                </div>
                <div className="text-sm text-gray-400">Current Score</div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Score Comparison */}
        <GlassmorphicCard className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Score Comparison</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Previous Assessment</div>
              <div className="text-5xl font-bold text-gray-300">{comparison.previousScore}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Current Assessment</div>
              <div className={`text-5xl font-bold ${
                isImproving ? 'text-green-400' : isDeclining ? 'text-red-400' : 'text-blue-400'
              }`}>
                {comparison.currentScore}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className={`text-lg font-semibold ${
              isImproving ? 'text-green-400' : isDeclining ? 'text-red-400' : 'text-blue-400'
            }`}>
              {isImproving
                ? '🎉 Great progress! Your self-awareness is improving.'
                : isDeclining
                ? '⚠️ Some areas need attention. Review your coaching exercises.'
                : '📊 Maintaining stability. Keep up the good work.'}
            </p>
          </div>
        </GlassmorphicCard>

        {/* Bias Changes */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Individual Bias Progress</h2>
          <ProgressChart biasChanges={comparison.biasChanges} />
        </div>

        {/* Resolved Biases */}
        {comparison.resolvedBiases.length > 0 && (
          <GlassmorphicCard className="p-8 bg-gradient-to-br from-green-500/10 to-teal-500/10">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-400" />
              Biases You've Overcome
            </h2>
            <div className="flex flex-wrap gap-3">
              {comparison.resolvedBiases.map((bias) => (
                <motion.span
                  key={bias}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 font-medium capitalize"
                >
                  {bias.replace(/_/g, ' ')}
                </motion.span>
              ))}
            </div>
          </GlassmorphicCard>
        )}

        {/* New Biases */}
        {comparison.newBiases.length > 0 && (
          <GlassmorphicCard className="p-8 bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-400" />
              New Areas to Focus On
            </h2>
            <p className="text-gray-300 mb-4">
              These biases have emerged or become more prominent since your last assessment.
            </p>
            <div className="flex flex-wrap gap-3">
              {comparison.newBiases.map((bias) => (
                <motion.span
                  key={bias}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 font-medium capitalize"
                >
                  {bias.replace(/_/g, ' ')}
                </motion.span>
              ))}
            </div>
          </GlassmorphicCard>
        )}

        {/* Next Steps */}
        <GlassmorphicCard className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-white">Continue Your Growth Journey</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              {isImproving
                ? 'You\'re making excellent progress! Keep engaging with your coaching prompts and stay mindful of your decision-making patterns.'
                : isDeclining
                ? 'Don\'t be discouraged. Growth isn\'t always linear. Review your coaching exercises and consider what might have changed in your environment or stress levels.'
                : 'You\'re maintaining good awareness. Continue with your coaching exercises to build on this foundation.'}
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Next Reassessment
              </Button>
              <Button variant="outline">
                View Coaching Prompts
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
