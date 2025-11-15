import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/intel-academy/sync-subscription
 * Manually trigger subscription sync with Intel Academy
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

    // Check if Intel Academy is connected
    const integration = await IntelAcademyService.getIntegration(session.user.id);

    if (!integration || !integration.isActive) {
      return NextResponse.json(
        { error: 'Intel Academy not connected' },
        { status: 400 }
      );
    }

    // Get current subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Sync subscription tier
    await IntelAcademyService.syncSubscriptionTier(
      session.user.id,
      user.subscriptionTier
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscriptionTier: user.subscriptionTier,
    });
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
