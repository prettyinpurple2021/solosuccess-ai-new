'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Download, Share2 } from 'lucide-react';
import { useShadowSelfReport } from '@/lib/hooks/useShadowSelfAssessments';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { Button } from '@/components/ui/Button';
import { BiasIndicator } from '@/components/shadow-self/BiasIndicator';
import { BlindSpotCard } from '@/components/shadow-self/BlindSpotCard';
import { ImpactExamples } from '@/components/shadow-self/ImpactExamples';
import { RecommendationCard } from '@/components/shadow-self/RecommendationCard';
import { BIAS_DESCRIPTIONS } from '@/lib/data/shadow-self-questions';

export default function ShadowSelfReportPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;
  const { report, isLoading } = useShadowSelfReport(assessmentId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Analyzing your responses...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Report not found</p>
        </div>
      </div>
    );
  }

  const biases = report.identifiedBiases as any[];
  const blindSpots = report.blindSpots as any[];
  const impactExamples = report.impactExamples as any[];
  const recommendations = report.recommendations as any[];
  const decisionPatterns = report.decisionPatterns as any[];

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
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Your Shadow Self Report
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A personalized analysis of your cognitive biases and blind spots
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Overall Score */}
        <GlassmorphicCard className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-white">Overall Risk Score</h2>
            <div className="relative inline-block">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="20"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 80 * (1 - (report.overallScore || 0) / 100),
                  }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{report.overallScore}</div>
                  <div className="text-sm text-gray-400">out of 100</div>
                </div>
              </div>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {report.overallScore && report.overallScore < 30
                ? 'Excellent! You demonstrate strong self-awareness and balanced decision-making.'
                : report.overallScore && report.overallScore < 60
                ? 'Good awareness with some areas for improvement. Focus on the recommendations below.'
                : 'Significant biases detected. Prioritize addressing the critical areas identified.'}
            </p>
          </div>
        </GlassmorphicCard>

        {/* Identified Biases */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Identified Cognitive Biases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {biases.slice(0, 6).map((bias) => {
              const biasInfo = BIAS_DESCRIPTIONS[bias.biasType];
              return (
                <BiasIndicator
                  key={bias.biasType}
                  biasType={bias.biasType}
                  score={bias.score}
                  severity={bias.severity}
                  name={biasInfo?.name || bias.biasType}
                  description={biasInfo?.description || ''}
                />
              );
            })}
          </div>
        </div>

        {/* Blind Spots */}
        {blindSpots.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Your Blind Spots</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {blindSpots.map((blindSpot, index) => (
                <BlindSpotCard key={index} {...blindSpot} />
              ))}
            </div>
          </div>
        )}

        {/* Decision Patterns */}
        {decisionPatterns.length > 0 && (
          <GlassmorphicCard className="p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Your Decision Patterns</h2>
            <div className="space-y-4">
              {decisionPatterns.map((pattern: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{pattern.pattern}</h3>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs capitalize">
                      {pattern.tendency}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{pattern.description}</p>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        )}

        {/* Impact Examples */}
        {impactExamples.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Real-World Impact</h2>
            <p className="text-gray-400">
              Here's how these biases might affect your business decisions:
            </p>
            <ImpactExamples impactExamples={impactExamples} />
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Personalized Recommendations</h2>
          <p className="text-gray-400">
            Actionable strategies to overcome your biases and build self-awareness:
          </p>
          <div className="space-y-6">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={index}
                recommendation={recommendation}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <GlassmorphicCard className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-white">What's Next?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              You'll receive regular coaching prompts and reflection exercises tailored to your identified biases. 
              These will help you build lasting self-awareness and improve your decision-making over time.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                View Coaching Prompts
              </Button>
              <Button variant="outline">
                Schedule Reassessment
              </Button>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
