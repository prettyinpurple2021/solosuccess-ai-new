import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';

// GET /api/competitor-stalker/activities - Get all recent activities for user's competitors
export async function GET(request: NextRequest) {
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

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get all competitor IDs for this user
    const competitors = await prisma.competitorProfile.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const competitorIds = competitors.map(c => c.id);

    if (competitorIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get recent activities across all competitors
    const activities = await prisma.competitorActivity.findMany({
      where: {
        competitorId: { in: competitorIds },
      },
      orderBy: { detectedAt: 'desc' },
      take: limit,
      include: {
        competitor: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
