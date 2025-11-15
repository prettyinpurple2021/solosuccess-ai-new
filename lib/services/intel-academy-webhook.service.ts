import { prisma } from '@/lib/prisma';
import { verifyHmac } from '@/lib/security/encryption';
import { notificationService } from './notification-service';

const INTEL_ACADEMY_WEBHOOK_SECRET = process.env.INTEL_ACADEMY_WEBHOOK_SECRET || '';

export interface WebhookEventPayload {
  userId: string;
  [key: string]: any;
}

export interface CourseEnrolledPayload extends WebhookEventPayload {
  courseId: string;
  courseName: string;
  courseDescription?: string;
  thumbnailUrl?: string;
  enrollmentDate: string;
}

export interface ProgressUpdatedPayload extends WebhookEventPayload {
  courseId: string;
  progress: number;
  lastAccessedAt: string;
}

export interface CourseCompletedPayload extends WebhookEventPayload {
  courseId: string;
  completionDate: string;
}

export interface AchievementEarnedPayload extends WebhookEventPayload {
  achievementId: string;
  achievementName: string;
  achievementType: string;
  description?: string;
  badgeUrl?: string;
  earnedAt: string;
}

export interface ProcessResult {
  processed: number;
  failed: number;
  errors: Array<{ eventId: string; error: string }>;
}

/**
 * Service to handle Intel Academy webhook events
 */
export class WebhookService {
  /**
   * Verify HMAC SHA-256 signature for webhook
   */
  static verifySignature(payload: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    try {
      return verifyHmac(payload, signature, INTEL_ACADEMY_WEBHOOK_SECRET);
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Store webhook event in database queue
   */
  static async storeEvent(
    source: string,
    eventType: string,
    payload: any,
    signature?: string
  ): Promise<string> {
    try {
      const event = await prisma.webhookEvent.create({
        data: {
          source,
          eventType,
          payload,
          signature,
          status: 'pending',
          retryCount: 0,
        },
      });

      console.log(`Webhook event stored: ${eventType} from ${source} (ID: ${event.id})`);
      return event.id;
    } catch (error) {
      console.error('Error storing webhook event:', error);
      throw error;
    }
  }

  /**
   * Process a single webhook event
   */
  static async processEvent(eventId: string): Promise<void> {
    const event = await prisma.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error(`Webhook event ${eventId} not found`);
    }

    if (event.status === 'processed') {
      console.log(`Event ${eventId} already processed, skipping`);
      return;
    }

    try {
      // Mark as processing
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'processing' },
      });

      // Process based on event type
      switch (event.eventType) {
        case 'course.enrolled':
          await this.handleCourseEnrolled(event.payload as CourseEnrolledPayload);
          break;
        case 'course.progress_updated':
          await this.handleProgressUpdated(event.payload as ProgressUpdatedPayload);
          break;
        case 'course.completed':
          await this.handleCourseCompleted(event.payload as CourseCompletedPayload);
          break;
        case 'achievement.earned':
          await this.handleAchievementEarned(event.payload as AchievementEarnedPayload);
          break;
        default:
          console.log(`Unhandled event type: ${event.eventType}`);
      }

      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });

      console.log(`Successfully processed event ${eventId}`);
    } catch (error) {
      console.error(`Error processing event ${eventId}:`, error);

      // Increment retry count
      const newRetryCount = event.retryCount + 1;
      const status = newRetryCount >= 3 ? 'failed' : 'pending';

      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: {
          status,
          retryCount: newRetryCount,
          errorMessage: (error as Error).message,
        },
      });

      throw error;
    }
  }

  /**
   * Handle course.enrolled event
   */
  private static async handleCourseEnrolled(payload: CourseEnrolledPayload): Promise<void> {
    const { userId, courseId, courseName, courseDescription, thumbnailUrl, enrollmentDate } = payload;

    await prisma.intelAcademyCourse.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: {
        userId,
        courseId,
        courseName,
        courseDescription,
        thumbnailUrl,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        progress: 0,
        status: 'in_progress',
        lastAccessedAt: new Date(),
      },
      update: {
        courseName,
        courseDescription,
        thumbnailUrl,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
        lastAccessedAt: new Date(),
      },
    });

    console.log(`Course enrolled: ${courseName} for user ${userId}`);
  }

  /**
   * Handle course.progress_updated event
   */
  private static async handleProgressUpdated(payload: ProgressUpdatedPayload): Promise<void> {
    const { userId, courseId, progress, lastAccessedAt } = payload;

    await prisma.intelAcademyCourse.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        progress,
        lastAccessedAt: lastAccessedAt ? new Date(lastAccessedAt) : new Date(),
        status: progress >= 100 ? 'completed' : 'in_progress',
      },
    });

    console.log(`Course progress updated: ${courseId} for user ${userId} - ${progress}%`);
  }

  /**
   * Handle course.completed event
   */
  private static async handleCourseCompleted(payload: CourseCompletedPayload): Promise<void> {
    const { userId, courseId, completionDate } = payload;

    await prisma.intelAcademyCourse.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        status: 'completed',
        progress: 100,
        completionDate: completionDate ? new Date(completionDate) : new Date(),
        lastAccessedAt: new Date(),
      },
    });

    // Send notification
    const course = await prisma.intelAcademyCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (course) {
      await notificationService.notifyIntelAcademyCourseComplete(
        userId,
        course.courseName,
        courseId
      );
    }

    console.log(`Course completed: ${courseId} for user ${userId}`);
  }

  /**
   * Handle achievement.earned event
   */
  private static async handleAchievementEarned(payload: AchievementEarnedPayload): Promise<void> {
    const { userId, achievementId, achievementName, achievementType, description, badgeUrl, earnedAt } = payload;

    await prisma.intelAcademyAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId },
      },
      create: {
        userId,
        achievementId,
        achievementName,
        achievementType,
        description,
        badgeUrl,
        earnedAt: earnedAt ? new Date(earnedAt) : new Date(),
      },
      update: {
        achievementName,
        achievementType,
        description,
        badgeUrl,
      },
    });

    // Send notification
    await notificationService.notifyIntelAcademyAchievement(
      userId,
      achievementName,
      achievementId
    );

    console.log(`Achievement earned: ${achievementName} for user ${userId}`);
  }

  /**
   * Process pending webhook events in batch
   */
  static async processPendingEvents(limit: number = 50): Promise<ProcessResult> {
    const events = await prisma.webhookEvent.findMany({
      where: {
        status: 'pending',
        retryCount: { lt: 3 },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    console.log(`Processing ${events.length} pending webhook events`);

    const results = await Promise.allSettled(
      events.map(event => this.processEvent(event.id))
    );

    const processed = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const errors = results
      .map((r, i) => ({
        eventId: events[i].id,
        error: r.status === 'rejected' ? r.reason?.message : null,
      }))
      .filter(e => e.error !== null);

    console.log(`Batch processing complete: ${processed} processed, ${failed} failed`);

    return { processed, failed, errors };
  }

  /**
   * Clean up old processed events
   */
  static async cleanupOldEvents(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.webhookEvent.deleteMany({
      where: {
        status: {
          in: ['processed', 'failed'],
        },
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} webhook events older than ${daysOld} days`);
    return result.count;
  }
}
