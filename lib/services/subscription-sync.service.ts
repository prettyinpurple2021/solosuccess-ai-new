import { prisma } from '@/lib/prisma';
import { IntelAcademyService } from './intel-academy.service';

export interface SyncResult {
  userId: string;
  success: boolean;
  error?: string;
}

/**
 * Service to handle subscription tier synchronization across platforms
 */
export class SubscriptionSyncService {
  /**
   * Map SoloSuccess AI subscription tiers to Intel Academy access levels
   */
  static mapTierToAccessLevel(tier: string): string {
    const tierMapping: Record<string, string> = {
      free: 'basic',
      accelerator: 'premium',
      premium: 'enterprise',
    };

    return tierMapping[tier.toLowerCase()] || 'basic';
  }

  /**
   * Retry with exponential backoff
   */
  private static async retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Sync subscription tier change with Intel Academy with exponential backoff retry
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
      const mappedTier = this.mapTierToAccessLevel(newTier);

      // Sync with Intel Academy with retry logic
      await this.retryWithExponentialBackoff(async () => {
        await IntelAcademyService.syncSubscriptionTier(userId, mappedTier);
      }, 3, 1000);

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
   * Provision access for new subscription with Intel Academy API
   */
  static async provisionAccess(userId: string, tier: string): Promise<void> {
    try {
      const integration = await IntelAcademyService.getIntegration(userId);

      if (!integration || !integration.isActive) {
        console.log(`Intel Academy not connected for user ${userId}, skipping provision`);
        return;
      }

      const mappedTier = this.mapTierToAccessLevel(tier);

      // Sync tier with retry logic
      await this.retryWithExponentialBackoff(async () => {
        await IntelAcademyService.syncSubscriptionTier(userId, mappedTier);
      }, 3, 1000);

      // Update integration status
      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'synced',
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
        console.log(`Intel Academy not connected for user ${userId}, skipping cancellation`);
        return;
      }

      // Downgrade to free tier (basic access level)
      await this.retryWithExponentialBackoff(async () => {
        await IntelAcademyService.syncSubscriptionTier(userId, 'basic');
      }, 3, 1000);

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
      // Don't throw - cancellation should succeed even if sync fails
    }
  }

  /**
   * Sync all users with active Intel Academy integrations
   * Used for batch sync operations
   */
  static async syncAllUsers(): Promise<SyncResult[]> {
    try {
      const integrations = await prisma.intelAcademyIntegration.findMany({
        where: {
          isActive: true,
        },
        select: {
          userId: true,
        },
      });

      console.log(`Starting batch sync for ${integrations.length} Intel Academy integrations`);

      const results = await Promise.allSettled(
        integrations.map(async (integration) => {
          const user = await prisma.user.findUnique({
            where: { id: integration.userId },
            select: { id: true, subscriptionTier: true },
          });

          if (!user) {
            throw new Error(`User ${integration.userId} not found`);
          }

          const mappedTier = this.mapTierToAccessLevel(user.subscriptionTier);
          
          // Use retry logic for each user sync
          await this.retryWithExponentialBackoff(async () => {
            await IntelAcademyService.syncSubscriptionTier(user.id, mappedTier);
          }, 3, 1000);

          return { userId: user.id, success: true };
        })
      );

      const syncResults: SyncResult[] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            userId: integrations[index].userId,
            success: false,
            error: result.reason?.message || 'Unknown error',
          };
        }
      });

      const successful = syncResults.filter((r) => r.success).length;
      const failed = syncResults.filter((r) => !r.success).length;

      console.log(`Batch sync complete: ${successful} successful, ${failed} failed`);

      return syncResults;
    } catch (error) {
      console.error('Error syncing all users:', error);
      throw error;
    }
  }
}
