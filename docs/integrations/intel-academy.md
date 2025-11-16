# Intel Academy Integration Documentation

## Overview

The Intel Academy integration enables SoloSuccess AI users to connect their Intel Academy learning accounts, view course progress and achievements on their dashboard, and automatically sync subscription tiers to control course access levels.

### Key Features

- **OAuth 2.0 Authentication**: Secure connection to Intel Academy accounts
- **Real-time Updates**: Webhook-based synchronization of course progress and achievements
- **Automatic Tier Sync**: Subscription changes automatically update Intel Academy access levels
- **SSO Support**: Seamless single sign-on to Intel Academy from SoloSuccess AI
- **Dashboard Widget**: View courses and achievements without leaving SoloSuccess AI

### Architecture

```
SoloSuccess AI ←→ OAuth 2.0 ←→ Intel Academy
       ↑                              ↓
       └──────── Webhooks ────────────┘
```

## OAuth Setup Process

### Prerequisites

1. Intel Academy API credentials (Client ID and Client Secret)
2. Registered redirect URI in Intel Academy developer portal
3. Webhook endpoint URL registered with Intel Academy

### Configuration Steps

#### 1. Register Application with Intel Academy

1. Log in to Intel Academy Developer Portal
2. Navigate to "Applications" → "Create New Application"
3. Fill in application details:
   - **Name**: SoloSuccess AI
   - **Description**: AI-powered business tools with integrated learning
   - **Redirect URI**: `https://solosuccess.ai/api/intel-academy/callback`
   - **Webhook URL**: `https://solosuccess.ai/api/intel-academy/webhook`
4. Select required scopes:
   - `user:read` - Read user profile information
   - `courses:read` - Read course enrollment and progress
   - `achievements:read` - Read earned achievements
5. Save and note the Client ID and Client Secret

#### 2. Configure Environment Variables

Add the following variables to your `.env` file:

```bash
# Intel Academy API Configuration
INTEL_ACADEMY_API_URL=https://api.intelacademy.com
INTEL_ACADEMY_CLIENT_ID=your_client_id_here
INTEL_ACADEMY_CLIENT_SECRET=your_client_secret_here
INTEL_ACADEMY_REDIRECT_URI=https://solosuccess.ai/api/intel-academy/callback

# Security Secrets
INTEL_ACADEMY_WEBHOOK_SECRET=your_webhook_secret_here
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_encryption_key_here
CRON_SECRET=your_cron_secret_here
```

#### 3. Run Database Migration

Execute the Prisma migration to create required tables:

```bash
npx prisma migrate deploy
```

This creates the following tables:
- `IntelAcademyIntegration` - Stores OAuth tokens and sync status
- `IntelAcademyCourse` - Stores user course enrollments and progress
- `IntelAcademyAchievement` - Stores earned achievements
- `WebhookEvent` - Queues webhook events for processing

#### 4. Deploy to Vercel

Ensure the following are configured in Vercel:

1. **Environment Variables**: Add all variables from step 2
2. **Cron Jobs**: Verify `vercel.json` includes cron configuration
3. **Build Settings**: Ensure Next.js build completes successfully

### OAuth Flow

#### User Connection Flow

1. User clicks "Connect Intel Academy" button on dashboard
2. System redirects to `/api/intel-academy/auth`
3. Auth endpoint generates state parameter and redirects to Intel Academy
4. User authorizes SoloSuccess AI on Intel Academy
5. Intel Academy redirects back to `/api/intel-academy/callback` with authorization code
6. Callback endpoint exchanges code for access and refresh tokens
7. Tokens are encrypted and stored in database
8. Initial subscription sync is triggered
9. User is redirected to dashboard with success message

#### Token Management

- **Access Token**: Valid for 1 hour, used for API calls
- **Refresh Token**: Valid for 90 days, used to obtain new access tokens
- **Automatic Refresh**: System automatically refreshes expired tokens
- **Encryption**: All tokens encrypted at rest using AES-256-GCM

#### Disconnection Flow

1. User clicks "Disconnect" in integration settings
2. System calls `/api/intel-academy/disconnect`
3. Tokens are revoked with Intel Academy API
4. Integration record is deleted from database
5. Cached data is cleared
6. User receives confirmation

## Webhook Configuration

### Webhook Endpoint

**URL**: `https://solosuccess.ai/api/intel-academy/webhook`  
**Method**: POST  
**Authentication**: HMAC SHA-256 signature verification

### Supported Event Types

#### 1. course.enrolled

Triggered when user enrolls in a new course.

**Payload**:
```json
{
  "event": "course.enrolled",
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "intel_academy_user_id",
  "data": {
    "course_id": "course_123",
    "course_name": "Introduction to AI",
    "enrollment_date": "2024-01-15T10:30:00Z",
    "thumbnail_url": "https://cdn.intelacademy.com/courses/ai-intro.jpg"
  }
}
```

#### 2. course.progress_updated

Triggered when user makes progress in a course.

**Payload**:
```json
{
  "event": "course.progress_updated",
  "timestamp": "2024-01-15T11:45:00Z",
  "user_id": "intel_academy_user_id",
  "data": {
    "course_id": "course_123",
    "progress": 45,
    "last_accessed_at": "2024-01-15T11:45:00Z"
  }
}
```

#### 3. course.completed

Triggered when user completes a course.

**Payload**:
```json
{
  "event": "course.completed",
  "timestamp": "2024-01-20T16:00:00Z",
  "user_id": "intel_academy_user_id",
  "data": {
    "course_id": "course_123",
    "completion_date": "2024-01-20T16:00:00Z",
    "certificate_url": "https://cdn.intelacademy.com/certificates/cert_456.pdf"
  }
}
```

#### 4. achievement.earned

Triggered when user earns an achievement.

**Payload**:
```json
{
  "event": "achievement.earned",
  "timestamp": "2024-01-20T16:05:00Z",
  "user_id": "intel_academy_user_id",
  "data": {
    "achievement_id": "achievement_789",
    "achievement_name": "AI Fundamentals Master",
    "achievement_type": "course_completion",
    "description": "Completed all AI fundamentals courses",
    "badge_url": "https://cdn.intelacademy.com/badges/ai-master.png",
    "earned_at": "2024-01-20T16:05:00Z"
  }
}
```

### Signature Verification

All webhooks include an `X-Intel-Academy-Signature` header containing an HMAC SHA-256 signature.

**Verification Process**:
```typescript
const signature = request.headers.get('X-Intel-Academy-Signature');
const payload = await request.text();
const expectedSignature = crypto
  .createHmac('sha256', process.env.INTEL_ACADEMY_WEBHOOK_SECRET!)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  // Reject webhook
  return new Response('Invalid signature', { status: 401 });
}
```

### Webhook Processing

1. **Reception**: Webhook received at `/api/intel-academy/webhook`
2. **Verification**: Signature validated using HMAC SHA-256
3. **Storage**: Event stored in `WebhookEvent` table with `pending` status
4. **Response**: 200 OK returned within 3 seconds
5. **Processing**: Cron job processes events asynchronously every minute
6. **Retry**: Failed events retried up to 3 times with exponential backoff
7. **Notification**: User notified of important events (achievements, completions)

### Webhook Retry Logic

```typescript
// Exponential backoff calculation
const delay = Math.min(1000 * Math.pow(2, retryCount), 60000);

// Max 3 retry attempts
if (retryCount >= 3) {
  // Mark as permanently failed
  await markEventFailed(eventId);
  await alertAdministrators(eventId);
}
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `INTEL_ACADEMY_API_URL` | Base URL for Intel Academy API | `https://api.intelacademy.com` |
| `INTEL_ACADEMY_CLIENT_ID` | OAuth client ID | `solosuccess_client_abc123` |
| `INTEL_ACADEMY_CLIENT_SECRET` | OAuth client secret | `secret_xyz789...` |
| `INTEL_ACADEMY_REDIRECT_URI` | OAuth callback URL | `https://solosuccess.ai/api/intel-academy/callback` |
| `INTEL_ACADEMY_WEBHOOK_SECRET` | Webhook signature secret | `webhook_secret_456...` |
| `JWT_SECRET` | Secret for signing SSO tokens | `jwt_secret_789...` |
| `ENCRYPTION_KEY` | 32-byte key for token encryption | `32_byte_encryption_key_here...` |
| `CRON_SECRET` | Secret for authenticating cron jobs | `cron_secret_012...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INTEL_ACADEMY_RATE_LIMIT` | API requests per minute per user | `100` |
| `INTEL_ACADEMY_RATE_WINDOW` | Rate limit window in milliseconds | `60000` |
| `CACHE_TTL` | Cache TTL in seconds | `300` |
| `REDIS_URL` | Redis connection URL for caching | N/A |

### Generating Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY (must be exactly 32 bytes)
openssl rand -hex 32

# Generate CRON_SECRET
openssl rand -base64 32

# Generate INTEL_ACADEMY_WEBHOOK_SECRET
openssl rand -base64 32
```

## API Endpoints

### OAuth Endpoints

#### GET /api/intel-academy/auth

Initiates OAuth authorization flow.

**Authentication**: Required (NextAuth session)

**Query Parameters**: None

**Response**: Redirects to Intel Academy authorization page

**Example**:
```bash
curl -X GET https://solosuccess.ai/api/intel-academy/auth \
  -H "Cookie: next-auth.session-token=..."
```

---

#### GET /api/intel-academy/callback

Handles OAuth callback from Intel Academy.

**Authentication**: None (public endpoint)

**Query Parameters**:
- `code` (required): Authorization code from Intel Academy
- `state` (required): CSRF protection state parameter

**Response**: Redirects to dashboard with success/error message

**Example**:
```
https://solosuccess.ai/api/intel-academy/callback?code=auth_code_123&state=csrf_state_456
```

---

#### POST /api/intel-academy/disconnect

Disconnects Intel Academy integration.

**Authentication**: Required (NextAuth session)

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "message": "Intel Academy integration disconnected successfully"
}
```

**Example**:
```bash
curl -X POST https://solosuccess.ai/api/intel-academy/disconnect \
  -H "Cookie: next-auth.session-token=..."
```

---

#### GET /api/intel-academy/status

Returns integration status and data for current user.

**Authentication**: Required (NextAuth session)

**Query Parameters**: None

**Response**:
```json
{
  "connected": true,
  "lastSyncAt": "2024-01-15T12:00:00Z",
  "syncStatus": "synced",
  "courses": [
    {
      "id": "course_123",
      "courseName": "Introduction to AI",
      "progress": 45,
      "status": "in_progress",
      "lastAccessedAt": "2024-01-15T11:45:00Z",
      "thumbnailUrl": "https://cdn.intelacademy.com/courses/ai-intro.jpg"
    }
  ],
  "achievements": [
    {
      "id": "achievement_789",
      "achievementName": "First Course Complete",
      "badgeUrl": "https://cdn.intelacademy.com/badges/first-course.png",
      "earnedAt": "2024-01-10T14:30:00Z"
    }
  ]
}
```

**Example**:
```bash
curl -X GET https://solosuccess.ai/api/intel-academy/status \
  -H "Cookie: next-auth.session-token=..."
```

### SSO Endpoint

#### GET /api/intel-academy/redirect

Generates SSO token and redirects to Intel Academy.

**Authentication**: Required (NextAuth session)

**Query Parameters**: None

**Response**: Redirects to Intel Academy with SSO token

**Example**:
```bash
curl -X GET https://solosuccess.ai/api/intel-academy/redirect \
  -H "Cookie: next-auth.session-token=..."
```

### Webhook Endpoint

#### POST /api/intel-academy/webhook

Receives webhook events from Intel Academy.

**Authentication**: HMAC signature verification

**Headers**:
- `X-Intel-Academy-Signature`: HMAC SHA-256 signature of request body

**Request Body**: JSON event payload (see Webhook Configuration section)

**Response**:
```json
{
  "received": true,
  "eventId": "event_123"
}
```

**Example**:
```bash
curl -X POST https://solosuccess.ai/api/intel-academy/webhook \
  -H "Content-Type: application/json" \
  -H "X-Intel-Academy-Signature: abc123..." \
  -d '{"event":"course.completed","user_id":"user_123","data":{...}}'
```

### Subscription Sync Endpoint

#### POST /api/intel-academy/sync-subscription

Manually triggers subscription tier synchronization.

**Authentication**: Required (NextAuth session)

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "message": "Subscription synced successfully",
  "tier": "premium",
  "accessLevel": "enterprise"
}
```

**Example**:
```bash
curl -X POST https://solosuccess.ai/api/intel-academy/sync-subscription \
  -H "Cookie: next-auth.session-token=..."
```

### Cron Endpoints

#### GET /api/cron/process-webhooks

Processes pending webhook events.

**Authentication**: CRON_SECRET header

**Schedule**: Every 1 minute

**Headers**:
- `Authorization`: Bearer {CRON_SECRET}

**Response**:
```json
{
  "processed": 15,
  "failed": 2,
  "pending": 3
}
```

---

#### GET /api/cron/sync-intel-academy

Batch syncs all active integrations.

**Authentication**: CRON_SECRET header

**Schedule**: Daily at 2:00 AM UTC

**Headers**:
- `Authorization`: Bearer {CRON_SECRET}

**Response**:
```json
{
  "totalUsers": 150,
  "synced": 148,
  "failed": 2
}
```

---

#### GET /api/cron/cleanup-webhooks

Removes old processed webhook events.

**Authentication**: CRON_SECRET header

**Schedule**: Daily at 3:00 AM UTC

**Headers**:
- `Authorization`: Bearer {CRON_SECRET}

**Response**:
```json
{
  "deleted": 1250,
  "olderThan": "30 days"
}
```

## Troubleshooting Guide

### Common Issues

#### 1. OAuth Connection Fails

**Symptoms**:
- User redirected to dashboard with error message
- "Failed to connect Intel Academy" notification

**Possible Causes**:
- Invalid Client ID or Client Secret
- Incorrect redirect URI
- User denied authorization
- Network connectivity issues

**Solutions**:
```bash
# Verify environment variables
echo $INTEL_ACADEMY_CLIENT_ID
echo $INTEL_ACADEMY_REDIRECT_URI

# Check Vercel environment variables
vercel env ls

# Test API connectivity
curl https://api.intelacademy.com/health

# Review logs
vercel logs --follow
```

**Prevention**:
- Double-check credentials in Intel Academy developer portal
- Ensure redirect URI matches exactly (including protocol and trailing slash)
- Test OAuth flow in staging before production

---

#### 2. Webhooks Not Processing

**Symptoms**:
- Course progress not updating on dashboard
- Achievements not appearing
- `WebhookEvent` table has many pending events

**Possible Causes**:
- Cron job not running
- Invalid webhook signature
- Database connection issues
- Processing errors

**Solutions**:
```bash
# Check cron job status in Vercel dashboard
# Manually trigger cron job
curl https://solosuccess.ai/api/cron/process-webhooks \
  -H "Authorization: Bearer $CRON_SECRET"

# Check pending events
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"WebhookEvent\" WHERE status = 'pending';"

# Review failed events
psql $DATABASE_URL -c "SELECT * FROM \"WebhookEvent\" WHERE status = 'failed' ORDER BY \"createdAt\" DESC LIMIT 10;"

# Check webhook signature
# Verify INTEL_ACADEMY_WEBHOOK_SECRET matches Intel Academy configuration
```

**Prevention**:
- Monitor webhook processing metrics
- Set up alerts for high pending event count
- Regularly review failed events
- Test webhook signature verification

---

#### 3. Token Refresh Failures

**Symptoms**:
- Integration marked as inactive
- "Please reconnect Intel Academy" notification
- API calls returning 401 errors

**Possible Causes**:
- Refresh token expired or revoked
- User revoked access in Intel Academy
- Network issues during refresh
- Encryption key changed

**Solutions**:
```bash
# Check integration status
psql $DATABASE_URL -c "SELECT \"userId\", \"isActive\", \"tokenExpiry\", \"lastSyncAt\" FROM \"IntelAcademyIntegration\" WHERE \"isActive\" = false;"

# Test token refresh manually
# (Use admin script or API endpoint)

# Verify encryption key hasn't changed
echo $ENCRYPTION_KEY
```

**Prevention**:
- Monitor token refresh success rate
- Set up alerts for high refresh failure rate
- Implement proactive token refresh (before expiration)
- Log refresh failures with detailed error messages

---

#### 4. Subscription Sync Not Working

**Symptoms**:
- User upgraded subscription but still has old access level in Intel Academy
- Sync status shows "failed"

**Possible Causes**:
- Intel Academy API unavailable
- Invalid tier mapping
- Network timeout
- Rate limiting

**Solutions**:
```bash
# Manually trigger sync
curl -X POST https://solosuccess.ai/api/intel-academy/sync-subscription \
  -H "Cookie: next-auth.session-token=..."

# Check sync status
psql $DATABASE_URL -c "SELECT \"userId\", \"syncStatus\", \"lastSyncAt\" FROM \"IntelAcademyIntegration\" WHERE \"syncStatus\" = 'failed';"

# Review Stripe webhook logs
vercel logs --filter="stripe/webhook"

# Test Intel Academy API
curl https://api.intelacademy.com/v1/users/{user_id}/access \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Prevention**:
- Implement retry logic with exponential backoff
- Monitor sync success rate
- Set up alerts for sync failures
- Test tier mapping logic thoroughly

---

#### 5. Dashboard Widget Not Loading

**Symptoms**:
- Widget shows loading state indefinitely
- Error message in widget
- Console errors in browser

**Possible Causes**:
- API endpoint returning errors
- Network issues
- Invalid session
- CORS issues

**Solutions**:
```javascript
// Check browser console for errors
// Open DevTools → Console

// Test API endpoint directly
fetch('/api/intel-academy/status', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Check network tab for failed requests
// Open DevTools → Network → Filter by "intel-academy"

// Verify session is valid
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log);
```

**Prevention**:
- Implement proper error boundaries in React components
- Show cached data when API is unavailable
- Add retry logic for failed requests
- Monitor frontend error rates

---

### Debugging Tools

#### Database Queries

```sql
-- Check integration status
SELECT 
  "userId",
  "isActive",
  "syncStatus",
  "lastSyncAt",
  "tokenExpiry"
FROM "IntelAcademyIntegration"
ORDER BY "updatedAt" DESC;

-- Check pending webhooks
SELECT 
  "eventType",
  "status",
  "retryCount",
  "createdAt"
FROM "WebhookEvent"
WHERE "status" = 'pending'
ORDER BY "createdAt" ASC
LIMIT 50;

-- Check recent achievements
SELECT 
  u."email",
  a."achievementName",
  a."earnedAt"
FROM "IntelAcademyAchievement" a
JOIN "User" u ON u."id" = a."userId"
ORDER BY a."earnedAt" DESC
LIMIT 10;

-- Check course progress
SELECT 
  u."email",
  c."courseName",
  c."progress",
  c."status",
  c."lastAccessedAt"
FROM "IntelAcademyCourse" c
JOIN "User" u ON u."id" = c."userId"
WHERE c."status" = 'in_progress'
ORDER BY c."lastAccessedAt" DESC;
```

#### Log Analysis

```bash
# Filter logs by integration
vercel logs --filter="intel-academy"

# Follow logs in real-time
vercel logs --follow

# Search for errors
vercel logs --filter="error" --filter="intel-academy"

# Check specific endpoint
vercel logs --filter="/api/intel-academy/webhook"
```

#### Monitoring Queries

```bash
# Check integration health
curl https://solosuccess.ai/api/intel-academy/metrics \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
# {
#   "activeIntegrations": 150,
#   "connectionSuccessRate": 0.98,
#   "syncSuccessRate": 0.95,
#   "webhookProcessingSuccessRate": 0.99,
#   "pendingWebhookCount": 5
# }
```

### Getting Help

If you're unable to resolve an issue:

1. **Check Documentation**: Review this guide and the design document
2. **Search Logs**: Look for error messages in Vercel logs
3. **Check Status**: Verify Intel Academy API status
4. **Contact Support**: Reach out to Intel Academy support with:
   - Error messages
   - Timestamp of issue
   - User ID (if applicable)
   - Steps to reproduce

## Security Best Practices

### Token Security

1. **Never log tokens**: Ensure tokens are not written to logs
2. **Encrypt at rest**: All tokens encrypted in database
3. **Rotate secrets**: Regularly rotate encryption keys and webhook secrets
4. **Use HTTPS**: All API calls over secure connections
5. **Validate signatures**: Always verify webhook signatures

### Access Control

1. **Session validation**: All endpoints require valid NextAuth session
2. **User isolation**: Users can only access their own integration data
3. **Admin endpoints**: Cron endpoints protected with CRON_SECRET
4. **Rate limiting**: Prevent abuse with per-user rate limits

### Monitoring

1. **Security events**: Log all signature verification failures
2. **Suspicious activity**: Alert on unusual patterns
3. **Token theft**: Monitor for token reuse from different IPs
4. **Failed attempts**: Track failed OAuth and API attempts

## Performance Optimization

### Caching

- Integration status: 1 minute TTL
- Course data: 5 minutes TTL
- Achievement data: 5 minutes TTL
- Invalidate on webhook events

### Database

- Use connection pooling
- Index frequently queried fields
- Monitor slow queries
- Implement query result caching

### API

- Batch requests where possible
- Implement request deduplication
- Use conditional requests (ETags)
- Compress response payloads

## Maintenance

### Regular Tasks

#### Daily
- Review failed webhook events
- Check sync success rates
- Monitor error rates
- Review security events

#### Weekly
- Analyze performance metrics
- Review slow database queries
- Check cache hit rates
- Update documentation

#### Monthly
- Rotate webhook secrets
- Review and update rate limits
- Analyze user engagement metrics
- Plan feature enhancements

### Monitoring Checklist

- [ ] Active integration count
- [ ] Connection success rate (target: >95%)
- [ ] Sync success rate (target: >90%)
- [ ] Webhook processing success rate (target: >99%)
- [ ] API error rate (target: <5%)
- [ ] Average API response time (target: <500ms)
- [ ] Pending webhook count (target: <100)
- [ ] Failed events requiring manual intervention

## Support

For technical support or questions:

- **Documentation**: https://docs.solosuccess.ai/integrations/intel-academy
- **API Reference**: https://docs.solosuccess.ai/api
- **Email**: support@solosuccess.ai
- **Slack**: #intel-academy-integration

For Intel Academy API issues:

- **Developer Portal**: https://developer.intelacademy.com
- **API Documentation**: https://developer.intelacademy.com/docs
- **Support**: api-support@intelacademy.com
