import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMethods } from '@/lib/stripe/subscription';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const paymentMethodsSchema = z.object({
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

    const { userId: validatedUserId } = paymentMethodsSchema.parse({ userId });

    // Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: validatedUserId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this user' },
        { status: 404 }
      );
    }

    const paymentMethods = await getPaymentMethods(user.stripeCustomerId);

    return NextResponse.json({
      paymentMethods: paymentMethods.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
