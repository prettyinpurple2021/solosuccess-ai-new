import { stripe, SUBSCRIPTION_TIERS, SubscriptionTier } from './client';
import { prisma } from '@/lib/db/prisma';
import { SubscriptionSyncService } from '@/lib/services/subscription-sync.service';
import Stripe from 'stripe';

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer');
  }
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  return createStripeCustomer(userId, email, name);
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  tier: 'accelerator' | 'premium',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    const customerId = await getOrCreateStripeCustomer(userId, email);
    const priceId = SUBSCRIPTION_TIERS[tier].priceId;

    if (!priceId) {
      throw new Error(`No price ID configured for tier: ${tier}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        tier,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw new Error('Failed to create billing portal session');
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new Error('Failed to reactivate subscription');
  }
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newTier: 'accelerator' | 'premium'
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const newPriceId = SUBSCRIPTION_TIERS[newTier].priceId;

    if (!newPriceId) {
      throw new Error(`No price ID configured for tier: ${newTier}`);
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          ...subscription.metadata,
          tier: newTier,
        },
      }
    );

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    throw new Error('Failed to update subscription tier');
  }
}

/**
 * Get customer's payment methods
 */
export async function getPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    return [];
  }
}

/**
 * Get customer's invoices
 */
export async function getInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    return [];
  }
}

/**
 * Sync subscription data from Stripe to database
 */
export async function syncSubscriptionToDatabase(
  subscription: Stripe.Subscription
): Promise<void> {
  try {
    const userId = subscription.metadata.userId;
    const tier = subscription.metadata.tier as SubscriptionTier;

    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Cast to any to access snake_case properties
    const sub = subscription as any;

    // Update or create subscription record
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: {
        status: subscription.status,
        stripePriceId: subscription.items.data[0].price.id,
        currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : null,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
        planName: tier || 'unknown',
      },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        planName: tier || 'unknown',
        status: subscription.status,
        currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : null,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      },
    });

    // Get old tier before update
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    const oldTier = user?.subscriptionTier;
    const newTier = tier || 'free';

    // Update user's subscription tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        subscriptionStatus: subscription.status,
      },
    });

    // Sync with Intel Academy if tier changed
    if (oldTier !== newTier) {
      await SubscriptionSyncService.syncSubscriptionChange(userId, newTier, oldTier);
    }
  } catch (error) {
    console.error('Error syncing subscription to database:', error);
    throw error;
  }
}

/**
 * Handle subscription deletion
 */
export async function handleSubscriptionDeletion(
  subscriptionId: string
): Promise<void> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      console.error('Subscription not found:', subscriptionId);
      return;
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'canceled' },
    });

    // Downgrade user to free tier
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
      },
    });

    // Sync cancellation with Intel Academy
    await SubscriptionSyncService.handleCancellation(subscription.userId);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}
