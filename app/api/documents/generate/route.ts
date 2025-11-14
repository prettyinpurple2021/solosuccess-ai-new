import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DocumentGenerationService } from '@/lib/services/document-generation-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { templateId, title, customizations, jurisdiction, businessType } = body;

    if (!templateId || !title || !customizations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const document = await DocumentGenerationService.generateDocument({
      userId: session.user.id,
      templateId,
      title,
      customizations,
      jurisdiction,
      businessType
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate document' },
      { status: 500 }
    );
  }
}
