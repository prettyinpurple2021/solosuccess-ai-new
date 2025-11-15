# Intel Academy Integration

This document describes the Intel Academy integration implementation for SoloSuccess AI.

## Overview

The Intel Academy integration provides seamless single sign-on (SSO), course progress tracking, achievement showcasing, and automatic subscription synchronization between SoloSuccess AI and the Intel Academy learning platform.

## Features

### 1. SSO Integration (OAuth 2.0)

- **Authorization Flow**: Users can connect their Intel Academy account via OAuth 2.0
- **Token Management**: Automatic token refresh and expiration handling
- **Secure Redirect**: JWT-based SSO for seamless navigation to Intel Academy
- **Session Sync**: Maintains synchronized sessions across both platforms

**Endpoints:**
- `GET /api/intel-academy/auth` - Initiate OAuth flow
- `GET /api/intel-academy/callback` - Handle OAuth callback
- `GET /api/intel-academy/redirect` - Generate SSO redirect URL
- `POST /api/intel-academy/disconnect` - Disconnect integration
- `GET /api/intel-academy/status` - Get integration status

### 2. Dashboard Widget

The Intel Academy widget displays on the user's dashboard and includes:

- **Course Progress Display**: Shows active courses with progress bars
- **Achievement Showcase**: Displays earned badges in a grid layout
- **Enrollment Status**: Real-time sync status indicator
- **Quick Access**: Direct link to open Intel Academy

**Components:**
- `IntelAcademyWidget` - Main widget container
- `CourseProgressDisplay` - Active courses list
- `AchievementBadgeShowcase` - Achievement badges grid
- `EnrollmentStatusIndicator` - Status badge

### 3. Subscription Synchronization

Automatic tier mapping and synchronization:

**Tier Mapping:**
```
SoloSuccess AI → Intel Academy
- free         → basic
- accelerator  → premium
- premium      → enterprise
```

**Sync Triggers:**
- Subscription upgrade/downgrade
- Subscription cancellation
- Manual sync request
- Periodic batch sync (daily)

**Endpoints:**
- `POST /api/intel-academy/sync-subscription` - Manual sync trigger

**Services:**
- `SubscriptionSyncService` - Handles all sync operations
- Integrated with Stripe webhook handlers
- Automatic notifications on sync success/failure

### 4. Webhook Handlers

Processes events from Intel Academy:

**Supported Events:**
- `course.enrolled` - User enrolls in a course
- `course.progress_updated` - Course progress changes
- `course.completed` - User completes a course
- `achievement.earned` - User earns an achievement
- `subscription.updated` - Subscription status changes

**Features:**
- Webhook signature verification (HMAC SHA-256)
- Event queue for reliable processing
- Automatic retry on failure (max 3 attempts)
- Dashboard updates triggered by events
- User notifications for important events

**Endpoints:**
- `POST /api/intel-academy/webhook` - Webhook receiver

**Cron Jobs:**
- `GET /api/cron/process-webhooks` - Process pending events (every minute)
- `GET /api/cron/cleanup-webhooks` - Clean up old events (daily)
- `GET /api/cron/sync-intel-academy` - Batch sync all users (daily)

## Database Schema

### IntelAcademyIntegration
Stores OAuth tokens and sync status:
```prisma
model IntelAcademyIntegration {
  id                    String    @id @default(uuid())
  userId                String    @unique
  intelAcademyUserId    String?   @unique
  accessToken           String?
  refreshToken          String?
  tokenExpiry           DateTime?
  lastSyncAt            DateTime?
  syncStatus            String    @default("pending")
  isActive              Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### IntelAcademyCourse
Tracks user's course enrollments and progress:
```prisma
model IntelAcademyCourse {
  id                    String    @id @default(uuid())
  userId                String
  courseId              String
  courseName            String
  courseDescription     String?
  thumbnailUrl          String?
  enrollmentDate        DateTime?
  completionDate        DateTime?
  progress              Int       @default(0)
  status                String    @default("not_started")
  lastAccessedAt        DateTime?
  metadata              Json?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### IntelAcademyAchievement
Stores earned achievements and badges:
```prisma
model IntelAcademyAchievement {
  id                    String    @id @default(uuid())
  userId                String
  achievementId         String
  achievementName       String
  achievementType       String
  description           String?
  badgeUrl              String?
  earnedAt              DateTime
  metadata              Json?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### WebhookEvent
Queue for webhook event processing:
```prisma
model WebhookEvent {
  id                    String    @id @default(uuid())
  source                String
  eventType             String
  payload               Json
  signature             String?
  status                String    @default("pending")
  retryCount            Int       @default(0)
  errorMessage          String?
  processedAt           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

## Environment Variables

Required environment variables:

```bash
# Intel Academy Integration
INTEL_ACADEMY_API_URL="https://api.intelacademy.com"
INTEL_ACADEMY_CLIENT_ID="your-client-id"
INTEL_ACADEMY_CLIENT_SECRET="your-client-secret"
INTEL_ACADEMY_REDIRECT_URI="https://yourdomain.com/api/intel-academy/callback"
JWT_SECRET="your-jwt-secret"

# Webhooks
INTEL_ACADEMY_WEBHOOK_SECRET="your-webhook-secret"

# Cron Jobs
CRON_SECRET="your-cron-secret"
```

## Setup Instructions

### 1. Configure Intel Academy OAuth App

1. Register your application in Intel Academy developer portal
2. Set redirect URI to: `https://yourdomain.com/api/intel-academy/callback`
3. Note your Client ID and Client Secret
4. Configure webhook endpoint: `https://yourdomain.com/api/intel-academy/webhook`
5. Note your webhook secret

### 2. Update Environment Variables

Add the required environment variables to your `.env` file.

### 3. Run Database Migration

```bash
npx prisma migrate dev --name add_intel_academy_integration
```

### 4. Configure Cron Jobs

Set up the following cron jobs:

```bash
# Process webhook events (every minute)
* * * * * curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/process-webhooks

# Sync Intel Academy subscriptions (daily at 2 AM)
0 2 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/sync-intel-academy

# Clean up old webhook events (daily at 3 AM)
0 3 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/cleanup-webhooks
```

### 5. Add Widget to Dashboard

Import and add the widget to your dashboard:

```tsx
import { IntelAcademyWidget } from '@/components/intel-academy';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Other dashboard components */}
      <IntelAcademyWidget className="lg:col-span-1" />
    </div>
  );
}
```

## User Flow

### Connecting Intel Academy

1. User clicks "Connect Intel Academy" button in widget
2. User is redirected to Intel Academy OAuth authorization page
3. User authorizes the connection
4. User is redirected back to SoloSuccess AI dashboard
5. Integration is stored and subscription is synced
6. Success message is displayed

### Viewing Course Progress

1. Widget automatically fetches active courses
2. Displays up to 3 in-progress courses
3. Shows progress bars and last accessed date
4. "View all courses" link navigates to full course list

### Earning Achievements

1. Intel Academy sends webhook when achievement is earned
2. Webhook handler creates achievement record
3. Notification is sent to user
4. Badge appears in widget showcase

### Subscription Changes

1. User upgrades/downgrades subscription in SoloSuccess AI
2. Stripe webhook triggers subscription sync
3. Intel Academy access is automatically updated
4. User receives notification of access change

## API Reference

### IntelAcademyService

Main service class for Intel Academy operations:

```typescript
// Get authorization URL
IntelAcademyService.getAuthorizationUrl(userId: string): string

// Exchange code for tokens
IntelAcademyService.exchangeCodeForToken(code: string): Promise<TokenResponse>

// Refresh access token
IntelAcademyService.refreshAccessToken(refreshToken: string): Promise<TokenResponse>

// Generate SSO token
IntelAcademyService.generateSSOToken(userId: string, email: string, tier: string): string

// Store integration
IntelAcademyService.storeIntegration(userId: string, tokenData: TokenResponse): Promise<void>

// Get integration
IntelAcademyService.getIntegration(userId: string): Promise<Integration>

// Sync subscription tier
IntelAcademyService.syncSubscriptionTier(userId: string, tier: string): Promise<void>

// Disconnect integration
IntelAcademyService.disconnectIntegration(userId: string): Promise<void>
```

### SubscriptionSyncService

Handles subscription synchronization:

```typescript
// Sync subscription change
SubscriptionSyncService.syncSubscriptionChange(userId: string, newTier: string, oldTier?: string): Promise<void>

// Provision access
SubscriptionSyncService.provisionAccess(userId: string, tier: string): Promise<void>

// Handle cancellation
SubscriptionSyncService.handleCancellation(userId: string): Promise<void>

// Sync all users
SubscriptionSyncService.syncAllUsers(): Promise<void>
```

## Error Handling

The integration includes comprehensive error handling:

- **OAuth Errors**: Redirects to dashboard with error message
- **Token Expiration**: Automatic token refresh
- **Sync Failures**: Creates error notifications, doesn't block subscription changes
- **Webhook Failures**: Automatic retry with exponential backoff
- **Network Errors**: Graceful degradation, cached data display

## Security Considerations

- OAuth 2.0 with PKCE for secure authorization
- JWT tokens with 1-hour expiration
- Webhook signature verification (HMAC SHA-256)
- Secure token storage (encrypted at rest)
- Rate limiting on API endpoints
- CORS configuration for webhook endpoints
- Cron job authentication with secret tokens

## Monitoring

Key metrics to monitor:

- Integration connection success rate
- Token refresh success rate
- Webhook processing success rate
- Subscription sync success rate
- API response times
- Error rates by endpoint

## Troubleshooting

### Integration Not Connecting

1. Verify OAuth credentials are correct
2. Check redirect URI matches exactly
3. Ensure user has valid email
4. Check network connectivity to Intel Academy API

### Subscription Not Syncing

1. Verify integration is active
2. Check token expiration
3. Review sync error logs
4. Manually trigger sync via API

### Webhooks Not Processing

1. Verify webhook secret is correct
2. Check webhook signature verification
3. Review webhook event queue
4. Ensure cron jobs are running

### Courses Not Displaying

1. Verify user has enrolled courses
2. Check webhook events were received
3. Review course sync logs
4. Manually fetch courses via API

## Future Enhancements

Potential improvements for future releases:

- Real-time course recommendations based on user goals
- Learning path suggestions from AI agents
- Certificate display and verification
- Course completion reminders
- Learning analytics integration
- Gamification features
- Social learning features
- Mobile app deep linking
