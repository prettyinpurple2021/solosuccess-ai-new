import { NextRequest, NextResponse } from 'next/server';
import { competitorTrackerService } from '@/lib/services/competitor-tracker';

// POST /api/cron/track-competitors - Scheduled job to track all active competitors
// This should be called by a cron service (e.g., Vercel Cron, GitHub Actions, etc.)
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (e.g., cron secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled competitor tracking...');

    const results = await competitorTrackerService.trackAllActiveCompetitors();

    console.log('Competitor tracking completed:', results);

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in scheduled competitor tracking:', error);
    return NextResponse.json(
      {
        error: 'Failed to track competitors',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'competitor-tracking-cron',
    timestamp: new Date().toISOString(),
  });
}
