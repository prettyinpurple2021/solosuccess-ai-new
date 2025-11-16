# Intel Academy Integration - Deployment Checklist

## Pre-Deployment Checklist

### 1. Intel Academy Developer Portal Setup

- [ ] Application registered in Intel Academy Developer Portal
- [ ] Client ID obtained
- [ ] Client Secret obtained
- [ ] Redirect URI configured: `https://solosuccess.ai/api/intel-academy/callback`
- [ ] Webhook URL configured: `https://solosuccess.ai/api/intel-academy/webhook`
- [ ] Required scopes enabled:
  - [ ] `user:read`
  - [ ] `courses:read`
  - [ ] `achievements:read`
- [ ] Webhook secret obtained
- [ ] API rate limits confirmed (100 req/min)

### 2. Environment Variables Configuration

#### Generate Secrets

Run these commands to generate required secrets:

```bash
# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Generate ENCRYPTION_KEY (must be exactly 32 bytes)
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"

# Generate CRON_SECRET
CRON_SECRET=$(openssl rand -base64 32)
echo "CRON_SECRET=$CRON_SECRET"
```

#### Vercel Environment Variables

Set the following in Vercel Dashboard (Settings → Environment Variables):

**Production Environment:**

- [ ] `INTEL_ACADEMY_API_URL` = `https://api.intelacademy.com`
- [ ] `INTEL_ACADEMY_CLIENT_ID` = `[from Intel Academy portal]`
- [ ] `INTEL_ACADEMY_CLIENT_SECRET` = `[from Intel Academy portal]`
- [ ] `INTEL_ACADEMY_REDIRECT_URI` = `https://solosuccess.ai/api/intel-academy/callback`
- [ ] `INTEL_ACADEMY_WEBHOOK_SECRET` = `[from Intel Academy portal]`
- [ ] `JWT_SECRET` = `[generated above]`
- [ ] `ENCRYPTION_KEY` = `[generated above]`
- [ ] `CRON_SECRET` = `[generated above]`

**Optional Variables:**

- [ ] `INTEL_ACADEMY_RATE_LIMIT` = `100` (default)
- [ ] `INTEL_ACADEMY_RATE_WINDOW` = `60000` (default)
- [ ] `CACHE_TTL` = `300` (default)
- [ ] `REDIS_URL` = `[if using Redis caching]`

**Preview/Development Environments:**

- [ ] Same variables configured for preview deployments
- [ ] Use staging Intel Academy credentials if available
- [ ] Use different redirect URI for preview: `https://[preview-url]/api/intel-academy/callback`

#### Verify Environment Variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally for testing
vercel env pull .env.local
```

### 3. Database Migration

- [ ] Review migration file: `prisma/migrations/[timestamp]_intel_academy_integration/migration.sql`
- [ ] Backup production database
- [ ] Run migration in staging environment first
- [ ] Verify tables created:
  ```bash
  psql $DATABASE_URL -c "\dt" | grep -i "intelacademy\|webhook"
  ```
- [ ] Verify indexes created:
  ```bash
  psql $DATABASE_URL -c "\di" | grep -i "intelacademy\|webhook"
  ```
- [ ] Run migration in production:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Verify migration success:
  ```bash
  npx prisma migrate status
  ```

**Expected Tables:**
- `IntelAcademyIntegration`
- `IntelAcademyCourse`
- `IntelAcademyAchievement`
- `WebhookEvent`

### 4. Vercel Cron Jobs Configuration

- [ ] Verify `vercel.json` includes cron configuration:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/process-webhooks",
        "schedule": "* * * * *"
      },
      {
        "path": "/api/cron/sync-intel-academy",
        "schedule": "0 2 * * *"
      },
      {
        "path": "/api/cron/cleanup-webhooks",
        "schedule": "0 3 * * *"
      }
    ]
  }
  ```
- [ ] Deploy to Vercel
- [ ] Verify cron jobs appear in Vercel Dashboard (Settings → Cron Jobs)
- [ ] Test cron job execution:
  ```bash
  curl https://solosuccess.ai/api/cron/process-webhooks \
    -H "Authorization: Bearer $CRON_SECRET"
  ```

### 5. Code Deployment

- [ ] All code merged to main branch
- [ ] Build passes locally:
  ```bash
  npm run build
  ```
- [ ] TypeScript compilation successful:
  ```bash
  npx tsc --noEmit
  ```
- [ ] Linting passes:
  ```bash
  npm run lint
  ```
- [ ] No console errors or warnings
- [ ] Deploy to Vercel:
  ```bash
  vercel --prod
  ```
- [ ] Deployment successful
- [ ] Build logs reviewed for errors

## Post-Deployment Verification

### 1. Endpoint Accessibility

Test all endpoints are accessible:

```bash
# OAuth endpoints
curl -I https://solosuccess.ai/api/intel-academy/auth
# Expected: 307 Redirect (requires auth)

curl -I https://solosuccess.ai/api/intel-academy/callback
# Expected: 400 Bad Request (missing code)

curl -I https://solosuccess.ai/api/intel-academy/status
# Expected: 401 Unauthorized (requires auth)

# Webhook endpoint
curl -I https://solosuccess.ai/api/intel-academy/webhook
# Expected: 405 Method Not Allowed (GET not allowed)

curl -X POST https://solosuccess.ai/api/intel-academy/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Expected: 401 Unauthorized (invalid signature)

# Cron endpoints
curl https://solosuccess.ai/api/cron/process-webhooks \
  -H "Authorization: Bearer invalid"
# Expected: 401 Unauthorized

curl https://solosuccess.ai/api/cron/process-webhooks \
  -H "Authorization: Bearer $CRON_SECRET"
# Expected: 200 OK with processing summary
```

**Checklist:**
- [ ] `/api/intel-academy/auth` - Accessible
- [ ] `/api/intel-academy/callback` - Accessible
- [ ] `/api/intel-academy/status` - Accessible
- [ ] `/api/intel-academy/redirect` - Accessible
- [ ] `/api/intel-academy/disconnect` - Accessible
- [ ] `/api/intel-academy/webhook` - Accessible
- [ ] `/api/intel-academy/sync-subscription` - Accessible
- [ ] `/api/cron/process-webhooks` - Accessible with CRON_SECRET
- [ ] `/api/cron/sync-intel-academy` - Accessible with CRON_SECRET
- [ ] `/api/cron/cleanup-webhooks` - Accessible with CRON_SECRET

### 2. Database Connectivity

- [ ] Application can connect to database
- [ ] Prisma client initialized successfully
- [ ] Query test successful:
  ```bash
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"IntelAcademyIntegration\";"
  ```
- [ ] No connection pool errors in logs

### 3. OAuth Flow Testing

**Test with Real User Account:**

1. **Initiate Connection:**
   - [ ] Log in to SoloSuccess AI
   - [ ] Navigate to dashboard
   - [ ] Click "Connect Intel Academy" button
   - [ ] Redirected to Intel Academy authorization page
   - [ ] URL includes correct client_id and redirect_uri
   - [ ] State parameter present in URL

2. **Authorization:**
   - [ ] Intel Academy login page loads correctly
   - [ ] Can log in with test account
   - [ ] Authorization consent screen displays
   - [ ] Requested scopes are correct
   - [ ] Can approve authorization

3. **Callback:**
   - [ ] Redirected back to SoloSuccess AI
   - [ ] Success message displayed
   - [ ] No error messages in console
   - [ ] Integration record created in database:
     ```sql
     SELECT * FROM "IntelAcademyIntegration" WHERE "userId" = '[test_user_id]';
     ```
   - [ ] Tokens encrypted in database (not plaintext)
   - [ ] `isActive` = true
   - [ ] `syncStatus` = 'synced'

4. **Dashboard Widget:**
   - [ ] Widget displays "Connected" status
   - [ ] Courses displayed (if enrolled)
   - [ ] Achievements displayed (if earned)
   - [ ] "Open Intel Academy" button visible
   - [ ] Last sync timestamp shown

5. **SSO Redirect:**
   - [ ] Click "Open Intel Academy" button
   - [ ] Redirected to Intel Academy
   - [ ] Automatically logged in (no login prompt)
   - [ ] Correct user account loaded

6. **Disconnection:**
   - [ ] Click "Disconnect" in settings
   - [ ] Confirmation dialog appears
   - [ ] Confirm disconnection
   - [ ] Success message displayed
   - [ ] Integration record deleted from database
   - [ ] Widget shows "Connect" button again

**OAuth Flow Checklist:**
- [ ] Connection flow completes successfully
- [ ] Tokens stored and encrypted
- [ ] Dashboard widget displays correctly
- [ ] SSO redirect works
- [ ] Disconnection works
- [ ] No errors in browser console
- [ ] No errors in server logs

### 4. Webhook Processing Testing

**Test Webhook Reception:**

1. **Send Test Webhook:**
   ```bash
   # Generate signature
   PAYLOAD='{"event":"course.enrolled","timestamp":"2024-01-15T10:00:00Z","user_id":"test_user","data":{"course_id":"test_course","course_name":"Test Course"}}'
   SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$INTEL_ACADEMY_WEBHOOK_SECRET" | cut -d' ' -f2)
   
   # Send webhook
   curl -X POST https://solosuccess.ai/api/intel-academy/webhook \
     -H "Content-Type: application/json" \
     -H "X-Intel-Academy-Signature: $SIGNATURE" \
     -d "$PAYLOAD"
   ```

2. **Verify Storage:**
   ```sql
   SELECT * FROM "WebhookEvent" 
   WHERE "eventType" = 'course.enrolled' 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

3. **Trigger Processing:**
   ```bash
   curl https://solosuccess.ai/api/cron/process-webhooks \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

4. **Verify Processing:**
   ```sql
   SELECT * FROM "WebhookEvent" 
   WHERE "status" = 'processed' 
   ORDER BY "processedAt" DESC 
   LIMIT 1;
   ```

**Webhook Checklist:**
- [ ] Webhook received successfully (200 OK)
- [ ] Event stored in database with 'pending' status
- [ ] Signature verification works
- [ ] Invalid signature rejected (401)
- [ ] Cron job processes event
- [ ] Event status updated to 'processed'
- [ ] Database records updated correctly
- [ ] User notification sent (if applicable)

### 5. Subscription Sync Testing

**Test Subscription Change:**

1. **Trigger Subscription Change:**
   - [ ] Use Stripe test mode
   - [ ] Create test subscription
   - [ ] Upgrade subscription tier
   - [ ] Verify Stripe webhook received

2. **Verify Sync Triggered:**
   ```bash
   # Check logs for sync activity
   vercel logs --filter="subscription-sync"
   ```

3. **Verify Database Updated:**
   ```sql
   SELECT "syncStatus", "lastSyncAt" 
   FROM "IntelAcademyIntegration" 
   WHERE "userId" = '[test_user_id]';
   ```

4. **Verify Intel Academy Updated:**
   - [ ] Check user access level in Intel Academy
   - [ ] Verify tier mapping correct:
     - free → basic
     - accelerator → premium
     - premium → enterprise

**Subscription Sync Checklist:**
- [ ] Stripe webhook triggers sync
- [ ] Sync completes successfully
- [ ] Database updated with lastSyncAt
- [ ] Intel Academy access level updated
- [ ] Retry logic works on failure
- [ ] User notified of sync completion

### 6. Cron Jobs Verification

**Process Webhooks Cron (Every 1 minute):**

- [ ] Cron job appears in Vercel dashboard
- [ ] Executes every minute
- [ ] Processes pending events
- [ ] Logs show successful execution
- [ ] No timeout errors
- [ ] Metrics endpoint shows processing:
  ```bash
  curl https://solosuccess.ai/api/intel-academy/metrics \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  ```

**Daily Sync Cron (2:00 AM UTC):**

- [ ] Cron job appears in Vercel dashboard
- [ ] Schedule set to "0 2 * * *"
- [ ] Test manual execution:
  ```bash
  curl https://solosuccess.ai/api/cron/sync-intel-academy \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
- [ ] Processes all active integrations
- [ ] Completes within reasonable time (<5 minutes)
- [ ] Logs show successful execution

**Cleanup Cron (3:00 AM UTC):**

- [ ] Cron job appears in Vercel dashboard
- [ ] Schedule set to "0 3 * * *"
- [ ] Test manual execution:
  ```bash
  curl https://solosuccess.ai/api/cron/cleanup-webhooks \
    -H "Authorization: Bearer $CRON_SECRET"
  ```
- [ ] Deletes events older than 30 days
- [ ] Logs show deletion count
- [ ] No errors in execution

### 7. Security Verification

**Token Encryption:**
- [ ] Tokens encrypted in database (not plaintext)
- [ ] Encryption key set correctly
- [ ] Decryption works for API calls
- [ ] No tokens in application logs

**Webhook Security:**
- [ ] Signature verification working
- [ ] Invalid signatures rejected
- [ ] Security events logged for failures
- [ ] Source IP captured in logs

**Access Control:**
- [ ] Endpoints require authentication
- [ ] Users can only access own data
- [ ] Cron endpoints require CRON_SECRET
- [ ] Rate limiting active

**HTTPS:**
- [ ] All endpoints use HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate valid

### 8. Performance Testing

**Load Testing:**
- [ ] Dashboard loads in <2 seconds
- [ ] Widget loads in <1 second
- [ ] API endpoints respond in <500ms
- [ ] Webhook endpoint responds in <3 seconds
- [ ] No timeout errors under normal load

**Database Performance:**
- [ ] Queries execute in <100ms
- [ ] Indexes being used (check EXPLAIN)
- [ ] No slow query warnings
- [ ] Connection pool not exhausted

**Caching:**
- [ ] Cache headers set correctly
- [ ] Data cached for 5 minutes
- [ ] Cache invalidated on updates
- [ ] Cache hit rate >80%

### 9. Monitoring Setup

**Sentry Configuration:**
- [ ] Sentry DSN configured
- [ ] Error tracking active
- [ ] Source maps uploaded
- [ ] Test error captured:
  ```javascript
  Sentry.captureException(new Error('Test error'));
  ```

**Metrics Endpoint:**
- [ ] `/api/intel-academy/metrics` accessible
- [ ] Returns current metrics
- [ ] All metrics populated
- [ ] No errors in response

**Alerts Configured:**
- [ ] High error rate alert (>5%)
- [ ] Webhook processing delay alert (>5 min)
- [ ] Sync failure alert (>20% failure rate)
- [ ] Token refresh failure alert
- [ ] Security event alert

### 10. Documentation

- [ ] Integration documentation published
- [ ] API documentation updated
- [ ] Deployment checklist completed
- [ ] Troubleshooting guide available
- [ ] Support team trained
- [ ] User guide updated

## Rollback Plan

If critical issues are discovered:

### Immediate Rollback Steps

1. **Revert Deployment:**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Disable Cron Jobs:**
   - [ ] Disable in Vercel dashboard
   - [ ] Or remove from vercel.json and redeploy

3. **Disable Integration:**
   - [ ] Add feature flag to disable integration
   - [ ] Hide widget from dashboard
   - [ ] Return 503 from endpoints

4. **Database Rollback (if needed):**
   ```bash
   # Restore from backup
   pg_restore -d $DATABASE_URL backup.sql
   ```

5. **Notify Users:**
   - [ ] Send notification about temporary unavailability
   - [ ] Update status page
   - [ ] Provide ETA for fix

### Rollback Verification

- [ ] Previous version deployed
- [ ] Application functioning normally
- [ ] No integration-related errors
- [ ] Users notified
- [ ] Incident documented

## Post-Deployment Monitoring

### First 24 Hours

Monitor these metrics closely:

- [ ] Error rate (<1%)
- [ ] Connection success rate (>95%)
- [ ] Webhook processing success rate (>99%)
- [ ] API response time (<500ms)
- [ ] Database query performance
- [ ] User feedback/complaints

### First Week

- [ ] Review all error logs
- [ ] Analyze user adoption rate
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Identify optimization opportunities
- [ ] Plan improvements

### First Month

- [ ] Comprehensive performance review
- [ ] Security audit
- [ ] Cost analysis
- [ ] User satisfaction survey
- [ ] Feature enhancement planning

## Sign-Off

### Deployment Team

- [ ] **Developer**: Code deployed and tested - _________________ Date: _______
- [ ] **DevOps**: Infrastructure configured - _________________ Date: _______
- [ ] **QA**: Testing completed successfully - _________________ Date: _______
- [ ] **Product**: Feature approved for release - _________________ Date: _______
- [ ] **Security**: Security review passed - _________________ Date: _______

### Production Readiness

- [ ] All pre-deployment checks completed
- [ ] All post-deployment verifications passed
- [ ] Monitoring and alerts configured
- [ ] Documentation complete
- [ ] Rollback plan tested
- [ ] Team trained and ready

**Deployment Date**: _________________

**Deployed By**: _________________

**Production URL**: https://solosuccess.ai

**Status**: ☐ Success ☐ Partial ☐ Rollback Required

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
