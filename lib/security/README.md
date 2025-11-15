# Security Module

Quick reference for using security features in SoloSuccess AI.

## Quick Start

### Secure API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware/compose';
import { withAuth } from '@/lib/middleware/auth';
import { withUserRateLimit } from '@/lib/middleware/rate-limit';
import { withSecurityHeaders } from '@/lib/middleware/security-headers';
import { withValidation } from '@/lib/middleware/validation';
import { z } from 'zod';

const schema = z.object({
  // Define your schema
});

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit(),
    withValidation(schema),
  ],
  async (request: any) => {
    const { validatedData, user } = request;
    
    // Your logic here
    
    return NextResponse.json({ success: true });
  }
);
```

## Middleware Order

Apply middleware in this order for best security:

1. `withSecurityHeaders()` - Apply security headers first
2. `withAuth` - Authenticate user
3. `withRateLimit()` or `withUserRateLimit()` - Rate limiting
4. `withXssProtection()` - XSS prevention
5. `withSqlInjectionProtection()` - SQL injection prevention
6. `withValidation(schema)` - Input validation

## Common Patterns

### Public Endpoint with Rate Limiting

```typescript
export const GET = withMiddleware(
  [
    withSecurityHeaders(),
    withIpRateLimit({ maxRequests: 100 }),
  ],
  async (request) => {
    // Handler
  }
);
```

### Protected Endpoint with Validation

```typescript
export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit(),
    withValidation(mySchema),
  ],
  async (request: any) => {
    const { validatedData, user } = request;
    // Handler
  }
);
```

### Premium Feature Endpoint

```typescript
import { withSubscription } from '@/lib/middleware/auth';

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withSubscription('premium'),
    withValidation(mySchema),
  ],
  async (request: any) => {
    // Premium feature logic
  }
);
```

## Encryption Examples

### Encrypt User Data

```typescript
import { FieldEncryption } from '@/lib/security';

const user = await prisma.user.create({
  data: {
    email: data.email,
    ssn: FieldEncryption.encryptField(data.ssn),
    creditCard: FieldEncryption.encryptField(data.creditCard),
  },
});
```

### Decrypt User Data

```typescript
import { FieldEncryption } from '@/lib/security';

const user = await prisma.user.findUnique({ where: { id } });
const decrypted = {
  ...user,
  ssn: FieldEncryption.decryptField(user.ssn),
  creditCard: FieldEncryption.decryptField(user.creditCard),
};
```

## Security Event Logging

### Log Important Events

```typescript
import { logSecurityEvent, SecurityEventType, SecurityEventSeverity } from '@/lib/security';

// Login success
logSecurityEvent({
  type: SecurityEventType.LOGIN_SUCCESS,
  severity: SecurityEventSeverity.LOW,
  userId: user.id,
  ip: request.headers.get('x-forwarded-for'),
});

// Unauthorized access attempt
logSecurityEvent({
  type: SecurityEventType.UNAUTHORIZED_ACCESS,
  severity: SecurityEventSeverity.HIGH,
  userId: user?.id,
  ip: request.headers.get('x-forwarded-for'),
  resource: '/api/admin/users',
  details: { reason: 'Insufficient permissions' },
});
```

## Validation Schemas

### Use Existing Schemas

```typescript
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  aiMessageSchema,
} from '@/lib/validation/schemas';
```

### Create Custom Schema

```typescript
import { z } from 'zod';

const mySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: emailSchema, // Reuse existing schemas
  age: z.number().int().positive().max(120),
});
```

## Rate Limiting

### Check Rate Limit Stats

```typescript
import { getRateLimitStats } from '@/lib/middleware/rate-limit';

const stats = getRateLimitStats();
// { totalKeys: 150, suspiciousActivities: 5, blockedKeys: 2 }
```

### Clear Rate Limit for User

```typescript
import { clearRateLimit } from '@/lib/middleware/rate-limit';

clearRateLimit(`user:${userId}`);
```

## Security Monitoring

### View Recent Events

```typescript
import { getSecurityEvents } from '@/lib/security';

const events = getSecurityEvents({
  severity: SecurityEventSeverity.HIGH,
  limit: 50,
});
```

### Check for Anomalies

```typescript
import { detectAnomalies } from '@/lib/security';

const { anomalies } = detectAnomalies();
if (anomalies.length > 0) {
  // Handle anomalies
}
```

## File Operations

### Secure File Upload

```typescript
import { validateFileExtension, ALLOWED_IMAGE_EXTENSIONS } from '@/lib/validation/schemas';
import { encryptFile, calculateChecksum } from '@/lib/security';

// Validate extension
if (!validateFileExtension(filename, ALLOWED_IMAGE_EXTENSIONS)) {
  throw new Error('Invalid file type');
}

// Encrypt file
const encrypted = encryptFile(fileBuffer);

// Calculate checksum
const checksum = calculateChecksum(fileBuffer);
```

## Testing Security

### Test Rate Limiting

```typescript
// Make multiple requests to test rate limiting
for (let i = 0; i < 150; i++) {
  await fetch('/api/endpoint');
}
// Should receive 429 after limit
```

### Test Input Validation

```typescript
// Test with invalid input
const response = await fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({ email: 'invalid' }),
});
// Should receive 400 with validation errors
```

## Troubleshooting

### Rate Limit Not Working

- Check if middleware is applied in correct order
- Verify user ID is being passed in headers
- Check rate limit store is not being cleared too frequently

### Encryption Errors

- Ensure `ENCRYPTION_KEY` is set in environment
- Verify key is 32 bytes (64 hex characters)
- Check data is not already encrypted

### Validation Failing

- Review Zod schema definition
- Check input data format
- Enable debug logging for validation errors

## Security Best Practices

1. ✅ Always validate user input
2. ✅ Use rate limiting on all public endpoints
3. ✅ Log security-relevant events
4. ✅ Encrypt sensitive data at rest
5. ✅ Apply security headers to all responses
6. ✅ Use HTTPS in production
7. ✅ Rotate encryption keys regularly
8. ✅ Monitor security logs for anomalies
9. ✅ Keep dependencies updated
10. ✅ Conduct regular security audits

## Resources

- Full documentation: `/SECURITY_IMPLEMENTATION.md`
- Example route: `/app/api/example-secure-route/route.ts`
- Validation schemas: `/lib/validation/schemas.ts`
- Security utilities: `/lib/security/`
