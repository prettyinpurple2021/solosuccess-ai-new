import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';

/**
 * GET /api/intel-academy/status
 * Get Intel Academy integration status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const integration = await IntelAcademyService.getIntegration(session.user.id);

    if (!integration) {
      return NextResponse.json({
        success: true,
        connected: false,
        integration: null,
      });
    }

    return NextResponse.json({
      success: true,
      connected: integration.isActive,
      integration: {
        id: integration.id,
        intelAcademyUserId: integration.intelAcademyUserId,
        lastSyncAt: integration.lastSyncAt,
        syncStatus: integration.syncStatus,
        isActive: integration.isActive,
      },
    });
  } catch (error) {
    console.error('Error getting Intel Academy status:', error);
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    );
  }
}
