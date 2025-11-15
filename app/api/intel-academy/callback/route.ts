import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/intel-academy/callback
 * Handle OAuth callback from Intel Academy
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Intel Academy OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?intel_academy_error=${error}`, request.url)
      );
    }

    // Validate authorization code
    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?intel_academy_error=missing_code', request.url)
      );
    }

    // Verify state matches user ID
    if (state !== session.user.id) {
      return NextResponse.redirect(
        new URL('/dashboard?intel_academy_error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokenData = await IntelAcademyService.exchangeCodeForToken(code);

    // Get user info from Intel Academy
    const userInfo = await IntelAcademyService.getUserInfo(tokenData.access_token);

    // Store integration
    await IntelAcademyService.storeIntegration(
      session.user.id,
      tokenData,
      userInfo.id
    );

    // Sync subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (user) {
      await IntelAcademyService.syncSubscriptionTier(
        session.user.id,
        user.subscriptionTier
      );
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?intel_academy_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error handling Intel Academy callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?intel_academy_error=connection_failed', request.url)
    );
  }
}
