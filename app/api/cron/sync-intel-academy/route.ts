import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionSyncService } from '@/lib/services/subscription-sync.service';

/**
 * GET /api/cron/sync-intel-academy
 * Periodic sync of all Intel Academy integrations
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

    console.log('Starting Intel Academy sync cron job');

    await SubscriptionSyncService.syncAllUsers();

    return NextResponse.json({
      success: true,
      message: 'Intel Academy sync completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in Intel Academy sync cron:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
