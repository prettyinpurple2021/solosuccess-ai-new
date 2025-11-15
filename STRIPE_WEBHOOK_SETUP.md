# Stripe Webhook Setup Guide

This guide will help you set up Stripe webhooks for the SoloSuccess AI subscription system.

## Prerequisites

- Stripe account with API keys configured
- Access to Stripe Dashboard
- Your application deployed or accessible via a public URL (for production)
- Stripe CLI installed (for local development)

## Local Development Setup

### 1. Install Stripe CLI

Download and install the Stripe CLI from: https://stripe.com/docs/stripe-cli

### 2. Login to Stripe CLI

```bash
stripe login
```

### 3. Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This command will output a webhook signing secret that looks like:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Add Webhook Secret to .env

Copy the webhook signing secret and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Test Webhook

In a new terminal, trigger a test event:

```bash
stripe trigger checkout.session.completed
```

## Production Setup

### 1. Access Stripe Dashboard

Go to: https://dashboard.stripe.com/webhooks

### 2. Create Webhook Endpoint

1. Click "Add endpoint"
2. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
3. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3. Get Webhook Signing Secret

After creating the endpoint, Stripe will show you the webhook signing secret.
It will look like: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. Add to Production Environment

Add the webhook secret to your production environment variables:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Webhook Events Handled

The application handles the following Stripe webhook events:

### `checkout.session.completed`
- Triggered when a user completes the checkout process
- Creates or updates subscription in database
- Grants access to premium features

### `customer.subscription.created`
- Triggered when a new subscription is created
- Syncs subscription data to database

### `customer.subscription.updated`
- Triggered when subscription is modified (upgrade/downgrade)
- Updates subscription tier and status in database

### `customer.subscription.deleted`
- Triggered when subscription is canceled
- Downgrades user to free tier
- Maintains access until period end

### `invoice.payment_succeeded`
- Triggered when payment is successful
- Updates subscription status
- Extends access period

### `invoice.payment_failed`
- Triggered when payment fails
- Sends notification to user (future implementation)
- Provides grace period before downgrade

## Testing Webhooks

### Test with Stripe CLI

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test payment failure
stripe trigger invoice.payment_failed
```

### Verify Webhook Delivery

1. Check Stripe Dashboard > Webhooks
2. View recent webhook deliveries
3. Check response status (should be 200)
4. Review any errors in the logs

## Troubleshooting

### Webhook Signature Verification Failed

- Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
- Check that you're using the correct secret for your environment
- Verify the webhook endpoint URL matches exactly

### Events Not Being Received

- Check that webhook endpoint is publicly accessible
- Verify firewall/security settings allow Stripe IPs
- Check application logs for errors
- Ensure webhook events are selected in Stripe Dashboard

### Database Not Updating

- Check application logs for errors
- Verify database connection is working
- Ensure Prisma schema is up to date
- Check that user IDs in metadata match database

## Security Best Practices

1. **Always verify webhook signatures** - The code automatically verifies signatures using `stripe.webhooks.constructEvent()`

2. **Use HTTPS in production** - Stripe requires HTTPS for webhook endpoints

3. **Handle idempotency** - Stripe may send the same event multiple times. Use event IDs to prevent duplicate processing.

4. **Log webhook events** - Keep logs of all webhook events for debugging and auditing

5. **Monitor webhook health** - Set up alerts for failed webhook deliveries

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
