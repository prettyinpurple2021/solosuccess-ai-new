import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CoachingPromptService } from '@/lib/services/coaching-prompt-service';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptId } = await params;
    const body = await request.json();
    const { response } = body;

    if (!response || typeof response !== 'string') {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    // Verify prompt belongs to user's assessment
    const prompt = await prisma.shadowSelfCoachingPrompt.findUnique({
      where: { id: promptId },
      include: {
        assessment: true,
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (prompt.assessment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (prompt.completedAt) {
      return NextResponse.json(
        { error: 'Prompt already completed' },
        { status: 400 }
      );
    }

    // Complete the prompt
    const completedPrompt = await CoachingPromptService.completePrompt(
      promptId,
      response
    );

    return NextResponse.json(completedPrompt);
  } catch (error) {
    console.error('Error completing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to complete prompt' },
      { status: 500 }
    );
  }
}
