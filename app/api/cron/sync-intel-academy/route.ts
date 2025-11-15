import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionSyncService } from '@/lib/services/subscription-sync.service';
import { addBreadcrumb } from '@/lib/monitoring';

/**
 * GET /api/cron/sync-intel-academy
 * Batch sync all Intel Academy integrations with CRON_SECRET validation
 * Runs daily at 2:00 AM UTC to sync all active integrations
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
        'Invalid CRON_SECRET attempt for sync-intel-academy',
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

    console.log('Starting Intel Academy batch sync cron job');

    // Sync all users with active integrations
    const results = await SubscriptionSyncService.syncAllUsers();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    addBreadcrumb(
      'Intel Academy batch sync completed',
      'cron',
      'info',
      {
        total: results.length,
        successful,
        failed,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Intel Academy sync completed',
      results: {
        total: results.length,
        successful,
        failed,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in Intel Academy sync cron:', error);
    
    addBreadcrumb(
      'Intel Academy batch sync failed',
      'cron',
      'error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
