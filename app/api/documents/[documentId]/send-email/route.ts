import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DocumentExportService } from '@/lib/services/document-export-service';

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
    const { recipientEmail, format = 'pdf' } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    if (!['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be pdf or docx' },
        { status: 400 }
      );
    }

    await DocumentExportService.sendDocumentEmail(
      params.documentId,
      session.user.id,
      recipientEmail,
      format
    );

    return NextResponse.json({
      success: true,
      message: `Document sent to ${recipientEmail}`
    });
  } catch (error) {
    console.error('Error sending document email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send document' },
      { status: 500 }
    );
  }
}
