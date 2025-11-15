import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';
import { addBreadcrumb } from '@/lib/monitoring';

/**
 * GET /api/intel-academy/redirect
 * Generate SSO JWT token and redirect to Intel Academy
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

    // Generate SSO redirect URL with JWT token
    const redirectUrl = await IntelAcademyService.getSSORedirectUrl(session.user.id);

    // Log SSO event for security monitoring
    addBreadcrumb(
      'Intel Academy SSO redirect',
      'security',
      'info',
      {
        userId: session.user.id,
        intelAcademyUserId: integration.intelAcademyUserId,
        timestamp: new Date().toISOString(),
      }
    );

    // Redirect directly to Intel Academy
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error generating Intel Academy redirect:', error);
    
    // Log security event for failed SSO attempt
    addBreadcrumb(
      'Intel Academy SSO redirect failed',
      'security',
      'error',
      {
        userId: session?.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      { error: 'Failed to generate redirect URL' },
      { status: 500 }
    );
  }
}
