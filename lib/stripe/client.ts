import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  acceleratorPriceId: process.env.STRIPE_ACCELERATOR_PRICE_ID || '',
  premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    priceId: null,
    features: [
      'Access to 3 AI agents',
      'Basic chat functionality',
      'Limited content generation',
      '5 conversations per month',
    ],
  },
  accelerator: {
    name: 'Accelerator',
    priceId: STRIPE_CONFIG.acceleratorPriceId,
    price: 49,
    features: [
      'Access to all 7 AI agents',
      'Unlimited conversations',
      'Competitor Stalker feature',
      'Chaos/Failure Mode simulations',
      'Shadow Self assessments',
      'Unlimited content generation',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    priceId: STRIPE_CONFIG.premiumPriceId,
    price: 99,
    features: [
      'Everything in Accelerator',
      'Mission Control (unlimited)',
      'Intel Academy access',
      'Advanced analytics',
      'Custom AI agent training',
      'White-glove onboarding',
      'Dedicated account manager',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
