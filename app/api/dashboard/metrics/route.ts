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

    // Fetch metrics in parallel
    const [
      totalConversations,
      activeGoals,
      completedMissions,
      generatedContent,
      user,
      recentActivity
    ] = await Promise.all([
      prisma.conversation.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'active' } }),
      prisma.missionControlSession.count({ 
        where: { userId, status: 'completed' } 
      }),
      prisma.generatedContent.count({ where: { userId } }),
      prisma.user.findUnique({ 
        where: { id: userId },
        select: { subscriptionTier: true }
      }),
      prisma.conversation.count({
        where: {
          userId,
          lastMessageAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    const metrics = {
      totalConversations,
      activeGoals,
      completedMissions,
      generatedContent,
      weeklyActivity: recentActivity,
      subscriptionTier: user?.subscriptionTier || 'free',
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard metrics',
        },
      },
      { status: 500 }
    );
  }
}
