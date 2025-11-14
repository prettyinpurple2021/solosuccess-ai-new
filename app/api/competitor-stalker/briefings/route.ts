import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { intelligenceBriefingService } from '@/lib/services/intelligence-briefing';

// GET /api/competitor-stalker/briefings - Get intelligence briefing
export async function GET(request: NextRequest) {
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

    // Check subscription tier
    if (user.subscriptionTier === 'free') {
      return NextResponse.json(
        { error: 'Intelligence briefings require an Accelerator or Premium subscription' },
        { status: 403 }
      );
    }

    // Get period from query params (daily or weekly)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const format = searchParams.get('format') || 'json'; // json, html, or text

    let briefing;
    if (period === 'weekly') {
      briefing = await intelligenceBriefingService.generateWeeklyBriefing(user.id);
    } else {
      briefing = await intelligenceBriefingService.generateDailyBriefing(user.id);
    }

    // Return in requested format
    if (format === 'html') {
      const html = intelligenceBriefingService.formatAsHtmlEmail(briefing);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else if (format === 'text') {
      const text = intelligenceBriefingService.formatAsPlainText(briefing);
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    return NextResponse.json(briefing);
  } catch (error) {
    console.error('Error generating briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
