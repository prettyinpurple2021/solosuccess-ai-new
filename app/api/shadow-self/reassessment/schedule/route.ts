import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReassessmentService } from '@/lib/services/reassessment-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { previousAssessmentId, scheduledDate } = body;

    if (!previousAssessmentId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reassessment = await ReassessmentService.scheduleReassessment(
      session.user.id,
      previousAssessmentId,
      new Date(scheduledDate)
    );

    return NextResponse.json(reassessment, { status: 201 });
  } catch (error) {
    console.error('Error scheduling reassessment:', error);
    return NextResponse.json(
      { error: 'Failed to schedule reassessment' },
      { status: 500 }
    );
  }
}
