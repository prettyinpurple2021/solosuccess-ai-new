import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';
import { notificationService } from '@/lib/services/notification-service';

/**
 * POST /api/intel-academy/disconnect
 * Disconnect Intel Academy integration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await IntelAcademyService.disconnectIntegration(session.user.id);

    // Send notification (non-blocking)
    notificationService.notifyIntelAcademyDisconnected(
      session.user.id,
      'You manually disconnected your Intel Academy integration'
    ).catch((error) => {
      console.error('Error sending Intel Academy disconnection notification:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Intel Academy integration disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Intel Academy:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Intel Academy' },
      { status: 500 }
    );
  }
}
