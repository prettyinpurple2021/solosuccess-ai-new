import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { IntegrationService } from '@/lib/services/integration-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = params;
    await IntegrationService.disconnectIntegration(session.user.id, provider);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
