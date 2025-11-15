import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
        id: sessionId,
        userId: user.id,
      },
    });

    if (!missionSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const shareToken = nanoid(16);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const updatedContext = {
      ...(missionSession.context as any),
      shareToken,
      shareExpiresAt: expiresAt.toISOString(),
    };

    await prisma.missionControlSession.update({
      where: { id: sessionId },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
        id: sessionId,
        userId: user.id,
      },
    });

    if (!missionSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const updatedContext = {
      ...(missionSession.context as any),
    };
    delete updatedContext.shareToken;
    delete updatedContext.shareExpiresAt;

    await prisma.missionControlSession.update({
      where: { id: sessionId },
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
