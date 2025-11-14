import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query filters
    const where: any = { userId };
    if (agentId) {
      where.agentId = agentId;
    }

    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: 50 // Limit to 50 most recent conversations
    });

    return NextResponse.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentId, title } = body;

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'User ID and Agent ID are required' },
        { status: 400 }
      );
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        agentId,
        title: title || `Chat with ${agentId}`,
        messages: [],
        lastMessageAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
