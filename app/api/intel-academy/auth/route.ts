import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntelAcademyService } from '@/lib/services/intel-academy.service';

/**
 * GET /api/intel-academy/auth
 * Initiate OAuth flow with Intel Academy with state generation for CSRF protection
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

    const userId = session.user.id;
    // Use userId as state for CSRF protection
    const authUrl = IntelAcademyService.getAuthorizationUrl(userId, userId);

    // Redirect directly to Intel Academy OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Intel Academy auth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
