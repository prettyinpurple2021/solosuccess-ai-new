import { NextRequest, NextResponse } from 'next/server';
import { reactivateSubscription } from '@/lib/stripe/subscription';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const reactivateSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = reactivateSchema.parse(body);

    // Get user's subscription that's set to cancel
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        cancelAtPeriodEnd: true,
        status: {
          in: ['active', 'trialing'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No subscription scheduled for cancellation found' },
        { status: 404 }
      );
    }

    // Reactivate subscription in Stripe
    const reactivatedSubscription = await reactivateSubscription(
      subscription.stripeSubscriptionId
    );

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription has been reactivated',
      subscription: {
        status: reactivatedSubscription.status,
        currentPeriodEnd: new Date(
          reactivatedSubscription.current_period_end * 1000
        ),
      },
    });
  } catch (error) {
    console.error('Reactivation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
