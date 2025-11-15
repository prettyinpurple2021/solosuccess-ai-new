import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { IntegrationService } from '@/lib/services/integration-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const integrations = await IntegrationService.getActiveIntegrations(
      session.user.id
    );

    return NextResponse.json({
      integrations: integrations.map((integration) => ({
        id: integration.id,
        provider: integration.provider,
        isActive: integration.isActive,
        lastSyncAt: integration.lastSyncAt,
        createdAt: integration.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}
