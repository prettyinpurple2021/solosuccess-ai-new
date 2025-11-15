import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/client';
import {
  syncSubscriptionToDatabase,
  handleSubscriptionDeletion,
} from '@/lib/stripe/subscription';
import { SubscriptionSyncService } from '@/lib/services/subscription-sync.service';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!STRIPE_CONFIG.webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncSubscriptionToDatabase(subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        await syncSubscriptionToDatabase(subscription);
        
        // Sync with Intel Academy (non-blocking)
        try {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: subscription.customer as string },
            select: { id: true, subscriptionTier: true },
          });
          
          if (user) {
            // Run sync in background without blocking webhook response
            SubscriptionSyncService.syncSubscriptionChange(
              user.id,
              user.subscriptionTier
            ).catch((error) => {
              console.error('Intel Academy sync failed (non-blocking):', error);
            });
          }
        } catch (error) {
          console.error('Error finding user for Intel Academy sync:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);
        await handleSubscriptionDeletion(subscription.id);
        
        // Sync cancellation with Intel Academy (non-blocking)
        try {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: subscription.customer as string },
            select: { id: true },
          });
          
          if (user) {
            // Run sync in background without blocking webhook response
            SubscriptionSyncService.handleCancellation(user.id).catch((error) => {
              console.error('Intel Academy cancellation sync failed (non-blocking):', error);
            });
          }
        } catch (error) {
          console.error('Error finding user for Intel Academy cancellation sync:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        
        const subscriptionId = (invoice as any).subscription;
        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          await syncSubscriptionToDatabase(subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice.id);
        
        // TODO: Send notification to user about payment failure
        // This will be handled in the notification system
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
