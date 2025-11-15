import { PrismaClient } from '@prisma/client';
import { notificationEmailQueue } from './notification-email-queue';
import { pushNotificationService } from './push-notification-service';
import { notificationPreferenceService } from './notification-preference-service';

const prisma = new PrismaClient();

export type NotificationType =
  | 'agent_response'
  | 'mission_control_complete'
  | 'competitor_alert'
  | 'insight_nudge'
  | 'subscription_change'
  | 'subscription_sync'
  | 'subscription_sync_error'
  | 'security_alert'
  | 'document_ready'
  | 'content_generated'
  | 'intel_academy_connected'
  | 'intel_academy_disconnected'
  | 'intel_academy_achievement'
  | 'intel_academy_course_complete'
  | 'system';

export type NotificationCategory =
  | 'ai_agents'
  | 'mission_control'
  | 'competitor_intelligence'
  | 'insights'
  | 'billing'
  | 'security'
  | 'documents'
  | 'content'
  | 'integration'
  | 'learning'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  priority?: NotificationPriority;
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          category: data.category,
          title: data.title,
          message: data.message,
          data: data.data || {},
          actionUrl: data.actionUrl,
          priority: data.priority || 'medium',
        },
      });

      // Send email notification if enabled and priority is high/critical
      if (data.priority === 'high' || data.priority === 'critical') {
        const emailEnabled = await notificationPreferenceService.isEnabled(
          data.userId,
          'email',
          data.category
        );

        if (emailEnabled) {
          notificationEmailQueue.sendNotificationEmail(notification.id).catch((error) => {
            console.error('Error sending notification email:', error);
          });
        }
      }

      // Send push notification if enabled
      const pushEnabled = await notificationPreferenceService.isEnabled(
        data.userId,
        'push',
        data.category
      );

      if (pushEnabled) {
        pushNotificationService.sendNotificationPush(notification.id).catch((error) => {
          console.error('Error sending push notification:', error);
        });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      category?: NotificationCategory;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const where: any = { userId };

      if (options?.unreadOnly) {
        where.read = false;
      }

      if (options?.category) {
        where.category = options.category;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId,
        },
      });

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete old read notifications (cleanup)
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await prisma.notification.deleteMany({
        where: {
          read: true,
          readAt: {
            lt: cutoffDate,
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }

  /**
   * Helper methods for creating specific notification types
   */

  async notifyAgentResponse(userId: string, agentName: string, conversationId: string) {
    return this.createNotification({
      userId,
      type: 'agent_response',
      category: 'ai_agents',
      title: `${agentName} responded`,
      message: `${agentName} has replied to your message`,
      actionUrl: `/agents/${conversationId}`,
      priority: 'medium',
    });
  }

  async notifyMissionControlComplete(userId: string, sessionId: string, objective: string) {
    return this.createNotification({
      userId,
      type: 'mission_control_complete',
      category: 'mission_control',
      title: 'Mission Control Complete',
      message: `Your mission "${objective}" has been completed`,
      actionUrl: `/mission-control/${sessionId}`,
      priority: 'high',
    });
  }

  async notifyCompetitorAlert(
    userId: string,
    competitorName: string,
    activityTitle: string,
    importance: string
  ) {
    return this.createNotification({
      userId,
      type: 'competitor_alert',
      category: 'competitor_intelligence',
      title: `Competitor Alert: ${competitorName}`,
      message: activityTitle,
      actionUrl: '/competitor-stalker/dashboard',
      priority: importance === 'critical' ? 'critical' : importance === 'high' ? 'high' : 'medium',
    });
  }

  async notifyInsight(userId: string, insightTitle: string, insightId: string) {
    return this.createNotification({
      userId,
      type: 'insight_nudge',
      category: 'insights',
      title: 'New Insight Available',
      message: insightTitle,
      actionUrl: '/analytics',
      priority: 'medium',
      data: { insightId },
    });
  }

  async notifySubscriptionChange(userId: string, planName: string, action: string) {
    return this.createNotification({
      userId,
      type: 'subscription_change',
      category: 'billing',
      title: 'Subscription Updated',
      message: `Your subscription has been ${action} to ${planName}`,
      actionUrl: '/settings/billing',
      priority: 'high',
    });
  }

  async notifySecurityAlert(userId: string, message: string) {
    return this.createNotification({
      userId,
      type: 'security_alert',
      category: 'security',
      title: 'Security Alert',
      message,
      actionUrl: '/settings/security',
      priority: 'critical',
    });
  }

  async notifyDocumentReady(userId: string, documentTitle: string, documentId: string) {
    return this.createNotification({
      userId,
      type: 'document_ready',
      category: 'documents',
      title: 'Document Ready',
      message: `Your document "${documentTitle}" is ready`,
      actionUrl: `/documents/${documentId}`,
      priority: 'medium',
    });
  }

  async notifyContentGenerated(userId: string, contentType: string, contentId: string) {
    return this.createNotification({
      userId,
      type: 'content_generated',
      category: 'content',
      title: 'Content Generated',
      message: `Your ${contentType} content is ready`,
      actionUrl: `/content-generation/library`,
      priority: 'medium',
      data: { contentId },
    });
  }

  async notifyIntelAcademyConnected(userId: string) {
    return this.createNotification({
      userId,
      type: 'intel_academy_connected',
      category: 'integration',
      title: 'Intel Academy Connected',
      message: 'Your Intel Academy account has been successfully connected',
      actionUrl: '/dashboard',
      priority: 'medium',
    });
  }

  async notifyIntelAcademyDisconnected(userId: string, reason?: string) {
    return this.createNotification({
      userId,
      type: 'intel_academy_disconnected',
      category: 'integration',
      title: 'Intel Academy Disconnected',
      message: reason || 'Your Intel Academy connection has been disconnected',
      actionUrl: '/dashboard',
      priority: 'high',
    });
  }

  async notifyIntelAcademyAchievement(
    userId: string,
    achievementName: string,
    achievementId: string
  ) {
    return this.createNotification({
      userId,
      type: 'intel_academy_achievement',
      category: 'learning',
      title: 'Achievement Earned! 🏆',
      message: `Congratulations! You earned "${achievementName}" in Intel Academy`,
      actionUrl: '/dashboard',
      priority: 'medium',
      data: { achievementId },
    });
  }

  async notifyIntelAcademyCourseComplete(
    userId: string,
    courseName: string,
    courseId: string
  ) {
    return this.createNotification({
      userId,
      type: 'intel_academy_course_complete',
      category: 'learning',
      title: 'Course Completed! 🎓',
      message: `Congratulations! You completed "${courseName}"`,
      actionUrl: '/dashboard',
      priority: 'medium',
      data: { courseId },
    });
  }
}

export const notificationService = new NotificationService();
