import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updates
const updateCompetitorSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  description: z.string().optional(),
  trackingSources: z.object({
    website: z.boolean().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().optional(),
    blog: z.string().url().optional().or(z.literal('')),
  }).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/competitor-stalker/competitors/[competitorId] - Get a single competitor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const competitor = await prisma.competitorProfile.findFirst({
      where: {
        id: params.competitorId,
        userId: user.id,
      },
    });

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(competitor);
  } catch (error) {
    console.error('Error fetching competitor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitor' },
      { status: 500 }
    );
  }
}

// PATCH /api/competitor-stalker/competitors/[competitorId] - Update a competitor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const existingCompetitor = await prisma.competitorProfile.findFirst({
      where: {
        id: competitorId,
        userId: user.id,
      },
    });

    if (!existingCompetitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateCompetitorSchema.parse(body);

    // Update the competitor
    const competitor = await prisma.competitorProfile.update({
      where: { id: competitorId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.website !== undefined && { website: validatedData.website || null }),
        ...(validatedData.industry !== undefined && { industry: validatedData.industry || null }),
        ...(validatedData.description !== undefined && { description: validatedData.description || null }),
        ...(validatedData.trackingSources && { trackingSources: validatedData.trackingSources }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    });

    return NextResponse.json(competitor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to update competitor' },
      { status: 500 }
    );
  }
}

// DELETE /api/competitor-stalker/competitors/[competitorId] - Delete a competitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const existingCompetitor = await prisma.competitorProfile.findFirst({
      where: {
        id: competitorId,
        userId: user.id,
      },
    });

    if (!existingCompetitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Delete the competitor (cascade will delete activities)
    await prisma.competitorProfile.delete({
      where: { id: competitorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    );
  }
}
