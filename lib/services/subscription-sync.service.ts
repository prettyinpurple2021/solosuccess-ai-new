import { prisma } from '@/lib/prisma';
import { IntelAcademyService } from './intel-academy.service';

/**
 * Service to handle subscription tier synchronization across platforms
 */
export class SubscriptionSyncService {
  /**
   * Map SoloSuccess AI subscription tiers to Intel Academy tiers
   */
  private static mapSubscriptionTier(tier: string): string {
    const tierMapping: Record<string, string> = {
      free: 'basic',
      accelerator: 'premium',
      premium: 'enterprise',
    };

    return tierMapping[tier.toLowerCase()] || 'basic';
  }

  /**
   * Sync subscription tier change with Intel Academy
   */
  static async syncSubscriptionChange(
    userId: string,
    newTier: string,
    oldTier?: string
  ): Promise<void> {
    try {
      // Check if Intel Academy is connected
      const integration = await IntelAcademyService.getIntegration(userId);

      if (!integration || !integration.isActive) {
        console.log(`Intel Academy not connected for user ${userId}, skipping sync`);
        return;
      }

      // Map tier to Intel Academy format
      const mappedTier = this.mapSubscriptionTier(newTier);

      // Sync with Intel Academy
      await IntelAcademyService.syncSubscriptionTier(userId, mappedTier);

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId,
          type: 'subscription_sync',
          category: 'integration',
          title: 'Intel Academy Access Updated',
          message: `Your Intel Academy access has been updated to match your ${newTier} subscription.`,
          priority: 'medium',
        },
      });

      console.log(`Successfully synced subscription for user ${userId}: ${oldTier} -> ${newTier}`);
    } catch (error) {
      console.error('Error syncing subscription with Intel Academy:', error);

      // Create error notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'subscription_sync_error',
          category: 'integration',
          title: 'Intel Academy Sync Failed',
          message: 'Failed to sync your subscription with Intel Academy. Please try reconnecting.',
          priority: 'high',
        },
      });

      // Don't throw error - subscription change should succeed even if sync fails
    }
  }

  /**
   * Provision access for new subscription
   */
  static async provisionAccess(userId: string, tier: string): Promise<void> {
    try {
      const integration = await IntelAcademyService.getIntegration(userId);

      if (!integration || !integration.isActive) {
        return;
      }

      const mappedTier = this.mapSubscriptionTier(tier);

      // Sync tier
      await IntelAcademyService.syncSubscriptionTier(userId, mappedTier);

      // Update integration status
      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'active',
        },
      });

      console.log(`Provisioned Intel Academy access for user ${userId} with tier ${tier}`);
    } catch (error) {
      console.error('Error provisioning Intel Academy access:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  static async handleCancellation(userId: string): Promise<void> {
    try {
      const integration = await IntelAcademyService.getIntegration(userId);

      if (!integration || !integration.isActive) {
        return;
      }

      // Downgrade to free tier
      await IntelAcademyService.syncSubscriptionTier(userId, 'basic');

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'subscription_sync',
          category: 'integration',
          title: 'Intel Academy Access Changed',
          message: 'Your Intel Academy access has been updated to the basic tier.',
          priority: 'medium',
        },
      });

      console.log(`Handled subscription cancellation for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
    }
  }

  /**
   * Sync all users with active Intel Academy integrations
   * Used for batch sync operations
   */
  static async syncAllUsers(): Promise<void> {
    try {
      const integrations = await prisma.intelAcademyIntegration.findMany({
        where: {
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              subscriptionTier: true,
            },
          },
        },
      });

      console.log(`Syncing ${integrations.length} Intel Academy integrations`);

      const results = await Promise.allSettled(
        integrations.map(async (integration) => {
          const user = integration.user as { id: string; subscriptionTier: string };
          const mappedTier = this.mapSubscriptionTier(user.subscriptionTier);
          
          await IntelAcademyService.syncSubscriptionTier(user.id, mappedTier);
        })
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      console.log(`Sync complete: ${successful} successful, ${failed} failed`);
    } catch (error) {
      console.error('Error syncing all users:', error);
      throw error;
    }
  }
}
