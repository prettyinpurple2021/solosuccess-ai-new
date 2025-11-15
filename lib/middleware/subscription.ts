import { NextRequest, NextResponse } from 'next/server';
import { checkFeatureAccess, checkAgentAccess } from '@/lib/subscription/features';
import { SubscriptionTier } from '@/lib/stripe/client';

export interface SubscriptionContext {
  userId: string;
  tier: SubscriptionTier;
  status: string;
}

/**
 * Middleware to check subscription tier access
 */
export function requireSubscriptionTier(
  requiredTier: SubscriptionTier | SubscriptionTier[]
) {
  return (context: SubscriptionContext): NextResponse | null => {
    const requiredTiers = Array.isArray(requiredTier)
      ? requiredTier
      : [requiredTier];

    if (!requiredTiers.includes(context.tier)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBSCRIPTION_REQUIRED',
            message: `This feature requires ${requiredTiers.join(' or ')} subscription`,
            requiredTier: requiredTiers[0],
          },
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Middleware to check feature access
 */
export function requireFeatureAccess(
  feature: string
) {
  return (context: SubscriptionContext): NextResponse | null => {
    const access = checkFeatureAccess(
      context.tier,
      feature as any
    );

    if (!access.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FEATURE_NOT_AVAILABLE',
            message: access.reason || 'This feature is not available on your plan',
            requiredTier: access.requiredTier,
          },
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Middleware to check agent access
 */
export function requireAgentAccess(agentId: string) {
  return (context: SubscriptionContext): NextResponse | null => {
    const access = checkAgentAccess(context.tier, agentId);

    if (!access.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AGENT_NOT_AVAILABLE',
            message: access.reason || 'This agent is not available on your plan',
            requiredTier: access.requiredTier,
          },
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Check if subscription is active
 */
export function requireActiveSubscription() {
  return (context: SubscriptionContext): NextResponse | null => {
    const activeStatuses = ['active', 'trialing'];

    if (!activeStatuses.includes(context.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBSCRIPTION_INACTIVE',
            message: 'Your subscription is not active',
            status: context.status,
          },
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Compose multiple subscription checks
 */
export function composeSubscriptionChecks(
  ...checks: Array<(context: SubscriptionContext) => NextResponse | null>
) {
  return (context: SubscriptionContext): NextResponse | null => {
    for (const check of checks) {
      const result = check(context);
      if (result) return result;
    }
    return null;
  };
}
