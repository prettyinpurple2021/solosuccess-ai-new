import { prisma } from '@/lib/prisma';

/**
 * Service to handle webhook event processing with queue
 */
export class WebhookQueueService {
  /**
   * Add webhook event to processing queue
   */
  static async enqueueEvent(
    source: string,
    eventType: string,
    payload: any,
    signature?: string
  ): Promise<string> {
    try {
      // Store event in database for processing
      const event = await prisma.$executeRaw`
        INSERT INTO webhook_events (id, source, event_type, payload, signature, status, created_at)
        VALUES (gen_random_uuid(), ${source}, ${eventType}, ${JSON.stringify(payload)}::jsonb, ${signature}, 'pending', NOW())
        RETURNING id
      `;

      console.log(`Webhook event enqueued: ${eventType} from ${source}`);
      return event as string;
    } catch (error) {
      console.error('Error enqueuing webhook event:', error);
      throw error;
    }
  }

  /**
   * Process pending webhook events
   */
  static async processPendingEvents(limit: number = 10): Promise<void> {
    try {
      // Get pending events
      const events = await prisma.$queryRaw<any[]>`
        SELECT id, source, event_type, payload, signature, retry_count
        FROM webhook_events
        WHERE status = 'pending' AND retry_count < 3
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      `;

      for (const event of events) {
        try {
          // Mark as processing
          await this.updateEventStatus(event.id, 'processing');

          // Process based on source
          if (event.source === 'intel_academy') {
            await this.processIntelAcademyEvent(event);
          }

          // Mark as completed
          await this.updateEventStatus(event.id, 'completed');
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error);

          // Increment retry count
          await prisma.$executeRaw`
            UPDATE webhook_events
            SET retry_count = retry_count + 1,
                status = CASE WHEN retry_count >= 2 THEN 'failed' ELSE 'pending' END,
                error_message = ${(error as Error).message},
                updated_at = NOW()
            WHERE id = ${event.id}
          `;
        }
      }
    } catch (error) {
      console.error('Error processing pending events:', error);
      throw error;
    }
  }

  /**
   * Update event status
   */
  private static async updateEventStatus(
    eventId: string,
    status: string
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE webhook_events
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${eventId}
    `;
  }

  /**
   * Process Intel Academy webhook event
   */
  private static async processIntelAcademyEvent(event: any): Promise<void> {
    const { event_type, payload } = event;

    // Import handlers dynamically to avoid circular dependencies
    const { handleCourseEnrolled, handleCourseProgressUpdated, handleCourseCompleted, handleAchievementEarned } = await import('../handlers/intel-academy-webhooks');

    switch (event_type) {
      case 'course.enrolled':
        await handleCourseEnrolled(payload);
        break;
      case 'course.progress_updated':
        await handleCourseProgressUpdated(payload);
        break;
      case 'course.completed':
        await handleCourseCompleted(payload);
        break;
      case 'achievement.earned':
        await handleAchievementEarned(payload);
        break;
      default:
        console.log('Unhandled event type:', event_type);
    }
  }

  /**
   * Clean up old processed events
   */
  static async cleanupOldEvents(daysToKeep: number = 30): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM webhook_events
        WHERE status IN ('completed', 'failed')
        AND created_at < NOW() - INTERVAL '${daysToKeep} days'
      `;

      console.log(`Cleaned up webhook events older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up old events:', error);
      throw error;
    }
  }
}
