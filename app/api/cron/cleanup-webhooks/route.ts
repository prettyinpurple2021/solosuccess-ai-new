import { NextRequest, NextResponse } from 'next/server';
import { WebhookQueueService } from '@/lib/services/webhook-queue.service';

/**
 * GET /api/cron/cleanup-webhooks
 * Clean up old processed webhook events
 * Should be called by a cron job (e.g., daily)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting webhook cleanup cron job');

    await WebhookQueueService.cleanupOldEvents(30);

    return NextResponse.json({
      success: true,
      message: 'Webhook cleanup completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in webhook cleanup cron:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
