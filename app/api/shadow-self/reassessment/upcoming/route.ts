import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReassessmentService } from '@/lib/services/reassessment-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reassessments = await ReassessmentService.getUpcomingReassessments(
      session.user.id
    );

    return NextResponse.json(reassessments);
  } catch (error) {
    console.error('Error fetching upcoming reassessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming reassessments' },
      { status: 500 }
    );
  }
}
