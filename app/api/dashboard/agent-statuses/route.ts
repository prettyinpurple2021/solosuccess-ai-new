import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/auth';

const AGENTS = [
  {
    id: 'roxy',
    name: 'Roxy',
    personality: 'Strategic Operator',
    avatar: '/agents/roxy.png',
  },
  {
    id: 'echo',
    name: 'Echo',
    personality: 'Growth Catalyst',
    avatar: '/agents/echo.png',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    personality: 'Growth & Sales Strategist',
    avatar: '/agents/blaze.png',
  },
  {
    id: 'lumi',
    name: 'Lumi',
    personality: 'Legal & Docs Agent',
    avatar: '/agents/lumi.png',
  },
  {
    id: 'vex',
    name: 'Vex',
    personality: 'Technical Architect',
    avatar: '/agents/vex.png',
  },
  {
    id: 'lexi',
    name: 'Lexi',
    personality: 'Insight Engine',
    avatar: '/agents/lexi.png',
  },
  {
    id: 'nova',
    name: 'Nova',
    personality: 'Product Designer',
    avatar: '/agents/nova.png',
  },
];

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

    // Get conversation counts and last interactions for each agent
    const agentStatuses = await Promise.all(
      AGENTS.map(async (agent) => {
        const [conversationCount, lastConversation] = await Promise.all([
          prisma.conversation.count({
            where: { userId, agentId: agent.id },
          }),
          prisma.conversation.findFirst({
            where: { userId, agentId: agent.id },
            orderBy: { lastMessageAt: 'desc' },
            select: { lastMessageAt: true },
          }),
        ]);

        // Determine status based on last interaction
        let status: 'available' | 'busy' | 'offline' = 'available';
        if (lastConversation) {
          const hoursSinceLastInteraction = 
            (Date.now() - lastConversation.lastMessageAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastInteraction < 1) {
            status = 'busy';
          } else if (hoursSinceLastInteraction > 24) {
            status = 'offline';
          }
        }

        return {
          ...agent,
          status,
          lastInteraction: lastConversation?.lastMessageAt.toISOString(),
          conversationCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: agentStatuses,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error fetching agent statuses:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch agent statuses',
        },
      },
      { status: 500 }
    );
  }
}
