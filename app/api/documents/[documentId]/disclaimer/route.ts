import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DocumentGenerationService } from '@/lib/services/document-generation-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const document = await DocumentGenerationService.acceptDisclaimer(
      params.documentId,
      session.user.id
    );

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error accepting disclaimer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept disclaimer' },
      { status: 500 }
    );
  }
}
