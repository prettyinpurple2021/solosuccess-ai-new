'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';

const tiers = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    icon: Sparkles,
    features: [
      'Access to 3 AI agents',
      'Basic chat functionality',
      'Limited content generation',
      '5 conversations per month',
      'Community support',
    ],
    cta: 'Get Started',
    highlighted: false,
    tier: 'free' as const,
  },
  {
    name: 'Accelerator',
    price: 49,
    description: 'For serious solo founders',
    icon: Zap,
    features: [
      'Access to all 7 AI agents',
      'Unlimited conversations',
      'Competitor Stalker feature',
      'Chaos/Failure Mode simulations',
      'Shadow Self assessments',
      'Unlimited content generation',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Start Accelerating',
    highlighted: true,
    tier: 'accelerator' as const,
  },
  {
    name: 'Premium',
    price: 99,
    description: 'Maximum power and support',
    icon: Crown,
    features: [
      'Everything in Accelerator',
      'Mission Control (unlimited)',
      'Intel Academy access',
      'Custom AI agent training',
      'White-glove onboarding',
      'Dedicated account manager',
      'API access',
      'Priority processing',
    ],
    cta: 'Go Premium',
    highlighted: false,
    tier: 'premium' as const,
  },
];

const faqs = [
  {
    question: 'Can I change my plan later?',
    answer:
      'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the end of your billing period for downgrades.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'The Free tier is available forever with no credit card required. You can upgrade to a paid plan at any time to unlock additional features.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      "You'll retain access to your paid features until the end of your billing period. After that, you'll be automatically moved to the Free tier.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us for a full refund.',
  },
  {
    question: 'Can I get a discount for annual billing?',
    answer:
      'Yes! Annual billing saves you 20% compared to monthly billing. Contact our sales team for enterprise pricing options.',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubscribe = async (tier: 'free' | 'accelerator' | 'premium') => {
    if (tier === 'free') {
      window.location.href = '/auth/register';
      return;
    }

    // TODO: Implement checkout flow
    console.log('Subscribe to:', tier);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Growth Path
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Empower your solo journey with AI-powered insights, automation, and
            strategic guidance
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-lg ${
                billingPeriod === 'monthly'
                  ? 'text-white font-semibold'
                  : 'text-gray-400'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === 'monthly' ? 'annual' : 'monthly'
                )
              }
              className="relative w-16 h-8 bg-white/20 rounded-full transition-colors hover:bg-white/30"
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                animate={{
                  x: billingPeriod === 'annual' ? 32 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`text-lg ${
                billingPeriod === 'annual'
                  ? 'text-white font-semibold'
                  : 'text-gray-400'
              }`}
            >
              Annual
              <span className="ml-2 text-sm text-green-400">(Save 20%)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const price =
              billingPeriod === 'annual' && tier.price > 0
                ? Math.round(tier.price * 0.8)
                : tier.price;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={tier.highlighted ? 'md:-mt-4' : ''}
              >
                <GlassmorphicCard
                  className={`relative h-full p-8 ${
                    tier.highlighted
                      ? 'border-2 border-purple-400 shadow-2xl shadow-purple-500/50'
                      : ''
                  }`}
                  elevation={tier.highlighted ? 'high' : 'medium'}
                  gradient={tier.highlighted}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {tier.name}
                    </h3>
                  </div>

                  <p className="text-gray-300 mb-6">{tier.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        ${price}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-gray-400">
                          /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'annual' && tier.price > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        ${tier.price}/mo billed annually
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(tier.tier)}
                    className={`w-full mb-6 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {tier.cta}
                  </Button>

                  <div className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-200 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </GlassmorphicCard>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <GlassmorphicCard
                key={index}
                className="p-6 cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFaq === index ? 'auto' : 0,
                    opacity: expandedFaq === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-300 mt-4">{faq.answer}</p>
                </motion.div>
              </GlassmorphicCard>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-24"
        >
          <GlassmorphicCard className="p-12 max-w-4xl mx-auto" gradient>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Solo Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of solo founders who are scaling smarter with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => (window.location.href = '/auth/register')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-3"
              >
                Start Free Today
              </Button>
              <Button
                onClick={() => (window.location.href = '/contact')}
                className="bg-white/10 hover:bg-white/20 text-lg px-8 py-3"
              >
                Talk to Sales
              </Button>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
}
