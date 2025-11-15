import { NextRequest, NextResponse } from 'next/server';
import { getInvoices } from '@/lib/stripe/subscription';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const invoicesSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { userId: validatedUserId, limit: validatedLimit } =
      invoicesSchema.parse({
        userId,
        limit: limit ? parseInt(limit) : 10,
      });

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

    const invoices = await getInvoices(
      user.stripeCustomerId,
      validatedLimit || 10
    );

    return NextResponse.json({
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: new Date(invoice.created * 1000),
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
        periodStart: invoice.period_start
          ? new Date(invoice.period_start * 1000)
          : null,
        periodEnd: invoice.period_end
          ? new Date(invoice.period_end * 1000)
          : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
