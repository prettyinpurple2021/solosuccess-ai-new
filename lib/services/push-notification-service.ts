import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@solosuccess.ai',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId: string, subscription: PushSubscriptionData, userAgent?: string) {
    try {
      const pushSubscription = await prisma.pushSubscription.upsert({
        where: {
          endpoint: subscription.endpoint,
        },
        update: {
          keys: subscription.keys,
          userAgent,
          isActive: true,
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent,
          isActive: true,
        },
      });

      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribe(endpoint: string) {
    try {
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: { isActive: false },
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  /**
   * Get user's active push subscriptions
   */
  async getUserSubscriptions(userId: string) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      return subscriptions;
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      throw error;
    }
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(
    userId: string,
    payload: {
      title: string;
      message: string;
      actionUrl?: string;
      priority?: string;
      notificationId?: string;
    }
  ) {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        console.log('No active push subscriptions for user:', userId);
        return;
      }

      const pushPayload = JSON.stringify(payload);

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: sub.keys as any,
              },
              pushPayload
            );
            return { success: true, endpoint: sub.endpoint };
          } catch (error: any) {
            console.error('Error sending push to endpoint:', sub.endpoint, error);

            // If subscription is no longer valid, mark as inactive
            if (error.statusCode === 410 || error.statusCode === 404) {
              await this.unsubscribe(sub.endpoint);
            }

            return { success: false, endpoint: sub.endpoint, error };
          }
        })
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      console.log(`Sent push notifications: ${successful}/${subscriptions.length} successful`);

      return results;
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  /**
   * Send push notification for a specific notification
   */
  async sendNotificationPush(notificationId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        console.error('Notification not found:', notificationId);
        return;
      }

      await this.sendPushNotification(notification.userId, {
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl || undefined,
        priority: notification.priority,
        notificationId: notification.id,
      });
    } catch (error) {
      console.error('Error sending notification push:', error);
    }
  }

  /**
   * Generate VAPID keys (for initial setup)
   */
  static generateVapidKeys() {
    return webpush.generateVAPIDKeys();
  }
}

export const pushNotificationService = new PushNotificationService();
