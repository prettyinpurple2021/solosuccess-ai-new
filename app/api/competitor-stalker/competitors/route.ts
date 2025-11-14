import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createCompetitorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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
  }),
});

// GET /api/competitor-stalker/competitors - Get all competitors for the current user
export async function GET(request: NextRequest) {
  try {
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

    const competitors = await prisma.competitorProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

// POST /api/competitor-stalker/competitors - Create a new competitor
export async function POST(request: NextRequest) {
  try {
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

    // Check subscription tier - Competitor Stalker requires Accelerator or Premium
    if (user.subscriptionTier === 'free') {
      return NextResponse.json(
        { error: 'Competitor Stalker requires an Accelerator or Premium subscription' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCompetitorSchema.parse(body);

    // Check competitor limit based on subscription tier
    const existingCount = await prisma.competitorProfile.count({
      where: { userId: user.id, isActive: true },
    });

    const maxCompetitors = user.subscriptionTier === 'premium' ? 10 : 5;
    if (existingCount >= maxCompetitors) {
      return NextResponse.json(
        { error: `You can track up to ${maxCompetitors} competitors with your ${user.subscriptionTier} plan` },
        { status: 403 }
      );
    }

    // Create the competitor
    const competitor = await prisma.competitorProfile.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        website: validatedData.website || null,
        industry: validatedData.industry || null,
        description: validatedData.description || null,
        trackingSources: validatedData.trackingSources,
        isActive: true,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to create competitor' },
      { status: 500 }
    );
  }
}
