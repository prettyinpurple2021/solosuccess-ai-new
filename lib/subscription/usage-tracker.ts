import { prisma } from '@/lib/db/prisma';
import { checkUsageLimit } from './features';
import { SubscriptionTier } from '@/lib/stripe/client';

export type UsageType =
  | 'conversations'
  | 'missionControl'
  | 'contentGeneration'
  | 'competitorProfiles'
  | 'chaosSimulations'
  | 'shadowAssessments';

/**
 * Track usage for a feature
 */
export async function trackUsage(
  userId: string,
  usageType: UsageType
): Promise<void> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // This would be stored in a UsageTracking table in a real implementation
  // For now, we'll use a simple counter approach
  console.log('Tracking usage:', { userId, usageType, timestamp: now });
}

/**
 * Get current usage for a user
 */
export async function getCurrentUsage(
  userId: string,
  usageType: UsageType
): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count based on usage type
  switch (usageType) {
    case 'conversations':
      return await prisma.conversation.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

    case 'missionControl':
      return await prisma.missionControlSession.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

    case 'contentGeneration':
      return await prisma.generatedContent.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

    case 'competitorProfiles':
      return await prisma.competitorProfile.count({
        where: {
          userId,
          isActive: true,
        },
      });

    case 'chaosSimulations':
      return await prisma.preMortemSimulation.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

    case 'shadowAssessments':
      return await prisma.shadowSelfAssessment.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

    default:
      return 0;
  }
}

/**
 * Check if user can use a feature based on their usage
 */
export async function canUseFeature(
  userId: string,
  tier: SubscriptionTier,
  usageType: UsageType
): Promise<{
  allowed: boolean;
  currentUsage: number;
  limit: number;
  reason?: string;
  requiredTier?: SubscriptionTier;
}> {
  const currentUsage = await getCurrentUsage(userId, usageType);
  const access = checkUsageLimit(tier, usageType, currentUsage);

  return {
    allowed: access.hasAccess,
    currentUsage,
    limit: access.hasAccess ? -1 : 0, // Simplified for now
    reason: access.reason,
    requiredTier: access.requiredTier,
  };
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(
  userId: string,
  tier: SubscriptionTier
): Promise<Record<UsageType, { current: number; limit: number; percentage: number }>> {
  const usageTypes: UsageType[] = [
    'conversations',
    'missionControl',
    'contentGeneration',
    'competitorProfiles',
    'chaosSimulations',
    'shadowAssessments',
  ];

  const summary: any = {};

  for (const type of usageTypes) {
    const current = await getCurrentUsage(userId, type);
    const access = checkUsageLimit(tier, type, current);

    let limit = -1; // Unlimited
    if (!access.hasAccess && access.reason?.includes('limit')) {
      // Extract limit from reason if available
      const match = access.reason.match(/\((\d+)\)/);
      if (match) {
        limit = parseInt(match[1]);
      }
    }

    summary[type] = {
      current,
      limit,
      percentage: limit > 0 ? Math.min((current / limit) * 100, 100) : 0,
    };
  }

  return summary;
}

/**
 * Reset monthly usage (called by cron job)
 */
export async function resetMonthlyUsage(): Promise<void> {
  // In a real implementation, this would reset counters in a UsageTracking table
  // For now, we rely on date-based queries
  console.log('Monthly usage reset triggered');
}
