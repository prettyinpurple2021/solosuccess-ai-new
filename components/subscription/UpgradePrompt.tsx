'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassmorphicCard } from '@/components/ui/GlassmorphicCard';
import { SubscriptionTier } from '@/lib/stripe/client';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  reason?: string;
}

const tierInfo = {
  free: {
    name: 'Free',
    icon: Sparkles,
    color: 'blue',
  },
  accelerator: {
    name: 'Accelerator',
    icon: Zap,
    color: 'purple',
    price: 49,
    features: [
      'Access to all 7 AI agents',
      'Unlimited conversations',
      'Competitor Stalker',
      'Chaos/Failure Mode',
      'Shadow Self assessments',
      'Unlimited content generation',
    ],
  },
  premium: {
    name: 'Premium',
    icon: Crown,
    color: 'pink',
    price: 99,
    features: [
      'Everything in Accelerator',
      'Mission Control (unlimited)',
      'Intel Academy access',
      'Custom AI agent training',
      'White-glove onboarding',
      'Dedicated account manager',
    ],
  },
};

export function UpgradePrompt({
  isOpen,
  onClose,
  feature,
  requiredTier,
  currentTier,
  reason,
}: UpgradePromptProps) {
  const tier = tierInfo[requiredTier];
  const Icon = tier.icon;

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <GlassmorphicCard className="p-8" gradient>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br from-${tier.color}-500/20 to-${tier.color}-600/20 rounded-xl`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Upgrade to {tier.name}
                    </h3>
                    {tier.price && (
                      <p className="text-gray-300">
                        ${tier.price}/month
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 font-semibold mb-1">
                    Feature Locked
                  </p>
                  <p className="text-gray-300 text-sm">
                    {reason || `${feature} requires ${tier.name} plan`}
                  </p>
                </div>

                {tier.features && (
                  <div className="space-y-3">
                    <p className="text-white font-semibold mb-3">
                      Unlock these features:
                    </p>
                    {tier.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-2 h-2 rounded-full bg-${tier.color}-400`} />
                        <span className="text-gray-200">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleUpgrade}
                  className={`flex-1 bg-gradient-to-r from-${tier.color}-500 to-${tier.color}-600 hover:from-${tier.color}-600 hover:to-${tier.color}-700 flex items-center justify-center gap-2`}
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-4">
                14-day money-back guarantee • Cancel anytime
              </p>
            </GlassmorphicCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
