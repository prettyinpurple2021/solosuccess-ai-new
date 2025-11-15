import { SubscriptionTier } from '@/lib/stripe/client';

export interface FeatureAccess {
  hasAccess: boolean;
  requiredTier?: SubscriptionTier;
  reason?: string;
}

export interface UsageLimits {
  conversations: number;
  missionControl: number;
  contentGeneration: number;
  competitorProfiles: number;
  chaosSimulations: number;
  shadowAssessments: number;
}

export const TIER_FEATURES = {
  free: {
    agents: ['roxy', 'echo', 'blaze'], // 3 agents
    conversations: 5,
    missionControl: 0,
    contentGeneration: 10,
    competitorProfiles: 0,
    chaosSimulations: 0,
    shadowAssessments: 0,
    analytics: false,
    intelAcademy: false,
    prioritySupport: false,
  },
  accelerator: {
    agents: ['roxy', 'echo', 'blaze', 'lumi', 'vex', 'lexi', 'nova'], // All 7 agents
    conversations: -1, // Unlimited
    missionControl: 0,
    contentGeneration: -1, // Unlimited
    competitorProfiles: 10,
    chaosSimulations: -1, // Unlimited
    shadowAssessments: -1, // Unlimited
    analytics: true,
    intelAcademy: false,
    prioritySupport: true,
  },
  premium: {
    agents: ['roxy', 'echo', 'blaze', 'lumi', 'vex', 'lexi', 'nova'], // All 7 agents
    conversations: -1, // Unlimited
    missionControl: -1, // Unlimited
    contentGeneration: -1, // Unlimited
    competitorProfiles: -1, // Unlimited
    chaosSimulations: -1, // Unlimited
    shadowAssessments: -1, // Unlimited
    analytics: true,
    intelAcademy: true,
    prioritySupport: true,
  },
} as const;

/**
 * Check if a user has access to a specific feature
 */
export function checkFeatureAccess(
  userTier: SubscriptionTier,
  feature: keyof typeof TIER_FEATURES.free
): FeatureAccess {
  const tierFeatures = TIER_FEATURES[userTier];

  // Handle agent access
  if (feature === 'agents') {
    return {
      hasAccess: true,
      reason: `Access to ${tierFeatures.agents.length} agents`,
    };
  }

  // Handle boolean features
  if (typeof tierFeatures[feature] === 'boolean') {
    const hasAccess = tierFeatures[feature] as boolean;
    return {
      hasAccess,
      requiredTier: hasAccess ? undefined : getRequiredTier(feature),
      reason: hasAccess ? undefined : `Requires ${getRequiredTier(feature)} plan`,
    };
  }

  // Handle numeric limits
  const limit = tierFeatures[feature] as number;
  return {
    hasAccess: limit !== 0,
    requiredTier: limit === 0 ? getRequiredTier(feature) : undefined,
    reason: limit === 0 ? `Requires ${getRequiredTier(feature)} plan` : undefined,
  };
}

/**
 * Check if a user can access a specific AI agent
 */
export function checkAgentAccess(
  userTier: SubscriptionTier,
  agentId: string
): FeatureAccess {
  const allowedAgents = TIER_FEATURES[userTier].agents;

  if (allowedAgents.includes(agentId)) {
    return { hasAccess: true };
  }

  return {
    hasAccess: false,
    requiredTier: 'accelerator',
    reason: 'This agent requires an Accelerator or Premium plan',
  };
}

/**
 * Check if a user has reached their usage limit for a feature
 */
export function checkUsageLimit(
  userTier: SubscriptionTier,
  feature: keyof UsageLimits,
  currentUsage: number
): FeatureAccess {
  const tierFeatures = TIER_FEATURES[userTier];
  const limit = tierFeatures[feature] as number;

  // -1 means unlimited
  if (limit === -1) {
    return { hasAccess: true };
  }

  // 0 means no access
  if (limit === 0) {
    return {
      hasAccess: false,
      requiredTier: getRequiredTier(feature),
      reason: `This feature requires ${getRequiredTier(feature)} plan`,
    };
  }

  // Check if under limit
  if (currentUsage < limit) {
    return {
      hasAccess: true,
      reason: `${currentUsage}/${limit} used`,
    };
  }

  return {
    hasAccess: false,
    requiredTier: getUpgradeTier(userTier),
    reason: `Monthly limit reached (${limit}). Upgrade for unlimited access.`,
  };
}

/**
 * Get the minimum tier required for a feature
 */
function getRequiredTier(feature: string): SubscriptionTier {
  if (TIER_FEATURES.accelerator[feature as keyof typeof TIER_FEATURES.accelerator]) {
    return 'accelerator';
  }
  return 'premium';
}

/**
 * Get the next tier up from the current tier
 */
function getUpgradeTier(currentTier: SubscriptionTier): SubscriptionTier {
  if (currentTier === 'free') return 'accelerator';
  if (currentTier === 'accelerator') return 'premium';
  return 'premium';
}

/**
 * Get usage limits for a tier
 */
export function getUsageLimits(tier: SubscriptionTier): UsageLimits {
  const features = TIER_FEATURES[tier];
  return {
    conversations: features.conversations,
    missionControl: features.missionControl,
    contentGeneration: features.contentGeneration,
    competitorProfiles: features.competitorProfiles,
    chaosSimulations: features.chaosSimulations,
    shadowAssessments: features.shadowAssessments,
  };
}

/**
 * Get all features available for a tier
 */
export function getTierFeatures(tier: SubscriptionTier) {
  return TIER_FEATURES[tier];
}
