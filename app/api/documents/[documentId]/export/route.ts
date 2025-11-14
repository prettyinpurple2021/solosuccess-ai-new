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

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') as 'pdf' | 'docx' || 'pdf';

    if (!['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be pdf or docx' },
        { status: 400 }
      );
    }

    let url: string;

    if (format === 'pdf') {
      url = await DocumentExportService.generatePDF(params.documentId, session.user.id);
    } else {
      url = await DocumentExportService.generateDOCX(params.documentId, session.user.id);
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error exporting document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export document' },
      { status: 500 }
    );
  }
}
