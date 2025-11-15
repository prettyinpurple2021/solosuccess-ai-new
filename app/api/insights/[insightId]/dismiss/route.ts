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
    await InsightGenerationService.dismissInsight(insightId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error dismissing insight:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss insight' },
      { status: 500 }
    );
  }
}
