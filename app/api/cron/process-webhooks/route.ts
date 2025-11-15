import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/intel-academy-webhook.service';
import { addBreadcrumb } from '@/lib/monitoring';

/**
 * GET /api/cron/process-webhooks
 * Process pending webhook events from queue with CRON_SECRET validation
 * Runs every 1 minute to process up to 50 events per run
 */
export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET in authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      // Log security event for invalid cron secret
      const sourceIp = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      
      addBreadcrumb(
        'Invalid CRON_SECRET attempt for process-webhooks',
        'security',
        'error',
        {
          sourceIp,
          timestamp: new Date().toISOString(),
        }
      );

      console.error('Unauthorized cron access attempt from IP:', sourceIp);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting webhook processing cron job');

    // Process up to 50 pending events
    const result = await WebhookService.processPendingEvents(50);

    addBreadcrumb(
      'Webhook processing cron completed',
      'cron',
      'info',
      {
        processed: result.processed,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Webhook processing completed',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in webhook processing cron:', error);
    
    addBreadcrumb(
      'Webhook processing cron failed',
      'cron',
      'error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
