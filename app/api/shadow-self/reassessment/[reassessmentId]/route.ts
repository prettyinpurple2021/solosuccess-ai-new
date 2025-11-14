import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reassessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reassessmentId } = await params;
    const reassessment = await prisma.shadowSelfReassessment.findFirst({
      where: {
        id: reassessmentId,
        userId: session.user.id,
      },
    });

    if (!reassessment) {
      return NextResponse.json({ error: 'Reassessment not found' }, { status: 404 });
    }

    if (!reassessment.completedAt) {
      return NextResponse.json(
        { error: 'Reassessment not completed yet' },
        { status: 400 }
      );
    }

    return NextResponse.json(reassessment.comparisonData);
  } catch (error) {
    console.error('Error fetching reassessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reassessment' },
      { status: 500 }
    );
  }
}
