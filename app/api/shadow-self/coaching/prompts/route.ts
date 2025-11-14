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

    const prompts = await CoachingPromptService.getPendingPrompts(session.user.id);

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching coaching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaching prompts' },
      { status: 500 }
    );
  }
}
