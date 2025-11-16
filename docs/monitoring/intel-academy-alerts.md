# Intel Academy Integration - Monitoring & Alerts Configuration

## Overview

This document describes the monitoring setup and alert configuration for the Intel Academy integration. It includes Sentry configuration, custom metrics, alert thresholds, and dashboard setup.

## Sentry Configuration

### Project Setup

1. **Create Sentry Project**
   - Log in to Sentry dashboard
   - Create new project: "SoloSuccess AI - Intel Academy Integration"
   - Platform: Next.js
   - Copy DSN

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
   SENTRY_AUTH_TOKEN=[auth_token]
   SENTRY_ORG=[org_name]
   SENTRY_PROJECT=solosuccess-intel-academy
   ```

3. **Enable Integrations**
   - Performance Monitoring
   - Session Replay
   - Error Tracking
   - Custom Metrics

### Sentry Tags

The following tags are automatically added to all Intel Academy events:

- `integration`: "intel_academy"
- `user_id`: User ID (when available)
- `operation`: Type of operation (oauth, sync, webhook, etc.)
- `environment`: production/staging/development

### Sensitive Data Filtering

The following data is automatically filtered from Sentry reports:

- OAuth tokens (access_token, refresh_token)
- API keys and secrets
- User passwords
- Database URLs
- Encryption keys
- Webhook signatures

## Custom Metrics

### Connection Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.connection.success_rate` | Rate | Successful OAuth connections | < 90% |
| `intel_academy.connection.failure_rate` | Rate | Failed OAuth connections | > 10% |
| `intel_academy.connection.initiated` | Counter | Total connection attempts | N/A |
| `intel_academy.disconnection` | Counter | Total disconnections | N/A |

### Token Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.token.refresh.success` | Counter | Successful token refreshes | N/A |
| `intel_academy.token.refresh.failed` | Counter | Failed token refreshes | > 15% |
| `intel_academy.token.expired` | Counter | Expired tokens | N/A |

### Sync Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.sync.success_rate` | Rate | Successful subscription syncs | < 80% |
| `intel_academy.sync.failure_rate` | Rate | Failed subscription syncs | > 20% |
| `intel_academy.sync.duration` | Distribution | Sync operation duration (ms) | > 10000ms |

### Webhook Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.webhook.received` | Counter | Total webhooks received | N/A |
| `intel_academy.webhook.processed` | Counter | Successfully processed webhooks | N/A |
| `intel_academy.webhook.failed` | Counter | Failed webhook processing | > 1% |
| `intel_academy.webhook.processing_time` | Distribution | Processing duration (ms) | > 5000ms |
| `intel_academy.webhook.success_rate` | Rate | Webhook processing success rate | < 99% |

### API Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.api.response_time` | Distribution | API response time (ms) | > 2000ms |
| `intel_academy.api.success` | Counter | Successful API calls | N/A |
| `intel_academy.api.failed` | Counter | Failed API calls | > 5% |
| `intel_academy.api.rate_limit_hits` | Counter | Rate limit hits | > 10/hour |
| `intel_academy.api.status.[code]` | Counter | API responses by status code | N/A |

### Security Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.security.signature_failures` | Counter | Invalid webhook signatures | > 5/hour |
| `intel_academy.security.unauthorized` | Counter | Unauthorized access attempts | > 10/hour |
| `intel_academy.security.suspicious` | Counter | Suspicious activity detected | > 0 |

### SSO Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `intel_academy.sso.redirects` | Counter | SSO redirects performed | N/A |
| `intel_academy.sso.token_generated` | Counter | SSO tokens generated | N/A |

## Alert Rules

### Critical Alerts (Immediate Response Required)

#### 1. High API Error Rate

**Condition**: API error rate > 5% over 15 minutes

**Query**:
```
rate(intel_academy.api.failed[15m]) / rate(intel_academy.api.success[15m]) > 0.05
```

**Actions**:
- Send PagerDuty alert
- Notify #intel-academy-alerts Slack channel
- Create Sentry issue
- Email on-call engineer

**Response**:
1. Check Intel Academy API status
2. Review error logs in Sentry
3. Verify network connectivity
4. Check rate limiting status
5. Escalate if Intel Academy API is down

---

#### 2. Webhook Processing Delay

**Condition**: Pending webhooks > 100 OR average processing time > 5 minutes

**Query**:
```
count(WebhookEvent WHERE status='pending') > 100
OR
avg(intel_academy.webhook.processing_time[15m]) > 300000
```

**Actions**:
- Send PagerDuty alert
- Notify #intel-academy-alerts Slack channel
- Create Sentry issue

**Response**:
1. Check cron job execution status
2. Review webhook processing logs
3. Check database performance
4. Manually trigger cron job if needed
5. Scale up processing if backlog is large

---

#### 3. Security: Multiple Signature Failures

**Condition**: > 5 signature verification failures in 1 hour from same IP

**Query**:
```
count(intel_academy.security.signature_failures[1h] GROUP BY source_ip) > 5
```

**Actions**:
- Send immediate security alert
- Notify security team
- Create high-priority Sentry issue
- Log to security event system

**Response**:
1. Review source IP and request patterns
2. Check if IP is known attacker
3. Consider IP blocking if malicious
4. Verify webhook secret hasn't been compromised
5. Review recent webhook configurations

---

### High Priority Alerts (Response Within 1 Hour)

#### 4. High Connection Failure Rate

**Condition**: Connection failure rate > 10% over 1 hour

**Query**:
```
rate(intel_academy.connection.failure_rate[1h]) > 0.10
```

**Actions**:
- Notify #intel-academy-alerts Slack channel
- Create Sentry issue
- Email engineering team

**Response**:
1. Check OAuth configuration
2. Verify Intel Academy API status
3. Review connection error logs
4. Test OAuth flow manually
5. Check for recent configuration changes

---

#### 5. High Sync Failure Rate

**Condition**: Subscription sync failure rate > 20% over 1 hour

**Query**:
```
rate(intel_academy.sync.failure_rate[1h]) > 0.20
```

**Actions**:
- Notify #intel-academy-alerts Slack channel
- Create Sentry issue

**Response**:
1. Review sync error logs
2. Check Intel Academy API status
3. Verify tier mapping configuration
4. Test manual sync for affected users
5. Check Stripe webhook delivery

---

#### 6. Token Refresh Failures

**Condition**: Token refresh failure rate > 15% over 1 hour

**Query**:
```
rate(intel_academy.token.refresh.failed[1h]) > 0.15
```

**Actions**:
- Notify #intel-academy-alerts Slack channel
- Create Sentry issue

**Response**:
1. Check affected user accounts
2. Verify OAuth credentials
3. Review token expiration logic
4. Check for mass token revocations
5. Notify affected users if needed

---

### Medium Priority Alerts (Response Within 4 Hours)

#### 7. Elevated Rate Limit Hits

**Condition**: > 10 rate limit hits in 1 hour

**Query**:
```
count(intel_academy.api.rate_limit_hits[1h]) > 10
```

**Actions**:
- Notify #intel-academy-monitoring Slack channel
- Create Sentry issue

**Response**:
1. Review API call patterns
2. Check for inefficient code
3. Verify caching is working
4. Consider request batching
5. Contact Intel Academy for rate limit increase if needed

---

#### 8. Slow API Response Times

**Condition**: Average API response time > 2 seconds over 15 minutes

**Query**:
```
avg(intel_academy.api.response_time[15m]) > 2000
```

**Actions**:
- Notify #intel-academy-monitoring Slack channel

**Response**:
1. Check Intel Academy API status
2. Review network latency
3. Check for database bottlenecks
4. Verify caching effectiveness
5. Consider implementing request timeouts

---

### Low Priority Alerts (Daily Review)

#### 9. Webhook Processing Failures

**Condition**: > 1% webhook processing failure rate over 24 hours

**Query**:
```
rate(intel_academy.webhook.failed[24h]) > 0.01
```

**Actions**:
- Add to daily monitoring report
- Create Sentry issue

**Response**:
1. Review failed webhook events
2. Check for patterns in failures
3. Verify retry logic is working
4. Update error handling if needed

---

#### 10. Unusual Disconnection Rate

**Condition**: > 10 disconnections in 1 hour

**Query**:
```
count(intel_academy.disconnection[1h]) > 10
```

**Actions**:
- Add to daily monitoring report

**Response**:
1. Review user feedback
2. Check for UX issues
3. Verify integration stability
4. Analyze disconnection reasons

---

## Sentry Alert Configuration

### Creating Alerts in Sentry

1. Navigate to **Alerts** → **Create Alert Rule**
2. Select **Issues** or **Metrics** based on alert type
3. Configure conditions using the queries above
4. Set up notification channels:
   - Email
   - Slack
   - PagerDuty
   - Webhook

### Example: High API Error Rate Alert

```yaml
name: Intel Academy - High API Error Rate
type: metric_alert
dataset: metrics
query: |
  rate(intel_academy.api.failed[15m]) / 
  rate(intel_academy.api.success[15m])
threshold: 0.05
time_window: 15m
trigger:
  critical:
    threshold: 0.05
    actions:
      - pagerduty: intel-academy-oncall
      - slack: #intel-academy-alerts
      - email: engineering@solosuccess.ai
  warning:
    threshold: 0.03
    actions:
      - slack: #intel-academy-monitoring
```

### Example: Webhook Processing Delay Alert

```yaml
name: Intel Academy - Webhook Processing Delay
type: metric_alert
dataset: metrics
query: avg(intel_academy.webhook.processing_time[15m])
threshold: 300000
time_window: 15m
trigger:
  critical:
    threshold: 300000
    actions:
      - pagerduty: intel-academy-oncall
      - slack: #intel-academy-alerts
  warning:
    threshold: 180000
    actions:
      - slack: #intel-academy-monitoring
```

## Monitoring Dashboard

### Sentry Dashboard Configuration

Create a custom dashboard in Sentry with the following widgets:

#### Overview Section

1. **Active Integrations**
   - Type: Big Number
   - Query: `count(IntelAcademyIntegration WHERE isActive=true)`

2. **Connection Success Rate (24h)**
   - Type: Big Number
   - Query: `rate(intel_academy.connection.success_rate[24h])`
   - Format: Percentage

3. **Sync Success Rate (24h)**
   - Type: Big Number
   - Query: `rate(intel_academy.sync.success_rate[24h])`
   - Format: Percentage

4. **Webhook Processing Success Rate (24h)**
   - Type: Big Number
   - Query: `rate(intel_academy.webhook.success_rate[24h])`
   - Format: Percentage

#### Performance Section

5. **API Response Time (7d)**
   - Type: Line Chart
   - Query: `p50(intel_academy.api.response_time), p95(intel_academy.api.response_time), p99(intel_academy.api.response_time)`
   - Time Range: 7 days

6. **Webhook Processing Time (7d)**
   - Type: Line Chart
   - Query: `p50(intel_academy.webhook.processing_time), p95(intel_academy.webhook.processing_time)`
   - Time Range: 7 days

7. **Sync Duration (7d)**
   - Type: Line Chart
   - Query: `p50(intel_academy.sync.duration), p95(intel_academy.sync.duration)`
   - Time Range: 7 days

#### Error Tracking Section

8. **Error Rate by Type (24h)**
   - Type: Bar Chart
   - Query: `count(intel_academy.*.failed) GROUP BY event_type`
   - Time Range: 24 hours

9. **API Status Codes (24h)**
   - Type: Pie Chart
   - Query: `count(intel_academy.api.status.*) GROUP BY status_code`
   - Time Range: 24 hours

10. **Recent Errors**
    - Type: Table
    - Query: Recent error events
    - Columns: Timestamp, Error Type, User ID, Message
    - Limit: 10

#### Security Section

11. **Security Events (7d)**
    - Type: Line Chart
    - Query: `count(intel_academy.security.*) GROUP BY event_type`
    - Time Range: 7 days

12. **Signature Failures by IP (24h)**
    - Type: Table
    - Query: `count(intel_academy.security.signature_failures) GROUP BY source_ip`
    - Time Range: 24 hours
    - Limit: 10

#### User Engagement Section

13. **SSO Redirects (7d)**
    - Type: Line Chart
    - Query: `count(intel_academy.sso.redirects)`
    - Time Range: 7 days

14. **New Connections (7d)**
    - Type: Line Chart
    - Query: `count(intel_academy.connection.success)`
    - Time Range: 7 days

15. **Disconnections (7d)**
    - Type: Line Chart
    - Query: `count(intel_academy.disconnection)`
    - Time Range: 7 days

### Grafana Dashboard (Optional)

If using Grafana for additional monitoring:

```json
{
  "dashboard": {
    "title": "Intel Academy Integration",
    "panels": [
      {
        "title": "Active Integrations",
        "type": "stat",
        "targets": [
          {
            "expr": "count(intel_academy_integration_active)"
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, intel_academy_api_response_time)",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, intel_academy_api_response_time)",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, intel_academy_api_response_time)",
            "legendFormat": "p99"
          }
        ]
      }
    ]
  }
}
```

## Notification Channels

### Slack Integration

1. **#intel-academy-alerts** (Critical/High Priority)
   - Connection failures
   - API errors
   - Security events
   - Webhook processing delays

2. **#intel-academy-monitoring** (Medium/Low Priority)
   - Performance degradation
   - Rate limit warnings
   - Daily summaries

### PagerDuty Integration

**Service**: Intel Academy Integration  
**Escalation Policy**:
- Level 1: On-call engineer (immediate)
- Level 2: Engineering manager (after 15 minutes)
- Level 3: CTO (after 30 minutes)

**Triggers**:
- High API error rate
- Webhook processing delay
- Security: Multiple signature failures

### Email Notifications

**Recipients**:
- engineering@solosuccess.ai (all alerts)
- security@solosuccess.ai (security alerts only)
- oncall@solosuccess.ai (critical alerts only)

## Daily Monitoring Checklist

### Morning Review (9:00 AM)

- [ ] Check Sentry dashboard for overnight issues
- [ ] Review error rate trends
- [ ] Check pending webhook count
- [ ] Verify cron jobs executed successfully
- [ ] Review security events
- [ ] Check active integration count

### Afternoon Review (2:00 PM)

- [ ] Review API performance metrics
- [ ] Check sync success rate
- [ ] Review user feedback/support tickets
- [ ] Monitor rate limit usage
- [ ] Check for any degraded performance

### End of Day Review (5:00 PM)

- [ ] Review daily metrics summary
- [ ] Document any incidents
- [ ] Update runbooks if needed
- [ ] Plan any necessary improvements
- [ ] Brief on-call engineer

## Weekly Monitoring Tasks

### Monday

- [ ] Review previous week's metrics
- [ ] Analyze error trends
- [ ] Check for recurring issues
- [ ] Update alert thresholds if needed

### Wednesday

- [ ] Review performance trends
- [ ] Check database query performance
- [ ] Analyze user engagement metrics
- [ ] Review caching effectiveness

### Friday

- [ ] Generate weekly report
- [ ] Review security events
- [ ] Plan improvements for next week
- [ ] Update documentation

## Monthly Monitoring Tasks

- [ ] Comprehensive performance review
- [ ] Security audit
- [ ] Cost analysis
- [ ] User satisfaction survey
- [ ] Alert threshold review
- [ ] Dashboard optimization
- [ ] Documentation updates
- [ ] Team training on new patterns

## Incident Response Playbook

### Step 1: Acknowledge

- Acknowledge alert in PagerDuty/Slack
- Assess severity and impact
- Notify team if needed

### Step 2: Investigate

- Check Sentry for error details
- Review logs in Vercel
- Check database status
- Verify Intel Academy API status
- Review recent deployments

### Step 3: Mitigate

- Apply immediate fixes if possible
- Implement workarounds
- Scale resources if needed
- Disable feature if critical

### Step 4: Resolve

- Deploy permanent fix
- Verify resolution
- Monitor for recurrence
- Update affected users

### Step 5: Document

- Create incident report
- Document root cause
- Update runbooks
- Plan preventive measures

## Support Contacts

### Internal

- **Engineering Team**: #intel-academy-dev
- **On-Call Engineer**: oncall@solosuccess.ai
- **Security Team**: security@solosuccess.ai

### External

- **Intel Academy API Support**: api-support@intelacademy.com
- **Intel Academy Status Page**: https://status.intelacademy.com
- **Sentry Support**: support@sentry.io
- **Vercel Support**: support@vercel.com
