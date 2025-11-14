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
    const {
      contentType,
      platform,
      tone,
      length,
      targetAudience,
      keywords,
      brief,
    } = body;

    // Validate required fields
    if (!contentType || !brief) {
      return NextResponse.json(
        { error: 'Content type and brief are required' },
        { status: 400 }
      );
    }

    // Generate content using AI service
    const result = await contentGenerationService.generateContent({
      contentType,
      platform,
      tone,
      length,
      targetAudience,
      keywords,
      brief,
    });

    // Store the generated content in database
    const generatedContent = await prisma.generatedContent.create({
      data: {
        userId: user.id,
        contentType,
        title: result.suggestedTitle || `${contentType} - ${new Date().toLocaleDateString()}`,
        content: result.variations[0].content, // Store the first variation as primary
        status: 'draft',
        metadata: {
          platform,
          tone,
          length,
          targetAudience,
          keywords,
          brief,
          variations: result.variations,
          qualityScore: result.variations[0].qualityScore,
        },
      },
    });

    return NextResponse.json(generatedContent, { status: 201 });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
