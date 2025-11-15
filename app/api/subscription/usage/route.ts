import { NextRequest, NextResponse } from 'next/server';
import { getUsageSummary } from '@/lib/subscription/usage-tracker';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { SubscriptionTier } from '@/lib/stripe/client';

const usageQuerySchema = z.object({
  userId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { userId: validatedUserId } = usageQuerySchema.parse({ userId });

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: validatedUserId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const tier = user.subscriptionTier as SubscriptionTier;
    const usage = await getUsageSummary(validatedUserId, tier);

    return NextResponse.json({
      tier,
      usage,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
