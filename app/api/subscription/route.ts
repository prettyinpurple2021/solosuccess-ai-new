import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const subscriptionQuerySchema = z.object({
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

    const { userId: validatedUserId } = subscriptionQuerySchema.parse({ userId });

    const user = await prisma.user.findUnique({
      where: { id: validatedUserId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptions: {
          where: {
            status: {
              in: ['active', 'trialing', 'past_due'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const activeSubscription = user.subscriptions[0] || null;

    return NextResponse.json({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            stripeSubscriptionId: activeSubscription.stripeSubscriptionId,
            planName: activeSubscription.planName,
            status: activeSubscription.status,
            currentPeriodStart: activeSubscription.currentPeriodStart,
            currentPeriodEnd: activeSubscription.currentPeriodEnd,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
