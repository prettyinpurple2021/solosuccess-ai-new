import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';

/**
 * GET /api/intel-academy/status
 * Get Intel Academy integration status with token refresh
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

    // Ensure token is valid (will refresh if needed)
    if (integration.isActive && integration.accessToken) {
      try {
        await IntelAcademyService.ensureValidToken(session.user.id);
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Token refresh failed, integration will be marked as inactive
      }
    }

    // Fetch updated integration after potential token refresh
    const updatedIntegration = await IntelAcademyService.getIntegration(session.user.id);

    return NextResponse.json({
      success: true,
      connected: updatedIntegration?.isActive || false,
      integration: updatedIntegration ? {
        id: updatedIntegration.id,
        intelAcademyUserId: updatedIntegration.intelAcademyUserId,
        lastSyncAt: updatedIntegration.lastSyncAt,
        syncStatus: updatedIntegration.syncStatus,
        isActive: updatedIntegration.isActive,
      } : null,
    });
  } catch (error) {
    console.error('Error getting Intel Academy status:', error);
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    );
  }
}
