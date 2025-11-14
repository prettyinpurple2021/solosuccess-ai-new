import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { competitorTrackerService } from '@/lib/services/competitor-tracker';

// POST /api/competitor-stalker/track - Manually trigger tracking for user's competitors
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription tier
    if (user.subscriptionTier === 'free') {
      return NextResponse.json(
        { error: 'Competitor tracking requires an Accelerator or Premium subscription' },
        { status: 403 }
      );
    }

    // Get competitorId from request body if provided
    const body = await request.json().catch(() => ({}));
    const { competitorId } = body;

    let results;

    if (competitorId) {
      // Track single competitor
      const competitor = await prisma.competitorProfile.findFirst({
        where: {
          id: competitorId,
          userId: user.id,
        },
      });

      if (!competitor) {
        return NextResponse.json(
          { error: 'Competitor not found' },
          { status: 404 }
        );
      }

      const result = await competitorTrackerService.trackCompetitor(competitorId);
      results = [result];
    } else {
      // Track all competitors for this user
      results = await competitorTrackerService.trackAllCompetitors(user.id);
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalTracked: results.length,
        totalActivities: results.reduce((sum, r) => sum + r.activitiesDetected, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      },
    });
  } catch (error) {
    console.error('Error tracking competitors:', error);
    return NextResponse.json(
      { error: 'Failed to track competitors' },
      { status: 500 }
    );
  }
}
