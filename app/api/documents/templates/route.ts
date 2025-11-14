import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DocumentGenerationService } from '@/lib/services/document-generation-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category: searchParams.get('category') || undefined,
      documentType: searchParams.get('documentType') || undefined,
      jurisdiction: searchParams.get('jurisdiction') || undefined,
      businessType: searchParams.get('businessType') || undefined
    };

    const templates = await DocumentGenerationService.getTemplates(filters);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

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
    const {
      name,
      description,
      category,
      documentType,
      content,
      fields,
      jurisdictions,
      businessTypes
    } = body;

    if (!name || !category || !documentType || !content || !fields) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = await DocumentGenerationService.createCustomTemplate(
      session.user.id,
      {
        name,
        description,
        category,
        documentType,
        content,
        fields,
        jurisdictions,
        businessTypes
      }
    );

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
