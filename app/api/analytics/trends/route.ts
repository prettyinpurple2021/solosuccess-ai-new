import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { DataProcessingService } from '@/lib/services/data-processing-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const trends = await DataProcessingService.detectTrends(
      session.user.id,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error detecting trends:', error);
    return NextResponse.json(
      { error: 'Failed to detect trends' },
      { status: 500 }
    );
  }
}
