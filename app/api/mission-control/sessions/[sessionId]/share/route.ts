import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// POST /api/mission-control/sessions/[sessionId]/share - Create a shareable link
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    const missionSession = await prisma.missionControlSession.findFirst({
      where: {
        id: params.sessionId,
        userId: user.id,
      },
    });

    if (!missionSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Generate a unique share token
    const shareToken = nanoid(16);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Store share token in session metadata
    const updatedContext = {
      ...(missionSession.context as any),
      shareToken,
      shareExpiresAt: expiresAt.toISOString(),
    };

    await prisma.missionControlSession.update({
      where: { id: params.sessionId },
      data: { context: updatedContext },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mission-control/shared/${shareToken}`;

    return NextResponse.json({
      shareUrl,
      shareToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// DELETE /api/mission-control/sessions/[sessionId]/share - Revoke share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    const missionSession = await prisma.missionControlSession.findFirst({
      where: {
        id: params.sessionId,
        userId: user.id,
      },
    });

    if (!missionSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Remove share token from session metadata
    const updatedContext = {
      ...(missionSession.context as any),
    };
    delete updatedContext.shareToken;
    delete updatedContext.shareExpiresAt;

    await prisma.missionControlSession.update({
      where: { id: params.sessionId },
      data: { context: updatedContext },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking share link:', error);
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    );
  }
}
