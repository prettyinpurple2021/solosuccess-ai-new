import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/auth';

const AGENT_NAMES: Record<string, string> = {
  roxy: 'Roxy',
  echo: 'Echo',
  blaze: 'Blaze',
  lumi: 'Lumi',
  vex: 'Vex',
  lexi: 'Lexi',
  nova: 'Nova',
};

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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch recent activities from different sources
    const [conversations, missions, content, goals] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { lastMessageAt: 'desc' },
        take: Math.ceil(limit / 4),
        select: {
          id: true,
          agentId: true,
          title: true,
          lastMessageAt: true,
        },
      }),
      prisma.missionControlSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 4),
        select: {
          id: true,
          objective: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.generatedContent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 4),
        select: {
          id: true,
          title: true,
          contentType: true,
          createdAt: true,
        },
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 4),
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Transform and combine activities
    const activities = [
      ...conversations.map(conv => ({
        id: conv.id,
        type: 'conversation' as const,
        title: conv.title || 'Conversation',
        description: `Chat with ${AGENT_NAMES[conv.agentId] || 'AI Agent'}`,
        timestamp: conv.lastMessageAt.toISOString(),
        agentId: conv.agentId,
        agentName: AGENT_NAMES[conv.agentId],
      })),
      ...missions.map(mission => ({
        id: mission.id,
        type: 'mission' as const,
        title: 'Mission Control Session',
        description: mission.objective.substring(0, 100) + (mission.objective.length > 100 ? '...' : ''),
        timestamp: mission.createdAt.toISOString(),
      })),
      ...content.map(item => ({
        id: item.id,
        type: 'content' as const,
        title: item.title || 'Generated Content',
        description: `Created ${item.contentType} content`,
        timestamp: item.createdAt.toISOString(),
      })),
      ...goals.map(goal => ({
        id: goal.id,
        type: 'goal' as const,
        title: goal.title,
        description: `Goal status: ${goal.status}`,
        timestamp: goal.createdAt.toISOString(),
      })),
    ];

    // Sort by timestamp and limit
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedActivities,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recent activity',
        },
      },
      { status: 500 }
    );
  }
}
