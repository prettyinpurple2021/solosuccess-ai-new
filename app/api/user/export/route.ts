import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Fetch all user data
    const [user, profile, conversations, missions, content, goals, competitors, businessPlans] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
      }),
      prisma.conversation.findMany({
        where: { userId },
      }),
      prisma.missionControlSession.findMany({
        where: { userId },
      }),
      prisma.generatedContent.findMany({
        where: { userId },
      }),
      prisma.goal.findMany({
        where: { userId },
      }),
      prisma.competitorProfile.findMany({
        where: { userId },
        include: {
          activities: true,
        },
      }),
      prisma.businessPlan.findMany({
        where: { userId },
        include: {
          goals: true,
        },
      }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      profile,
      conversations,
      missionControlSessions: missions,
      generatedContent: content,
      goals,
      competitorProfiles: competitors,
      businessPlans,
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="solosuccess-data-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export user data',
        },
      },
      { status: 500 }
    );
  }
}
