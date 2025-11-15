import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';

/**
 * GET /api/intel-academy/redirect
 * Generate SSO redirect URL to Intel Academy
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

    // Check if user has Intel Academy integration
    const integration = await IntelAcademyService.getIntegration(session.user.id);

    if (!integration || !integration.isActive) {
      return NextResponse.json(
        { error: 'Intel Academy not connected. Please connect your account first.' },
        { status: 400 }
      );
    }

    // Generate SSO redirect URL
    const redirectUrl = await IntelAcademyService.getRedirectUrl(session.user.id);

    return NextResponse.json({
      success: true,
      redirectUrl,
    });
  } catch (error) {
    console.error('Error generating Intel Academy redirect:', error);
    return NextResponse.json(
      { error: 'Failed to generate redirect URL' },
      { status: 500 }
    );
  }
}
