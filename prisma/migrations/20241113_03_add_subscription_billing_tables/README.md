# Subscription and Billing Tables Migration

## Overview
This migration creates the subscription and billing infrastructure for the SoloSuccess AI platform, enabling Stripe integration and subscription tier management.

## Schema Changes

### User Table (Modified)
Added `stripeCustomerId` field to the User table for efficient Stripe customer lookups.

**New Fields:**
- `stripeCustomerId` (String, unique, nullable): Stripe customer ID for the user

**New Indexes:**
- Unique index on `stripeCustomerId` for data integrity
- Index on `stripeCustomerId` for fast webhook lookups

## Tables Created

### Subscription
Stores user subscription information with Stripe integration fields.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User table
- `stripeSubscriptionId` (String, unique, nullable): Stripe subscription ID for integration
- `stripePriceId` (String, nullable): Stripe price ID for the subscription plan
- `stripeCustomerId` (String, nullable): Stripe customer ID for the user
- `planName` (String): Name of the subscription plan (free, accelerator, premium)
- `status` (String): Subscription status (active, canceled, past_due, etc.)
- `currentPeriodStart` (DateTime, nullable): Start of current billing period
- `currentPeriodEnd` (DateTime, nullable): End of current billing period
- `cancelAtPeriodEnd` (Boolean): Whether subscription will cancel at period end
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Record last update timestamp

**Indexes:**
- Unique index on `stripeSubscriptionId` for fast Stripe webhook lookups
- Index on `userId` for user subscription queries
- Index on `stripeSubscriptionId` for Stripe integration queries

**Relationships:**
- Belongs to User (CASCADE delete)

## Requirements Addressed

This migration implements the database schema for:
- **Requirement 6.1**: Subscription tier tracking (free, accelerator, premium)
- **Requirement 6.2**: Subscription upgrade/downgrade management
- **Requirement 6.3**: Stripe payment processing integration

## Stripe Integration Fields

The migration includes all necessary fields for Stripe integration:
- `stripeSubscriptionId`: Links to Stripe subscription object
- `stripePriceId`: Identifies the pricing plan in Stripe
- `stripeCustomerId`: Links to Stripe customer object
- `currentPeriodStart/End`: Tracks billing cycles from Stripe
- `cancelAtPeriodEnd`: Handles subscription cancellation flow

## Usage

### Running the Migration
```bash
npx prisma migrate deploy
```

### Verifying the Migration
```bash
npx prisma db pull
npx prisma generate
```

## Notes

- The `stripeSubscriptionId` is nullable to support free tier users who don't have Stripe subscriptions
- The `status` field should align with Stripe subscription statuses: active, canceled, incomplete, incomplete_expired, past_due, trialing, unpaid
- The `planName` field stores the tier name for quick access without querying Stripe
- Cascade delete ensures subscription records are removed when users are deleted
- The User table already has `subscriptionTier` and `subscriptionStatus` fields for denormalized quick access

## Related Files
- Schema: `prisma/schema.prisma`
- Design Document: `.kiro/specs/solosuccess-ai/design.md`
- Requirements: `.kiro/specs/solosuccess-ai/requirements.md` (Requirement 6)
