import { useState, useEffect } from 'react';
import { checkFeatureAccess, checkAgentAccess } from '@/lib/subscription/features';
import { SubscriptionTier } from '@/lib/stripe/client';

interface FeatureAccessResult {
  hasAccess: boolean;
  requiredTier?: SubscriptionTier;
  reason?: string;
  isLoading: boolean;
}

/**
 * Hook to check feature access based on user's subscription tier
 */
export function useFeatureAccess(
  feature: string,
  userTier?: SubscriptionTier
): FeatureAccessResult {
  const [result, setResult] = useState<FeatureAccessResult>({
    hasAccess: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!userTier) {
      setResult({ hasAccess: false, isLoading: false });
      return;
    }

    const access = checkFeatureAccess(userTier, feature as any);
    setResult({
      hasAccess: access.hasAccess,
      requiredTier: access.requiredTier,
      reason: access.reason,
      isLoading: false,
    });
  }, [feature, userTier]);

  return result;
}

/**
 * Hook to check agent access based on user's subscription tier
 */
export function useAgentAccess(
  agentId: string,
  userTier?: SubscriptionTier
): FeatureAccessResult {
  const [result, setResult] = useState<FeatureAccessResult>({
    hasAccess: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!userTier) {
      setResult({ hasAccess: false, isLoading: false });
      return;
    }

    const access = checkAgentAccess(userTier, agentId);
    setResult({
      hasAccess: access.hasAccess,
      requiredTier: access.requiredTier,
      reason: access.reason,
      isLoading: false,
    });
  }, [agentId, userTier]);

  return result;
}

/**
 * Hook to check multiple features at once
 */
export function useMultipleFeatureAccess(
  features: string[],
  userTier?: SubscriptionTier
): Record<string, FeatureAccessResult> {
  const [results, setResults] = useState<Record<string, FeatureAccessResult>>({});

  useEffect(() => {
    if (!userTier) {
      const emptyResults: Record<string, FeatureAccessResult> = {};
      features.forEach((feature) => {
        emptyResults[feature] = { hasAccess: false, isLoading: false };
      });
      setResults(emptyResults);
      return;
    }

    const newResults: Record<string, FeatureAccessResult> = {};
    features.forEach((feature) => {
      const access = checkFeatureAccess(userTier, feature as any);
      newResults[feature] = {
        hasAccess: access.hasAccess,
        requiredTier: access.requiredTier,
        reason: access.reason,
        isLoading: false,
      };
    });
    setResults(newResults);
  }, [features.join(','), userTier]);

  return results;
}
