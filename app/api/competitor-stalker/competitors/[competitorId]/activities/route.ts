import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';

// GET /api/competitor-stalker/competitors/[competitorId]/activities - Get activities for a competitor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
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

    // Verify ownership of the competitor
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

    // Get activities
    const activities = await prisma.competitorActivity.findMany({
      where: { competitorId: params.competitorId },
      orderBy: { detectedAt: 'desc' },
      take: 50, // Limit to 50 most recent activities
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching competitor activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
