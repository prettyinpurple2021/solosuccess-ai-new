import { NextRequest, NextResponse } from 'next/server';
import { WebhookQueueService } from '@/lib/services/webhook-queue.service';

/**
 * GET /api/cron/process-webhooks
 * Process pending webhook events from queue
 * Should be called by a cron job (e.g., every minute)
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

    console.log('Starting webhook processing cron job');

    await WebhookQueueService.processPendingEvents(50);

    return NextResponse.json({
      success: true,
      message: 'Webhook processing completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in webhook processing cron:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
