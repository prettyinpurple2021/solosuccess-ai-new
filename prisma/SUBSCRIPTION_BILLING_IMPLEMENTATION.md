# Subscription and Billing Implementation Guide

## Overview
This document provides implementation guidance for the subscription and billing system with Stripe integration for SoloSuccess AI.

## Database Schema

The Subscription model has been created with the following structure:

```prisma
model Subscription {
  id                   String    @id @default(uuid())
  userId               String
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  stripeCustomerId     String?
  planName             String
  status               String
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([userId])
  @@index([stripeSubscriptionId])
}
```

## Subscription Tiers

### Free Tier
- **Plan Name**: "free"
- **Price**: $0/month
- **Features**: Basic AI agent access, limited conversations
- **Stripe Integration**: No Stripe subscription required

### Accelerator Tier
- **Plan Name**: "accelerator"
- **Price**: $49/month (example)
- **Features**: Premium features including Competitor Stalker
- **Stripe Integration**: Required

### Premium Tier
- **Plan Name**: "premium"
- **Price**: $99/month (example)
- **Features**: All features including Mission Control, Intel Academy access
- **Stripe Integration**: Required

## Implementation Steps

### 1. Stripe Configuration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: ['Basic AI agent access', 'Limited conversations'],
  },
  accelerator: {
    name: 'Accelerator',
    priceId: process.env.STRIPE_ACCELERATOR_PRICE_ID!,
    price: 4900, // $49.00 in cents
    features: ['All Free features', 'Competitor Stalker', 'Unlimited conversations'],
  },
  premium: {
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    price: 9900, // $99.00 in cents
    features: ['All Accelerator features', 'Mission Control', 'Intel Academy access'],
  },
};
```

### 2. Create Subscription Service

```typescript
// lib/services/subscription.service.ts
import { prisma } from '@/lib/prisma';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';

export class SubscriptionService {
  /**
   * Create a Stripe customer for a user
   */
  async createStripeCustomer(userId: string, email: string) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    return customer.id;
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(
    userId: string,
    planName: 'accelerator' | 'premium',
    paymentMethodId: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      stripeCustomerId = await this.createStripeCustomer(userId, user.email);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const plan = STRIPE_PLANS[planName];
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Store in database
    await prisma.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: plan.priceId,
        stripeCustomerId,
        planName,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Update user subscription tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: planName,
        subscriptionStatus: subscription.status,
      },
    });

    return subscription;
  }

  /**
   * Upgrade/downgrade subscription
   */
  async updateSubscription(
    userId: string,
    newPlanName: 'accelerator' | 'premium'
  ) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const newPlan = STRIPE_PLANS[newPlanName];
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update subscription in Stripe
    const updated = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPlan.priceId,
          },
        ],
        proration_behavior: 'create_prorations',
      }
    );

    // Update in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        stripePriceId: newPlan.priceId,
        planName: newPlanName,
        status: updated.status,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: newPlanName },
    });

    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, immediate: boolean = false) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'canceled' },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: 'free', subscriptionStatus: 'canceled' },
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
      });
    }
  }

  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const subscriptionService = new SubscriptionService();
```

### 3. Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId },
  });

  if (!user) {
    console.error('User not found for customer:', stripeCustomerId);
    return;
  }

  // Update or create subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCustomerId,
      planName: getPlanNameFromPriceId(subscription.items.data[0].price.id),
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update user subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: subscription.status,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' },
  });

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (sub) {
    await prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
      },
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update subscription status if needed
  if (invoice.subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: 'active' },
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Update subscription status to past_due
  if (invoice.subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: 'past_due' },
    });

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (sub) {
      await prisma.user.update({
        where: { id: sub.userId },
        data: { subscriptionStatus: 'past_due' },
      });
    }
  }
}

function getPlanNameFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_ACCELERATOR_PRICE_ID) return 'accelerator';
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium';
  return 'free';
}
```

### 4. Environment Variables

Add to `.env`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ACCELERATOR_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

### 5. Feature Gating Middleware

```typescript
// lib/middleware/subscription.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function requireSubscription(
  req: NextRequest,
  userId: string,
  requiredTier: 'accelerator' | 'premium'
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true, subscriptionStatus: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const tierHierarchy = { free: 0, accelerator: 1, premium: 2 };
  const userTierLevel = tierHierarchy[user.subscriptionTier as keyof typeof tierHierarchy] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];

  if (userTierLevel < requiredTierLevel) {
    return NextResponse.json(
      {
        error: 'Subscription upgrade required',
        requiredTier,
        currentTier: user.subscriptionTier,
      },
      { status: 403 }
    );
  }

  if (user.subscriptionStatus !== 'active' && user.subscriptionTier !== 'free') {
    return NextResponse.json(
      {
        error: 'Subscription is not active',
        status: user.subscriptionStatus,
      },
      { status: 403 }
    );
  }

  return null; // Access granted
}
```

## Testing

### Test Stripe Integration
1. Use Stripe test mode with test cards
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`

### Test Webhooks Locally
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Requirements Mapping

- **Requirement 6.1**: Subscription tier tracking implemented via `planName` and User.subscriptionTier
- **Requirement 6.2**: Upgrade/downgrade via `updateSubscription()` method
- **Requirement 6.3**: Stripe integration via all Stripe-related fields and webhook handlers
- **Requirement 6.4**: Feature comparison via STRIPE_PLANS configuration
- **Requirement 6.5**: Feature gating via `requireSubscription()` middleware

## Next Steps

1. Run the migration: `npx prisma migrate deploy`
2. Generate Prisma client: `npx prisma generate`
3. Set up Stripe account and get API keys
4. Create products and prices in Stripe dashboard
5. Configure webhook endpoint in Stripe dashboard
6. Implement frontend subscription UI components
7. Add subscription management to user dashboard
8. Implement feature gating throughout the application
