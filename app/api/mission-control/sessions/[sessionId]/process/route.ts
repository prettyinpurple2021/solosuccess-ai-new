import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orchestrateMissionControl } from '@/lib/services/mission-control-orchestrator';

// POST /api/mission-control/sessions/[sessionId]/process - Process a mission control session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await prisma.missionControlSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Session is not in progress' },
        { status: 400 }
      );
    }

    // Process the mission control session asynchronously
    orchestrateMissionControl(session)
      .then(async (results) => {
        await prisma.missionControlSession.update({
          where: { id: session.id },
          data: {
            status: 'completed',
            results,
            completedAt: new Date(),
          },
        });
      })
      .catch(async (error) => {
        console.error('Error processing mission control session:', error);
        await prisma.missionControlSession.update({
          where: { id: session.id },
          data: {
            status: 'failed',
            results: {
              error: error.message || 'Failed to process mission',
            },
          },
        });
      });

    return NextResponse.json({ success: true, message: 'Processing started' });
  } catch (error) {
    console.error('Error starting mission control processing:', error);
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    );
  }
}
