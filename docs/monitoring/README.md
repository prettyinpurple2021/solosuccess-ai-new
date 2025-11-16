# Intel Academy Integration - Monitoring Guide

## Overview

This guide provides comprehensive information about monitoring the Intel Academy integration, including setup, configuration, metrics, alerts, and troubleshooting.

## Quick Start

### 1. Setup Monitoring

```bash
# Make setup script executable
chmod +x scripts/setup-monitoring.sh

# Run setup script
./scripts/setup-monitoring.sh
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
SENTRY_AUTH_TOKEN=[your_auth_token]
SENTRY_ORG=[your_org_name]
SENTRY_PROJECT=[your_project_name]
```

### 3. Test Monitoring

```bash
# Run monitoring tests
npm run test:monitoring

# Or with ts-node
npx ts-node scripts/test-monitoring.ts
```

### 4. Verify Setup

1. Check Sentry dashboard for test events
2. Verify metrics endpoint: `GET /api/intel-academy/metrics`
3. Test alert notifications
4. Review monitoring dashboard

## Documentation

### Core Documents

- **[Alert Configuration](./intel-academy-alerts.md)** - Complete alert rules and thresholds
- **[Integration Documentation](../integrations/intel-academy.md)** - Full integration guide
- **[Deployment Checklist](../deployment/intel-academy-deployment-checklist.md)** - Deployment verification

### Key Topics

#### Metrics

The integration tracks the following metric categories:

- **Connection Metrics**: OAuth connection success/failure rates
- **Token Metrics**: Token refresh success/failure rates
- **Sync Metrics**: Subscription synchronization performance
- **Webhook Metrics**: Webhook processing performance and reliability
- **API Metrics**: Intel Academy API call performance
- **Security Metrics**: Security events and signature verification failures
- **SSO Metrics**: Single sign-on redirect tracking

See [Alert Configuration](./intel-academy-alerts.md#custom-metrics) for complete metric list.

#### Alerts

Alert priorities:

- **Critical**: Immediate response required (PagerDuty + Slack + Email)
- **High**: Response within 1 hour (Slack + Email)
- **Medium**: Response within 4 hours (Slack)
- **Low**: Daily review (Monitoring report)

See [Alert Configuration](./intel-academy-alerts.md#alert-rules) for complete alert rules.

#### Dashboards

Two monitoring dashboards are available:

1. **Sentry Dashboard**: Real-time metrics and error tracking
2. **Metrics API**: `/api/intel-academy/metrics` for custom dashboards

See [Alert Configuration](./intel-academy-alerts.md#monitoring-dashboard) for dashboard configuration.

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │  API Routes  │  │  Components  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│              ┌─────────────────────────┐                     │
│              │  Monitoring Library     │                     │
│              │  - Track Events         │                     │
│              │  - Capture Errors       │                     │
│              │  - Measure Performance  │                     │
│              └─────────────┬───────────┘                     │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │       Sentry             │
              │  - Error Tracking        │
              │  - Performance Monitoring│
              │  - Custom Metrics        │
              │  - Alerts                │
              └──────────┬───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐     ┌─────────┐    ┌──────────┐
    │ Slack  │     │  Email  │    │ PagerDuty│
    └────────┘     └─────────┘    └──────────┘
```

## Monitoring Library Usage

### Import

```typescript
import {
  trackIntegrationEvent,
  trackConnectionAttempt,
  trackTokenRefresh,
  trackSubscriptionSync,
  trackWebhookProcessing,
  trackApiCall,
  trackSecurityEvent,
  IntegrationEventType,
} from '@/lib/monitoring/intel-academy-monitoring';
```

### Track Events

```typescript
// Track connection attempt
trackConnectionAttempt(userId, success, error);

// Track token refresh
trackTokenRefresh(userId, success, error);

// Track subscription sync
trackSubscriptionSync(userId, tier, success, duration, error);

// Track webhook processing
trackWebhookProcessing(eventType, eventId, success, duration, retryCount, error);

// Track API call
trackApiCall(endpoint, method, statusCode, duration, userId);

// Track security event
trackSecurityEvent('signature_failed', {
  sourceIp: '192.168.1.1',
  reason: 'Invalid signature',
});
```

### Monitor Operations

```typescript
import { monitorOperation } from '@/lib/monitoring/intel-academy-monitoring';

// Automatically track performance and errors
const result = await monitorOperation(
  'subscription_sync',
  async () => {
    // Your operation here
    return await syncSubscription(userId, tier);
  },
  userId,
  (error) => {
    // Optional error handler
    console.error('Sync failed:', error);
  }
);
```

### Create Performance Transactions

```typescript
import { createPerformanceTransaction } from '@/lib/monitoring/intel-academy-monitoring';

const transaction = createPerformanceTransaction('oauth_flow', 'auth', userId);

try {
  // Your code here
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## Accessing Metrics

### Metrics API Endpoint

```bash
# Get metrics as JSON
curl https://solosuccess.ai/api/intel-academy/metrics \
  -H "Cookie: next-auth.session-token=..."

# Get metrics in Prometheus format
curl https://solosuccess.ai/api/intel-academy/metrics?format=prometheus \
  -H "Cookie: next-auth.session-token=..."
```

### Response Format

```json
{
  "success": true,
  "metrics": {
    "activeIntegrations": 150,
    "connectionSuccessRate": 0.98,
    "syncSuccessRate": 0.95,
    "webhookProcessingSuccessRate": 0.99,
    "apiErrorRate": 0.02,
    "averageApiResponseTime": 450,
    "pendingWebhookCount": 5,
    "rateLimitHitsToday": 2
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## Alert Response Procedures

### Critical Alerts

1. **Acknowledge** alert in PagerDuty/Slack
2. **Assess** severity and impact
3. **Investigate** using Sentry and logs
4. **Mitigate** with immediate fixes or workarounds
5. **Resolve** with permanent fix
6. **Document** incident and root cause

### High Priority Alerts

1. **Acknowledge** alert in Slack
2. **Review** error logs and metrics
3. **Investigate** root cause
4. **Fix** within 1 hour
5. **Monitor** for recurrence

### Medium/Low Priority Alerts

1. **Review** during daily monitoring
2. **Investigate** when time permits
3. **Plan** fixes for next sprint
4. **Document** patterns and trends

## Daily Monitoring Routine

### Morning (9:00 AM)

- [ ] Check Sentry dashboard
- [ ] Review overnight errors
- [ ] Verify cron jobs executed
- [ ] Check pending webhook count
- [ ] Review security events

### Afternoon (2:00 PM)

- [ ] Review API performance
- [ ] Check sync success rate
- [ ] Monitor rate limit usage
- [ ] Review user feedback

### Evening (5:00 PM)

- [ ] Review daily metrics
- [ ] Document incidents
- [ ] Update runbooks
- [ ] Brief on-call engineer

## Troubleshooting

### High Error Rate

1. Check Sentry for error details
2. Review recent deployments
3. Verify Intel Academy API status
4. Check database performance
5. Review rate limiting

### Webhook Processing Delays

1. Check cron job execution
2. Review pending event count
3. Check database performance
4. Manually trigger processing
5. Scale resources if needed

### Security Events

1. Review source IP and patterns
2. Check for known attackers
3. Verify webhook secret
4. Consider IP blocking
5. Alert security team

## Best Practices

### Monitoring

- Review metrics daily
- Set up automated alerts
- Document all incidents
- Update runbooks regularly
- Train team on procedures

### Performance

- Monitor response times
- Optimize slow queries
- Implement caching
- Use connection pooling
- Batch API requests

### Security

- Monitor signature failures
- Track unauthorized access
- Review security events
- Rotate secrets regularly
- Audit access logs

## Resources

### Internal

- [Integration Documentation](../integrations/intel-academy.md)
- [Deployment Checklist](../deployment/intel-academy-deployment-checklist.md)
- [Alert Configuration](./intel-academy-alerts.md)

### External

- [Sentry Documentation](https://docs.sentry.io/)
- [Intel Academy API Docs](https://developer.intelacademy.com/docs)
- [Vercel Monitoring](https://vercel.com/docs/concepts/observability)

### Support

- **Engineering**: #intel-academy-dev
- **On-Call**: oncall@solosuccess.ai
- **Security**: security@solosuccess.ai
- **Intel Academy**: api-support@intelacademy.com

## Contributing

To improve monitoring:

1. Add new metrics as needed
2. Update alert thresholds based on data
3. Enhance dashboards with new widgets
4. Document new patterns and issues
5. Share learnings with team

## Changelog

### 2024-01-15

- Initial monitoring setup
- Created alert rules
- Configured Sentry integration
- Added metrics endpoint
- Created monitoring library
- Documented procedures
