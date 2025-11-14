import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CoachingPromptService } from '@/lib/services/coaching-prompt-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await CoachingPromptService.getProgressMetrics(session.user.id);

    if (!metrics) {
      return NextResponse.json({
        totalPrompts: 0,
        completedPrompts: 0,
        completionRate: 0,
        lastCompletedAt: null,
      });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching progress metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress metrics' },
      { status: 500 }
    );
  }
}
