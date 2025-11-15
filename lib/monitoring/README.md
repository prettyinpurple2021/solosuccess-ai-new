# Monitoring and Logging

This directory contains the monitoring and logging infrastructure for SoloSuccess AI.

## Components

### Logger (`logger.ts`)
Structured logging utility that provides consistent logging across the application.

**Features:**
- Structured JSON logging for production
- Pretty-printed logs for development
- Log levels: DEBUG, INFO, WARN, ERROR
- Context-aware logging with user, request, and session IDs
- Specialized logging methods for common scenarios

**Usage:**
```typescript
import { logger } from '@/lib/monitoring/logger';

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.error('Payment failed', error, { userId: '123', amount: 99.99 });

// HTTP logging
logger.logRequest('GET', '/api/users');
logger.logResponse('GET', '/api/users', 200, 150);

// AI logging
logger.logAIRequest('roxy', 'Help me with strategy');
logger.logAIResponse('roxy', 500, 2500);

// Security logging
logger.logSecurityEvent('Failed login attempt', 'medium', { userId: '123' });

// Performance logging
logger.logPerformanceMetric('api_latency', 150, 'ms');
```

### Metrics (`metrics.ts`)
DataDog metrics collection for tracking application performance and business metrics.

**Features:**
- Counter, Gauge, Histogram, and Distribution metrics
- Automatic tagging with environment and service
- Business metrics tracking
- Performance measurement utilities

**Usage:**
```typescript
import { metrics, measureTime } from '@/lib/monitoring/metrics';

// Track events
await metrics.increment('user.registration', 1, { tags: { tier: 'premium' } });
await metrics.gauge('active_users', 150);

// Track timing
await metrics.timing('api.response_time', 250, { tags: { endpoint: '/api/users' } });

// Business metrics
await metrics.trackUserRegistration('premium');
await metrics.trackAIRequest('roxy', true);
await metrics.trackPaymentSuccess(99.99, 'USD');

// Measure execution time
const result = await measureTime('database.query', async () => {
  return await db.query('SELECT * FROM users');
}, { operation: 'select' });

// Use decorator
class UserService {
  @Measure('user.create')
  async createUser(data: UserData) {
    // Method execution time is automatically tracked
  }
}
```

### CloudWatch (`cloudwatch.ts`)
AWS CloudWatch integration for logs and custom metrics.

**Features:**
- Structured log streaming to CloudWatch Logs
- Custom metrics to CloudWatch Metrics
- Automatic log buffering and flushing
- Application-specific metrics

**Usage:**
```typescript
import { cloudwatch } from '@/lib/monitoring/cloudwatch';

// Log to CloudWatch
await cloudwatch.log('info', 'User action', { userId: '123', action: 'login' });

// Track metrics
await cloudwatch.trackAPILatency('/api/users', 150);
await cloudwatch.trackDatabaseLatency('SELECT', 50);
await cloudwatch.trackErrorRate('ValidationError', 1);
await cloudwatch.trackActiveConnections(25);
```

## Dashboard Configuration

The `dashboard-config.json` file contains the configuration for DataDog dashboards and alerts.

### Dashboards

1. **Production Overview**: High-level system health and performance
2. **Business Metrics**: User engagement and revenue metrics
3. **Infrastructure**: AWS service health and resource utilization

### Alerts

Configured alerts for:
- High API response time (>3s)
- Critical error rate (>50 errors/5min)
- Database connection pool exhaustion
- Low cache hit rate (<50%)
- High memory usage (>90%)
- Payment failure spikes
- AI service timeouts
- ECS task failures

## Setup

### Environment Variables

```bash
# DataDog
DATADOG_API_KEY=your_datadog_api_key

# AWS CloudWatch
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
CLOUDWATCH_LOG_GROUP=/solosuccess-ai/production

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
```

### DataDog Setup

1. Create a DataDog account
2. Get your API key from DataDog dashboard
3. Install DataDog agent on your servers (optional)
4. Configure dashboards using `dashboard-config.json`
5. Set up alert notification channels (Slack, PagerDuty, Email)

### CloudWatch Setup

1. Create CloudWatch Log Group:
```bash
aws logs create-log-group --log-group-name /solosuccess-ai/production
```

2. Set retention policy:
```bash
aws logs put-retention-policy \
  --log-group-name /solosuccess-ai/production \
  --retention-in-days 30
```

3. Create CloudWatch dashboard in AWS Console
4. Configure CloudWatch alarms for critical metrics

## Best Practices

### Logging

1. **Use appropriate log levels**
   - DEBUG: Detailed information for debugging
   - INFO: General informational messages
   - WARN: Warning messages for potential issues
   - ERROR: Error messages for failures

2. **Include context**
   - Always include userId, requestId, sessionId when available
   - Add relevant metadata for troubleshooting

3. **Avoid sensitive data**
   - Never log passwords, API keys, or PII
   - Sanitize user input before logging

4. **Use structured logging**
   - Log as JSON in production for easy parsing
   - Include consistent field names

### Metrics

1. **Track what matters**
   - Focus on business metrics and user experience
   - Monitor system health and performance
   - Track error rates and types

2. **Use appropriate metric types**
   - Counter: For counting events (requests, errors)
   - Gauge: For current values (active users, memory)
   - Histogram: For distributions (response times)

3. **Add meaningful tags**
   - Tag metrics with environment, service, version
   - Use tags for filtering and grouping

4. **Set up alerts**
   - Alert on critical metrics
   - Use appropriate thresholds
   - Avoid alert fatigue

### Monitoring

1. **Create dashboards**
   - Overview dashboard for quick health check
   - Detailed dashboards for deep dives
   - Business metrics dashboard for stakeholders

2. **Set up alerts**
   - Critical alerts for immediate action
   - Warning alerts for potential issues
   - Use multiple notification channels

3. **Review regularly**
   - Review dashboards daily
   - Analyze trends weekly
   - Adjust thresholds as needed

## Troubleshooting

### Logs not appearing in CloudWatch

1. Check AWS credentials and permissions
2. Verify log group and stream exist
3. Check network connectivity to AWS
4. Review CloudWatch Logs IAM policy

### Metrics not showing in DataDog

1. Verify DATADOG_API_KEY is set correctly
2. Check DataDog agent status (if using agent)
3. Verify metric names and tags
4. Check DataDog API rate limits

### High log volume

1. Adjust log levels (reduce DEBUG logs in production)
2. Implement log sampling for high-frequency events
3. Use log aggregation and filtering
4. Consider log retention policies

### Alert fatigue

1. Review and adjust alert thresholds
2. Combine related alerts
3. Use alert grouping and deduplication
4. Implement alert escalation policies

## Monitoring Checklist

- [ ] CloudWatch Log Group created
- [ ] DataDog API key configured
- [ ] Dashboards created and configured
- [ ] Alerts set up with appropriate thresholds
- [ ] Notification channels configured (Slack, PagerDuty)
- [ ] Log retention policies set
- [ ] Metrics being collected and displayed
- [ ] Team trained on monitoring tools
- [ ] Runbooks created for common alerts
- [ ] Regular monitoring reviews scheduled
