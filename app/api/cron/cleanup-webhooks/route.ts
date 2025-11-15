import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/services/intel-academy-webhook.service';
import { addBreadcrumb } from '@/lib/monitoring';

/**
 * GET /api/cron/cleanup-webhooks
 * Clean up old processed webhook events with CRON_SECRET validation
 * Runs daily at 3:00 AM UTC to delete events older than 30 days
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
        'Invalid CRON_SECRET attempt for cleanup-webhooks',
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

    console.log('Starting webhook cleanup cron job');

    // Delete events older than 30 days
    const deletedCount = await WebhookService.cleanupOldEvents(30);

    addBreadcrumb(
      'Webhook cleanup completed',
      'cron',
      'info',
      {
        deletedCount,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Webhook cleanup completed',
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in webhook cleanup cron:', error);
    
    addBreadcrumb(
      'Webhook cleanup failed',
      'cron',
      'error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
