import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (contentType) {
      where.contentType = contentType;
    }

    if (status) {
      where.status = status;
    }

    // Fetch generated content
    const content = await prisma.generatedContent.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
