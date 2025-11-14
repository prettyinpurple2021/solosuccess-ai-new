import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createSessionSchema = z.object({
  objective: z.string().min(10, 'Objective must be at least 10 characters'),
  agentsInvolved: z.array(z.string()).optional(),
  context: z.object({
    businessType: z.string().optional(),
    timeline: z.string().optional(),
    constraints: z.array(z.string()).optional(),
  }).optional(),
});

// GET /api/mission-control/sessions - Get all sessions for the current user
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

    const sessions = await prisma.missionControlSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching mission control sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/mission-control/sessions - Create a new session
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

    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    // Auto-select agents if not provided
    let agentsInvolved = validatedData.agentsInvolved || [];
    if (agentsInvolved.length === 0) {
      // Default to all agents for comprehensive analysis
      agentsInvolved = ['roxy', 'echo', 'blaze', 'lumi', 'vex', 'lexi', 'nova'];
    }

    // Create the session
    const missionSession = await prisma.missionControlSession.create({
      data: {
        userId: user.id,
        objective: validatedData.objective,
        agentsInvolved,
        context: validatedData.context || {},
        status: 'in_progress',
      },
    });

    // Trigger AI processing asynchronously (don't await)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mission-control/sessions/${missionSession.id}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Error triggering mission control processing:', error);
    });

    return NextResponse.json(missionSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating mission control session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
