'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GlassmorphicPanel } from '@/components/ui/GlassmorphicPanel';
import { Button } from '@/components/ui/Button';
import { 
  Target, 
  Eye, 
  AlertTriangle, 
  Brain, 
  Sparkles,
  FileText, 
  BarChart3,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Agent Chat',
    description: 'Talk to Your Virtual Executive Team',
    details: 'Get instant expert advice from seven specialized AI agents. Each conversation is intelligent, contextual, and tailored to your business needs.',
    benefits: [
      'Contextual memory across conversations',
      'Real-time responses in 3 seconds or less',
      'Cross-agent referencing for comprehensive insights',
      'Complete conversation history',
      'File attachment support'
    ],
    gradient: 'from-blue-500 to-cyan-500',
    link: '/agents'
  },
  {
    icon: Target,
    title: 'Mission Control',
    description: 'Delegate Complex Projects to AI',
    details: 'Give Mission Control a big objective, and watch multiple AI agents collaborate to deliver a comprehensive, actionable plan in minutes.',
    benefits: [
      'Executive summary with high-level strategy',
      'Detailed step-by-step breakdown',
      'Prioritized action items',
      'Resource requirements and budgets',
      'Risk analysis and mitigation strategies'
    ],
    gradient: 'from-purple-500 to-pink-500',
    link: '/mission-control'
  },
  {
    icon: Eye,
    title: 'Competitor Stalker',
    description: 'Never Miss a Competitor Move',
    details: 'Automated competitive intelligence that tracks your rivals 24/7 and delivers daily briefings with AI-powered analysis.',
    benefits: [
      'Track up to 10 competitors automatically',
      'Daily intelligence briefings',
      'Real-time alerts for significant moves',
      'Trend analysis across competitors',
      'Strategic recommendations'
    ],
    gradient: 'from-orange-500 to-red-500',
    link: '/competitor-stalker'
  },
  {
    icon: AlertTriangle,
    title: 'Chaos Mode',
    description: 'Prepare for Failure Before It Happens',
    details: 'Run pre-mortem simulations to identify risks, prepare mitigation strategies, and increase your chances of success.',
    benefits: [
      '15-25 potential risks identified',
      'Likelihood and impact scoring',
      'Detailed mitigation strategies',
      'Contingency plans for each risk',
      'Comprehensive pre-mortem reports'
    ],
    gradient: 'from-teal-500 to-emerald-500',
    link: '/chaos-mode'
  },
  {
    icon: Brain,
    title: 'Shadow Self',
    description: 'Discover Your Blind Spots',
    details: 'Identify cognitive biases and decision-making patterns that might be holding your business back.',
    benefits: [
      'Comprehensive blind spot assessment',
      'Personalized coaching prompts',
      'Decision warnings aligned with biases',
      'Progress tracking over time',
      'Reflection exercises for growth'
    ],
    gradient: 'from-indigo-500 to-blue-500',
    link: '/shadow-self'
  },
  {
    icon: Sparkles,
    title: 'Content Generation',
    description: 'Create Marketing Content in Seconds',
    details: 'Generate social posts, email campaigns, blog content, and viral hooks—all optimized for your brand voice.',
    benefits: [
      'Platform-specific optimization',
      'Multiple variations per request',
      'Brand voice learning',
      'Engagement scoring predictions',
      'Content library with version history'
    ],
    gradient: 'from-violet-500 to-purple-500',
    link: '/content-generation'
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Professional Business Documents in Minutes',
    details: 'Generate contracts, proposals, NDAs, and legal documents customized for your business and jurisdiction.',
    benefits: [
      'Jurisdiction-specific customization',
      'Business type adaptation',
      'Rich text editor with collaboration',
      'Version control and comparison',
      'PDF and DOCX export'
    ],
    gradient: 'from-pink-500 to-rose-500',
    link: '/documents'
  },
  {
    icon: BarChart3,
    title: 'Data Analytics',
    description: 'Turn Data Into Actionable Insights',
    details: 'Connect your business tools and get AI-powered insights, trend analysis, and daily nudges to improve performance.',
    benefits: [
      'Integration with major platforms',
      'Daily insight nudges',
      'Interactive glassmorphic dashboards',
      'Trend detection and anomaly alerts',
      'Predictive analytics'
    ],
    gradient: 'from-cyan-500 to-blue-500',
    link: '/analytics'
  }
];

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to Scale Solo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Powerful features designed specifically for solo founders who want to move fast without sacrificing quality.
          </p>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => router.push('/auth/register')}
          >
            Start Free Trial
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-16 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isEven = i % 2 === 0;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassmorphicPanel className="p-8 md:p-12">
                  <div className={`grid md:grid-cols-2 gap-8 items-center ${!isEven ? 'md:grid-flow-dense' : ''}`}>
                    {/* Icon and Title */}
                    <div className={!isEven ? 'md:col-start-2' : ''}>
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-3">{feature.title}</h2>
                      <p className="text-xl text-cyan-400 mb-4">{feature.description}</p>
                      <p className="text-gray-300 leading-relaxed mb-6">{feature.details}</p>
                      <Button
                        variant="outline"
                        onClick={() => router.push(feature.link)}
                        className="group"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    {/* Benefits */}
                    <div className={!isEven ? 'md:col-start-1 md:row-start-1' : ''}>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Key Benefits</h3>
                        <ul className="space-y-3">
                          {feature.benefits.map((benefit, j) => (
                            <li key={j} className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-gray-300">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </GlassmorphicPanel>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto mt-20 text-center"
        >
          <GlassmorphicPanel className="p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Experience All Features?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => router.push('/auth/register')}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/pricing')}
              >
                View Pricing
              </Button>
            </div>
          </GlassmorphicPanel>
        </motion.div>
      </div>
    </div>
  );
}
