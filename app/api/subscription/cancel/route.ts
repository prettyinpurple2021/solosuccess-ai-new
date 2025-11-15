import { NextRequest, NextResponse } from 'next/server';
import { cancelSubscription } from '@/lib/stripe/subscription';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const cancelSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reason } = cancelSchema.parse(body);

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
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
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe (at period end)
    const canceledSubscription = await cancelSubscription(
      subscription.stripeSubscriptionId
    );

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    // Log cancellation reason if provided
    if (reason) {
      console.log('Subscription cancellation reason:', {
        userId,
        subscriptionId: subscription.id,
        reason,
      });
      // TODO: Store cancellation feedback in database
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: new Date(canceledSubscription.current_period_end * 1000),
    });
  } catch (error) {
    console.error('Cancellation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
