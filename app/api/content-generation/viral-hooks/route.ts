import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { contentGenerationService } from '@/lib/services/content-generation-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { topic, platform, count = 5 } = body;

    // Validate required fields
    if (!topic || !platform) {
      return NextResponse.json(
        { error: 'Topic and platform are required' },
        { status: 400 }
      );
    }

    // Generate viral hooks using AI service
    const hooks = await contentGenerationService.generateViralHooks(
      topic,
      platform,
      count
    );

    // Calculate engagement prediction scores for each hook
    const hooksWithScores = hooks.map((hook, index) => ({
      id: `hook-${index + 1}`,
      hook,
      engagementScore: calculateEngagementScore(hook, platform),
      platform,
    }));

    return NextResponse.json({
      hooks: hooksWithScores,
      topic,
      platform,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Viral hooks generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate viral hooks' },
      { status: 500 }
    );
  }
}

function calculateEngagementScore(hook: string, platform: string): number {
  let score = 60; // Base score

  // Length appropriateness (max +10)
  const length = hook.length;
  if (platform === 'twitter' && length <= 280) {
    score += 10;
  } else if (platform === 'linkedin' && length >= 50 && length <= 150) {
    score += 10;
  } else if (length >= 30 && length <= 200) {
    score += 7;
  }

  // Emotional triggers (max +15)
  const emotionalWords = [
    'secret',
    'shocking',
    'amazing',
    'incredible',
    'mistake',
    'truth',
    'revealed',
    'proven',
    'guaranteed',
  ];
  const emotionalCount = emotionalWords.filter((word) =>
    hook.toLowerCase().includes(word)
  ).length;
  score += Math.min(15, emotionalCount * 5);

  // Questions (max +10)
  if (hook.includes('?')) {
    score += 10;
  }

  // Numbers (max +10)
  if (/\d+/.test(hook)) {
    score += 10;
  }

  // Power words (max +10)
  const powerWords = ['you', 'your', 'free', 'new', 'proven', 'easy', 'simple'];
  const powerWordCount = powerWords.filter((word) =>
    hook.toLowerCase().includes(word)
  ).length;
  score += Math.min(10, powerWordCount * 3);

  // Urgency indicators (max +5)
  const urgencyWords = ['now', 'today', 'limited', 'hurry', 'fast'];
  if (urgencyWords.some((word) => hook.toLowerCase().includes(word))) {
    score += 5;
  }

  return Math.min(100, Math.round(score));
}
