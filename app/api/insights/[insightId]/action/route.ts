import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { InsightGenerationService } from '@/lib/services/insight-generation-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { insightId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insightId } = params;
    const body = await request.json();
    const { action } = body;

    await InsightGenerationService.trackInsightAction(insightId, action || 'completed');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking insight as actioned:', error);
    return NextResponse.json(
      { error: 'Failed to mark insight as actioned' },
      { status: 500 }
    );
  }
}
