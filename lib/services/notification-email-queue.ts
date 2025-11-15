import { PrismaClient } from '@prisma/client';
import { emailService } from './email';
import { notificationPreferenceService } from './notification-preference-service';

const prisma = new PrismaClient();

class NotificationEmailQueue {
  /**
   * Send email for a notification if user has email enabled
   */
  async sendNotificationEmail(notificationId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        console.error('Notification not found:', notificationId);
        return;
      }

      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: { email: true },
      });

      if (!user) {
        console.error('User not found:', notification.userId);
        return;
      }

      // Check if email is enabled for this category
      const isEnabled = await notificationPreferenceService.isEnabled(
        notification.userId,
        'email',
        notification.category
      );

      if (!isEnabled) {
        return;
      }

      // Send email based on priority
      if (notification.priority === 'critical' || notification.priority === 'high') {
        await emailService.sendNotificationEmail(
          notification.userId,
          user.email,
          notification.category,
          notification.title,
          notification.message,
          notification.actionUrl || undefined
        );
      }
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }

  /**
   * Send digest emails to users
   */
  async sendDigestEmails() {
    try {
      // Get all users with digest enabled
      const preferences = await prisma.notificationPreference.findMany({
        where: {
          digestEnabled: true,
        },
      });

      for (const pref of preferences) {
        await this.sendUserDigest(pref.userId);
      }
    } catch (error) {
      console.error('Error sending digest emails:', error);
    }
  }

  /**
   * Send digest email to a specific user
   */
  async sendUserDigest(userId: string) {
    try {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        return;
      }

      // Get unread notifications from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          read: false,
          createdAt: {
            gte: yesterday,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      if (notifications.length === 0) {
        return;
      }

      // Send digest
      await emailService.sendDigestEmail(
        userId,
        user.email,
        notifications.map((n) => ({
          title: n.title,
          message: n.message,
          actionUrl: n.actionUrl || undefined,
        }))
      );
    } catch (error) {
      console.error('Error sending user digest:', error);
    }
  }
}

export const notificationEmailQueue = new NotificationEmailQueue();
