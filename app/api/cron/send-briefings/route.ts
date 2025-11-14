import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { intelligenceBriefingService } from '@/lib/services/intelligence-briefing';
import { emailService } from '@/lib/services/email';

// POST /api/cron/send-briefings - Scheduled job to send daily intelligence briefings
// This should be called by a cron service daily
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily briefing delivery...');

    // Get all users with active subscriptions (Accelerator or Premium)
    const users = await prisma.user.findMany({
      where: {
        subscriptionTier: {
          in: ['accelerator', 'premium'],
        },
        subscriptionStatus: 'active',
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            preferences: true,
          },
        },
      },
    });

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if user has briefing emails enabled in preferences
        const preferences = (user.profile?.preferences as any) || {};
        if (preferences.emailBriefings === false) {
          continue;
        }

        // Generate daily briefing
        const briefing = await intelligenceBriefingService.generateDailyBriefing(user.id);

        // Skip if no activities
        if (briefing.totalActivities === 0) {
          continue;
        }

        // Format as email
        const html = intelligenceBriefingService.formatAsHtmlEmail(briefing);
        const text = intelligenceBriefingService.formatAsPlainText(briefing);

        // Send email
        const sent = await emailService.sendIntelligenceBriefing(
          user.email,
          html,
          text,
          'Daily'
        );

        if (sent) {
          sentCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error sending briefing to user ${user.id}:`, error);
        errorCount++;
      }
    }

    console.log('Daily briefing delivery completed:', { sentCount, errorCount });

    return NextResponse.json({
      success: true,
      sentCount,
      errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in scheduled briefing delivery:', error);
    return NextResponse.json(
      {
        error: 'Failed to send briefings',
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
    endpoint: 'briefing-delivery-cron',
    timestamp: new Date().toISOString(),
  });
}
