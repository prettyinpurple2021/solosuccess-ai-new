import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { IntegrationService } from '@/lib/services/integration-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/analytics?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/analytics?error=no_code', request.url)
      );
    }

    const { provider } = params;

    // Exchange code for token
    const tokenData = await IntegrationService.exchangeCodeForToken(
      provider,
      code
    );

    // Save integration
    await IntegrationService.saveIntegration(
      session.user.id,
      provider,
      tokenData
    );

    return NextResponse.redirect(
      new URL('/analytics?success=true', request.url)
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/analytics?error=callback_failed', request.url)
    );
  }
}
