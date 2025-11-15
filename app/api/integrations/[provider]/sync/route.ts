import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { GoogleAnalyticsService } from '@/lib/services/google-analytics-service';
import { StripeSyncService } from '@/lib/services/stripe-sync-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = params;
    const body = await request.json();
    const { startDate, endDate, propertyId } = body;

    let recordsSynced = 0;

    if (provider === 'google_analytics') {
      if (!propertyId) {
        return NextResponse.json(
          { error: 'Property ID is required for Google Analytics' },
          { status: 400 }
        );
      }
      recordsSynced = await GoogleAnalyticsService.syncAnalyticsData(
        session.user.id,
        propertyId,
        startDate || '30daysAgo',
        endDate || 'today'
      );
    } else if (provider === 'stripe') {
      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      recordsSynced = await StripeSyncService.syncStripeData(
        session.user.id,
        start,
        end
      );
    } else {
      return NextResponse.json(
        { error: 'Unsupported provider' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      recordsSynced,
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}
