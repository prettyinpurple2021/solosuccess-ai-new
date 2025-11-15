import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionTier } from '@/lib/stripe/subscription';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const upgradeSchema = z.object({
  userId: z.string().uuid(),
  newTier: z.enum(['accelerator', 'premium']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newTier } = upgradeSchema.parse(body);

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

    // Update subscription in Stripe
    const updatedSubscription = await updateSubscriptionTier(
      subscription.stripeSubscriptionId,
      newTier
    );

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripePriceId: updatedSubscription.items.data[0].price.id,
        planName: newTier,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        tier: newTier,
        status: updatedSubscription.status,
      },
    });
  } catch (error) {
    console.error('Upgrade error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
