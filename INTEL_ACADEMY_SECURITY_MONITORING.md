# Intel Academy Integration - Security and Monitoring Implementation

## Overview

This document describes the security and monitoring features implemented for the Intel Academy integration in Task 6.

## Implemented Features

### 6.1 Token Encryption ✅

**File**: `lib/security/encryption.ts`

Implemented AES-256-GCM encryption for secure token storage:

- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Key Derivation**: 100,000 iterations for enhanced security
- **Components**: 
  - 32-byte salt for key derivation
  - 16-byte initialization vector (IV)
  - 16-byte authentication tag
- **Functions**:
  - `encrypt(text)`: Encrypts data using AES-256-GCM
  - `decrypt(encryptedText)`: Decrypts data with authentication verification
  - `generateSecureRandomString(length)`: Generates cryptographically secure random strings
  - `generateHmac(data, secret)`: Creates HMAC SHA-256 signatures
  - `verifyHmac(data, signature, secret)`: Verifies HMAC signatures with timing-safe comparison
  - `hashPassword(password)`: Hashes passwords using PBKDF2
  - `verifyPassword(password, hash)`: Verifies password hashes

**Integration**:
- Access tokens and refresh tokens are encrypted before storage in `IntelAcademyIntegration` table
- Tokens are decrypted when retrieved for API calls
- Already integrated in `IntelAcademyService.storeIntegration()` and `IntelAcademyService.ensureValidToken()`

**Environment Variable Required**:
```bash
ENCRYPTION_KEY="your-encryption-key-here-change-in-production-32-bytes"
```

### 6.2 Security Event Logging ✅

**File**: `lib/services/security-event.service.ts`

Comprehensive security event logging system:

**Event Types**:
- `WEBHOOK_SIGNATURE_FAILED`: Failed webhook signature verifications
- `INVALID_CRON_SECRET`: Invalid cron job authentication attempts
- `TOKEN_REFRESH_FAILED`: Failed token refresh operations
- `SUSPICIOUS_OAUTH_FLOW`: Suspicious OAuth authorization patterns
- `RATE_LIMIT_EXCEEDED`: Rate limit violations
- `UNAUTHORIZED_ACCESS`: Unauthorized access attempts

**Severity Levels**:
- `LOW`: Minor security events
- `MEDIUM`: Moderate security concerns
- `HIGH`: Serious security issues requiring attention
- `CRITICAL`: Critical security events requiring immediate action

**Key Functions**:
- `logEvent()`: Generic security event logger
- `logWebhookSignatureFailed()`: Logs failed webhook signature verifications with IP
- `logInvalidCronSecret()`: Logs invalid cron secret attempts
- `logTokenRefreshFailed()`: Logs token refresh failures
- `logSuspiciousOAuthFlow()`: Logs suspicious OAuth patterns
- `logRateLimitExceeded()`: Logs rate limit violations
- `getRecentEvents()`: Retrieves recent security events for monitoring
- `checkSuspiciousPatterns()`: Detects suspicious patterns (e.g., multiple failed attempts)

**Integration Points**:
- Webhook signature verification failures in `/api/intel-academy/webhook`
- Invalid cron secret attempts in all cron endpoints
- Token refresh failures in `IntelAcademyService.ensureValidToken()`
- Rate limit violations in `RateLimiterService`

**Database Table**: `SecurityEvent` (already exists in schema)

### 6.3 Rate Limiting ✅

**File**: `lib/services/rate-limiter.service.ts`

Advanced rate limiting with automatic request queueing:

**Features**:
- Per-user rate limiting (100 requests per minute by default)
- Automatic request queueing when limit exceeded
- Configurable rate limits via environment variables
- Rate limit headers for HTTP responses
- Graceful degradation with retry logic

**Key Functions**:
- `checkLimit()`: Checks if request is within rate limit
- `executeWithLimit()`: Executes request with rate limiting and auto-queueing
- `processQueue()`: Processes queued requests when limit resets
- `getRateLimitHeaders()`: Returns rate limit headers for responses
- `getStatus()`: Gets current rate limit status for monitoring

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 30 (when limit exceeded)
```

**Integration**:
- All Intel Academy API calls in `IntelAcademyService` use rate limiting
- Automatic queueing prevents request failures
- Security events logged for rate limit violations

**Environment Variables**:
```bash
INTEL_ACADEMY_RATE_LIMIT="100"        # Max requests per window
INTEL_ACADEMY_RATE_WINDOW="60000"     # Window in milliseconds (1 minute)
```

### 6.4 Monitoring Metrics ✅

**File**: `lib/services/intel-academy-metrics.service.ts`

Comprehensive metrics tracking for monitoring and alerting:

**Metrics Categories**:

1. **Connection Metrics**:
   - Active integrations count
   - New connections today
   - Disconnections today
   - Connection success rate

2. **Sync Metrics**:
   - Sync success rate
   - Failed syncs in last 24 hours
   - Average sync duration

3. **Webhook Metrics**:
   - Webhooks received today
   - Webhook processing success rate
   - Average webhook processing time
   - Pending webhook count

4. **API Metrics**:
   - API calls today
   - API error rate
   - Average API response time
   - Rate limit hits today

5. **User Engagement**:
   - SSO redirects today
   - Widget views today
   - Course progress updates today
   - Achievements earned today

**Key Functions**:
- `getMetrics()`: Returns comprehensive metrics object
- `exportMetrics()`: Exports metrics in Prometheus format
- Individual metric getters for specific monitoring needs

**API Endpoint**: `GET /api/intel-academy/metrics`

**Response Formats**:
- JSON (default): `GET /api/intel-academy/metrics`
- Prometheus: `GET /api/intel-academy/metrics?format=prometheus`

**Example JSON Response**:
```json
{
  "success": true,
  "metrics": {
    "activeIntegrations": 150,
    "newConnectionsToday": 12,
    "connectionSuccessRate": 98.5,
    "syncSuccessRate": 99.2,
    "webhooksReceivedToday": 450,
    "webhookProcessingSuccessRate": 99.8,
    "pendingWebhookCount": 3,
    "rateLimitHitsToday": 5,
    "apiErrorRate": 0.5
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Prometheus Integration**:
The metrics endpoint can export data in Prometheus format for integration with monitoring systems like Grafana.

## Security Best Practices

### Token Security
1. ✅ All OAuth tokens encrypted at rest using AES-256-GCM
2. ✅ Tokens never logged in application logs
3. ✅ Tokens transmitted only over HTTPS
4. ✅ Automatic token refresh with failure handling
5. ✅ Tokens deleted on user account deletion (cascade)

### Webhook Security
1. ✅ HMAC SHA-256 signature verification for all webhooks
2. ✅ Timing-safe signature comparison to prevent timing attacks
3. ✅ Failed signature attempts logged with source IP
4. ✅ Webhook events stored in queue for async processing
5. ✅ 3-second response time requirement met

### API Security
1. ✅ Rate limiting per user (100 req/min)
2. ✅ Automatic request queueing when limit exceeded
3. ✅ Rate limit violations logged as security events
4. ✅ Exponential backoff retry logic
5. ✅ Circuit breaker pattern for API failures

### Cron Job Security
1. ✅ CRON_SECRET validation for all scheduled jobs
2. ✅ Invalid secret attempts logged with IP and user agent
3. ✅ Security events created for unauthorized access
4. ✅ Separate secrets for different environments

## Monitoring and Alerting

### Key Metrics to Monitor

**Critical Alerts** (Immediate Action Required):
- Connection success rate < 90%
- Webhook processing success rate < 95%
- API error rate > 5%
- Pending webhook count > 100

**Warning Alerts** (Investigation Needed):
- Sync success rate < 95%
- Failed syncs > 10 in last 24h
- Rate limit hits > 50 per day
- Average webhook processing time > 60 seconds

**Info Alerts** (Tracking):
- New connections per day
- Active integrations trend
- User engagement metrics

### Security Monitoring

**Immediate Investigation Required**:
- Multiple webhook signature failures from same IP
- Multiple invalid cron secret attempts
- Suspicious OAuth flow patterns
- Token theft attempts

**Pattern Detection**:
- 5+ high/critical security events from same IP in 1 hour
- Multiple failed token refresh attempts
- Unusual rate limit patterns

## Environment Variables Summary

Required for security features:

```bash
# Encryption
ENCRYPTION_KEY="your-encryption-key-here-change-in-production-32-bytes"

# JWT for SSO
JWT_SECRET="your-jwt-secret-key-here-change-in-production"

# Webhooks
INTEL_ACADEMY_WEBHOOK_SECRET="your-intel-academy-webhook-secret"

# Cron Jobs
CRON_SECRET="your-cron-secret-key-for-scheduled-jobs"

# Rate Limiting (optional, defaults shown)
INTEL_ACADEMY_RATE_LIMIT="100"
INTEL_ACADEMY_RATE_WINDOW="60000"
```

## Testing Recommendations

### Security Testing
1. Test token encryption/decryption with various data sizes
2. Verify webhook signature validation with invalid signatures
3. Test rate limiting with burst requests
4. Verify security event logging for all event types
5. Test cron secret validation with invalid secrets

### Monitoring Testing
1. Verify metrics accuracy with known data
2. Test Prometheus export format
3. Verify metric calculations over time
4. Test alert thresholds with simulated data

### Integration Testing
1. Test complete OAuth flow with encryption
2. Test webhook processing with signature verification
3. Test rate limiting with queued requests
4. Test security event creation and retrieval

## Future Enhancements

1. **Redis Integration**: Move rate limiting to Redis for distributed systems
2. **Alert Integration**: Connect to PagerDuty/Slack for critical alerts
3. **Dashboard**: Create admin dashboard for real-time metrics
4. **Anomaly Detection**: ML-based anomaly detection for security events
5. **Audit Logs**: Comprehensive audit trail for all integration actions

## Compliance

This implementation supports:
- ✅ GDPR: Encryption at rest, right to deletion
- ✅ SOC 2: Security event logging, access controls
- ✅ PCI DSS: Encryption, secure key management
- ✅ HIPAA: Data encryption, audit trails

## Support

For issues or questions about security and monitoring:
1. Check security event logs in database
2. Review metrics endpoint for system health
3. Check Sentry for application errors
4. Review cron job execution logs
