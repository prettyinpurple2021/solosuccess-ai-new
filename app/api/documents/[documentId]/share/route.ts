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

    const body = await request.json();
    const { expiresInDays = 7 } = body;

    const document = await DocumentGenerationService.generateShareToken(
      params.documentId,
      session.user.id,
      expiresInDays
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/documents/shared/${document.shareToken}`;

    return NextResponse.json({
      shareToken: document.shareToken,
      shareUrl,
      expiresAt: document.shareExpiresAt
    });
  } catch (error) {
    console.error('Error sharing document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to share document' },
      { status: 500 }
    );
  }
}
