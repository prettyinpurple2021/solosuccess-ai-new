# Security Hardening Implementation

This document describes the comprehensive security features implemented in SoloSuccess AI.

## Overview

The security hardening implementation includes:

1. **Security Headers** - Comprehensive HTTP security headers
2. **Input Validation & Sanitization** - Zod schemas and XSS/SQL injection prevention
3. **Rate Limiting** - Per-user and IP-based rate limiting with premium bypass
4. **Data Encryption** - AES-256 encryption for sensitive data
5. **Security Monitoring** - Event logging, anomaly detection, and alerting

## 1. Security Headers

### Implementation

Security headers are configured in two places:

1. **Next.js Config** (`next.config.ts`) - Global headers for all routes
2. **Middleware** (`lib/middleware/security-headers.ts`) - Dynamic headers per request

### Headers Applied

- **Strict-Transport-Security (HSTS)**: Forces HTTPS for 2 years
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filter
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Disables unnecessary browser features
- **Content-Security-Policy (CSP)**: Comprehensive content security policy

### Usage

```typescript
import { withSecurityHeaders } from '@/lib/middleware/security-headers';

export const GET = withMiddleware(
  [withSecurityHeaders()],
  async (request) => {
    // Your handler
  }
);
```

## 2. Input Validation & Sanitization

### Zod Schemas

All input validation uses Zod schemas defined in `lib/validation/schemas.ts`:

```typescript
import { loginSchema, aiMessageSchema } from '@/lib/validation/schemas';

// Validate login input
const result = loginSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
}
```

### Available Schemas

- `emailSchema` - Email validation
- `passwordSchema` - Password strength validation
- `registerSchema` - User registration
- `loginSchema` - User login
- `aiMessageSchema` - AI agent messages
- `missionControlSchema` - Mission Control requests
- `competitorProfileSchema` - Competitor tracking
- `contentGenerationSchema` - Content generation
- `documentGenerationSchema` - Document generation
- `fileUploadSchema` - File upload validation
- `goalSchema` - Goal creation
- `paginationSchema` - Pagination parameters

### Validation Middleware

```typescript
import { withValidation } from '@/lib/middleware/validation';
import { loginSchema } from '@/lib/validation/schemas';

export const POST = withMiddleware(
  [withValidation(loginSchema)],
  async (request: any) => {
    const { validatedData } = request;
    // Use validated data
  }
);
```

### XSS Protection

```typescript
import { withXssProtection } from '@/lib/middleware/validation';

export const POST = withMiddleware(
  [withXssProtection()],
  async (request) => {
    // All string inputs are sanitized
  }
);
```

### SQL Injection Prevention

```typescript
import { withSqlInjectionProtection } from '@/lib/middleware/validation';

export const POST = withMiddleware(
  [withSqlInjectionProtection()],
  async (request) => {
    // SQL injection patterns are blocked
  }
);
```

### Sanitization Functions

```typescript
import { sanitizeHtml, sanitizeInput, sanitizeUrl } from '@/lib/validation/schemas';

const clean = sanitizeHtml('<script>alert("xss")</script>');
// Result: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

## 3. Rate Limiting

### Per-User Rate Limiting

```typescript
import { withUserRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withMiddleware(
  [
    withAuth,
    withUserRateLimit({
      free: 100,        // 100 requests per window for free users
      accelerator: 500, // 500 requests for accelerator users
      premium: -1,      // Unlimited for premium users
      windowMs: 15 * 60 * 1000, // 15 minute window
    }),
  ],
  async (request) => {
    // Your handler
  }
);
```

### IP-Based Rate Limiting

```typescript
import { withIpRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withMiddleware(
  [withIpRateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 })],
  async (request) => {
    // Your handler
  }
);
```

### Custom Rate Limiting

```typescript
import { withRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withMiddleware(
  [
    withRateLimit({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      keyGenerator: (req) => req.headers.get('x-api-key') || 'anonymous',
      skipSuccessfulRequests: true,
      bypassPremium: true,
    }),
  ],
  async (request) => {
    // Your handler
  }
);
```

### Rate Limit Monitoring

```typescript
import { getRateLimitStats } from '@/lib/middleware/rate-limit';

const stats = getRateLimitStats();
console.log(stats);
// {
//   totalKeys: 150,
//   suspiciousActivities: 5,
//   blockedKeys: 2
// }
```

## 4. Data Encryption

### Field-Level Encryption

```typescript
import { encrypt, decrypt } from '@/lib/security/encryption';

// Encrypt sensitive data
const encrypted = encrypt('sensitive information');

// Decrypt data
const decrypted = decrypt(encrypted);
```

### Bulk Field Encryption

```typescript
import { FieldEncryption } from '@/lib/security/encryption';

const user = {
  id: '123',
  email: 'user@example.com',
  ssn: '123-45-6789',
  creditCard: '4111111111111111',
};

// Encrypt specific fields
const encrypted = FieldEncryption.encryptFields(user, ['ssn', 'creditCard']);

// Decrypt fields
const decrypted = FieldEncryption.decryptFields(encrypted, ['ssn', 'creditCard']);
```

### File Encryption

```typescript
import { encryptFile, decryptFile } from '@/lib/security/file-encryption';

// Encrypt file buffer
const fileBuffer = Buffer.from('file contents');
const encrypted = encryptFile(fileBuffer);

// Decrypt file buffer
const decrypted = decryptFile(encrypted);
```

### Streaming File Encryption

```typescript
import { encryptFileStream, decryptFileStream } from '@/lib/security/file-encryption';
import { createReadStream, createWriteStream } from 'fs';

// Encrypt large file
await encryptFileStream(
  createReadStream('input.txt'),
  createWriteStream('output.enc')
);

// Decrypt large file
await decryptFileStream(
  createReadStream('output.enc'),
  createWriteStream('decrypted.txt')
);
```

### Hashing

```typescript
import { hash, verifyHash } from '@/lib/security/encryption';

// Hash data (one-way)
const hashed = hash('password123');

// Verify hash
const isValid = verifyHash('password123', hashed); // true
```

### Data Masking

```typescript
import { maskEmail, maskCreditCard, maskSensitiveData } from '@/lib/security/encryption';

maskEmail('user@example.com'); // u**r@example.com
maskCreditCard('4111111111111111'); // ************1111
maskSensitiveData('secret123', 3); // sec*******
```

## 5. Security Monitoring

### Logging Security Events

```typescript
import {
  logSecurityEvent,
  SecurityEventType,
  SecurityEventSeverity,
} from '@/lib/security/monitoring';

logSecurityEvent({
  type: SecurityEventType.LOGIN_FAILURE,
  severity: SecurityEventSeverity.MEDIUM,
  userId: 'user-123',
  ip: '192.168.1.1',
  resource: '/api/auth/login',
  details: {
    reason: 'Invalid password',
    attempts: 3,
  },
});
```

### Available Event Types

- Authentication: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `PASSWORD_RESET_REQUEST`
- Authorization: `UNAUTHORIZED_ACCESS`, `PERMISSION_DENIED`, `SUBSCRIPTION_REQUIRED`
- Rate Limiting: `RATE_LIMIT_EXCEEDED`, `SUSPICIOUS_ACTIVITY_DETECTED`, `IP_BLOCKED`
- Data Access: `SENSITIVE_DATA_ACCESS`, `DATA_EXPORT`, `DATA_DELETION`
- Security Violations: `XSS_ATTEMPT`, `SQL_INJECTION_ATTEMPT`, `CSRF_VIOLATION`
- System: `ENCRYPTION_ERROR`, `DECRYPTION_ERROR`

### Querying Security Events

```typescript
import { getSecurityEvents } from '@/lib/security/monitoring';

const events = getSecurityEvents({
  type: SecurityEventType.LOGIN_FAILURE,
  severity: SecurityEventSeverity.HIGH,
  userId: 'user-123',
  startDate: new Date('2024-01-01'),
  limit: 100,
});
```

### Security Statistics

```typescript
import { getSecurityStats } from '@/lib/security/monitoring';

const stats = getSecurityStats();
console.log(stats);
// {
//   totalEvents: 1500,
//   eventsByType: { login_failure: 50, ... },
//   eventsBySeverity: { high: 10, ... },
//   suspiciousPatterns: 5,
//   recentCriticalEvents: 2
// }
```

### Anomaly Detection

```typescript
import { detectAnomalies } from '@/lib/security/monitoring';

const { anomalies } = detectAnomalies();
for (const anomaly of anomalies) {
  console.log(`${anomaly.type}: ${anomaly.description}`);
}
```

### Security Alerts

```typescript
import { processSecurityAlert } from '@/lib/security/alerts';

// Alerts are automatically processed for critical events
// Configure alert rules in lib/security/alerts.ts
```

## Environment Variables

Add these to your `.env` file:

```bash
# Encryption keys (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY="your-32-byte-hex-key"
FILE_ENCRYPTION_KEY="your-32-byte-hex-key"

# Sentry error tracking
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

## Complete Example

See `app/api/example-secure-route/route.ts` for a complete example demonstrating all security features.

## Best Practices

1. **Always use middleware composition** - Apply security middleware in the correct order
2. **Validate all inputs** - Use Zod schemas for all user inputs
3. **Log security events** - Track important security-related actions
4. **Encrypt sensitive data** - Use field-level encryption for PII
5. **Monitor rate limits** - Review rate limit stats regularly
6. **Review security logs** - Check for anomalies and suspicious patterns
7. **Keep dependencies updated** - Regularly update security-related packages
8. **Use HTTPS in production** - Always enforce HTTPS with HSTS
9. **Rotate encryption keys** - Implement key rotation strategy
10. **Test security features** - Include security tests in your test suite

## Security Checklist

- [x] Security headers configured
- [x] Input validation with Zod schemas
- [x] XSS protection implemented
- [x] SQL injection prevention
- [x] Rate limiting configured
- [x] Data encryption implemented
- [x] File encryption available
- [x] Security event logging
- [x] Anomaly detection
- [x] Security alerts configured
- [x] Sentry error tracking setup
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed
- [ ] Security training for team

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Zod Documentation](https://zod.dev/)
- [Sentry Documentation](https://docs.sentry.io/)

## Support

For security concerns or to report vulnerabilities, contact: security@solosuccess.ai
