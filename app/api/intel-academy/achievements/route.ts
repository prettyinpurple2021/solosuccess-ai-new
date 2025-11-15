import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/intel-academy/achievements
 * Get user's Intel Academy achievements
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const achievements = await prisma.intelAcademyAchievement.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      achievements,
    });
  } catch (error) {
    console.error('Error fetching Intel Academy achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
