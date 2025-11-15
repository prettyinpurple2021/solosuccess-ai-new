# Security Migration Guide

This guide helps you migrate existing API routes to use the new security features.

## Before You Start

1. Review the security documentation: `SECURITY_IMPLEMENTATION.md`
2. Check the example route: `app/api/example-secure-route/route.ts`
3. Understand middleware composition: `lib/middleware/compose.ts`

## Migration Steps

### Step 1: Add Security Headers

**Before:**
```typescript
export async function GET(request: NextRequest) {
  return NextResponse.json({ data: 'response' });
}
```

**After:**
```typescript
import { withMiddleware } from '@/lib/middleware/compose';
import { withSecurityHeaders } from '@/lib/middleware/security-headers';

export const GET = withMiddleware(
  [withSecurityHeaders()],
  async (request: NextRequest) => {
    return NextResponse.json({ data: 'response' });
  }
);
```

### Step 2: Add Authentication

**Before:**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process request
}
```

**After:**
```typescript
import { withMiddleware } from '@/lib/middleware/compose';
import { withAuth } from '@/lib/middleware/auth';
import { withSecurityHeaders } from '@/lib/middleware/security-headers';

export const POST = withMiddleware(
  [withSecurityHeaders(), withAuth],
  async (request: any) => {
    const { user } = request;
    const body = await request.json();
    // Process request with authenticated user
  }
);
```

### Step 3: Add Rate Limiting

**Before:**
```typescript
export const POST = withMiddleware(
  [withSecurityHeaders(), withAuth],
  async (request: any) => {
    // Handler
  }
);
```

**After:**
```typescript
import { withUserRateLimit } from '@/lib/middleware/rate-limit';

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit({ free: 100, accelerator: 500, premium: -1 }),
  ],
  async (request: any) => {
    // Handler
  }
);
```

### Step 4: Add Input Validation

**Before:**
```typescript
export const POST = withMiddleware(
  [withSecurityHeaders(), withAuth, withUserRateLimit()],
  async (request: any) => {
    const body = await request.json();
    
    // Manual validation
    if (!body.email || !body.password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    // Process
  }
);
```

**After:**
```typescript
import { withValidation } from '@/lib/middleware/validation';
import { loginSchema } from '@/lib/validation/schemas';

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit(),
    withValidation(loginSchema),
  ],
  async (request: any) => {
    const { validatedData } = request;
    // validatedData is already validated and sanitized
    
    // Process
  }
);
```

### Step 5: Add Security Event Logging

**Before:**
```typescript
export const POST = withMiddleware(
  [withSecurityHeaders(), withAuth, withValidation(schema)],
  async (request: any) => {
    const { validatedData, user } = request;
    
    // Process
    
    return NextResponse.json({ success: true });
  }
);
```

**After:**
```typescript
import { logSecurityEvent, SecurityEventType, SecurityEventSeverity } from '@/lib/security';

export const POST = withMiddleware(
  [withSecurityHeaders(), withAuth, withValidation(schema)],
  async (request: any) => {
    const { validatedData, user } = request;
    
    // Log security event
    logSecurityEvent({
      type: SecurityEventType.SENSITIVE_DATA_ACCESS,
      severity: SecurityEventSeverity.LOW,
      userId: user.id,
      ip: request.headers.get('x-forwarded-for'),
      resource: '/api/your-endpoint',
    });
    
    // Process
    
    return NextResponse.json({ success: true });
  }
);
```

### Step 6: Add Data Encryption

**Before:**
```typescript
// Storing sensitive data
const user = await prisma.user.create({
  data: {
    email: data.email,
    ssn: data.ssn,
    creditCard: data.creditCard,
  },
});
```

**After:**
```typescript
import { FieldEncryption } from '@/lib/security';

// Storing sensitive data with encryption
const user = await prisma.user.create({
  data: {
    email: data.email,
    ssn: FieldEncryption.encryptField(data.ssn),
    creditCard: FieldEncryption.encryptField(data.creditCard),
  },
});

// Reading encrypted data
const userData = await prisma.user.findUnique({ where: { id } });
const decrypted = {
  ...userData,
  ssn: FieldEncryption.decryptField(userData.ssn),
  creditCard: FieldEncryption.decryptField(userData.creditCard),
};
```

## Complete Migration Example

### Before (Unsecured Route)

```typescript
// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // No validation
    const { firstName, lastName, email } = body;
    
    // No authentication check
    const userId = request.headers.get('x-user-id');
    
    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### After (Secured Route)

```typescript
// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware/compose';
import { withAuth } from '@/lib/middleware/auth';
import { withUserRateLimit } from '@/lib/middleware/rate-limit';
import { withSecurityHeaders } from '@/lib/middleware/security-headers';
import { withValidation } from '@/lib/middleware/validation';
import { profileUpdateSchema } from '@/lib/validation/schemas';
import { logSecurityEvent, SecurityEventType, SecurityEventSeverity } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit({ free: 10, accelerator: 50, premium: -1 }),
    withValidation(profileUpdateSchema),
  ],
  async (request: any) => {
    try {
      const { validatedData, user } = request;
      
      // Log security event
      logSecurityEvent({
        type: SecurityEventType.SENSITIVE_DATA_ACCESS,
        severity: SecurityEventSeverity.LOW,
        userId: user.id,
        ip: request.headers.get('x-forwarded-for'),
        resource: '/api/users/profile',
        details: { action: 'update_profile' },
      });
      
      // Update user with validated data
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
        },
      });
      
      return NextResponse.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update profile',
          },
        },
        { status: 500 }
      );
    }
  }
);
```

## Route-Specific Patterns

### Public API Route (No Auth)

```typescript
export const GET = withMiddleware(
  [
    withSecurityHeaders(),
    withIpRateLimit({ maxRequests: 100 }),
  ],
  async (request: NextRequest) => {
    // Public handler
  }
);
```

### Protected API Route (Auth Required)

```typescript
export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit(),
    withValidation(schema),
  ],
  async (request: any) => {
    // Protected handler
  }
);
```

### Premium Feature Route

```typescript
import { withSubscription } from '@/lib/middleware/auth';

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withSubscription('premium'),
    withValidation(schema),
  ],
  async (request: any) => {
    // Premium feature handler
  }
);
```

### File Upload Route

```typescript
import { withFileUploadValidation } from '@/lib/middleware/validation';
import { ALLOWED_IMAGE_EXTENSIONS } from '@/lib/validation/schemas';

export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit(),
    withFileUploadValidation({
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
    }),
  ],
  async (request: any) => {
    // File upload handler
  }
);
```

## Database Migration for Encrypted Fields

If you need to encrypt existing data:

```typescript
// scripts/encrypt-existing-data.ts
import { prisma } from '@/lib/prisma';
import { FieldEncryption } from '@/lib/security';

async function encryptExistingData() {
  const users = await prisma.user.findMany({
    where: {
      // Find users with unencrypted data
      ssn: { not: null },
    },
  });
  
  for (const user of users) {
    if (user.ssn && !user.ssn.startsWith('encrypted:')) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ssn: FieldEncryption.encryptField(user.ssn),
        },
      });
    }
  }
  
  console.log(`Encrypted data for ${users.length} users`);
}

encryptExistingData();
```

## Testing Your Migration

### 1. Test Security Headers

```bash
curl -I https://your-domain.com/api/endpoint
# Check for security headers in response
```

### 2. Test Rate Limiting

```bash
# Make multiple requests
for i in {1..150}; do
  curl https://your-domain.com/api/endpoint
done
# Should receive 429 after limit
```

### 3. Test Input Validation

```bash
# Test with invalid input
curl -X POST https://your-domain.com/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'
# Should receive 400 with validation errors
```

### 4. Test Authentication

```bash
# Test without token
curl https://your-domain.com/api/protected
# Should receive 401

# Test with token
curl https://your-domain.com/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should succeed
```

## Common Issues and Solutions

### Issue: Middleware Order Matters

**Problem:** Rate limiting not working correctly

**Solution:** Ensure middleware is applied in correct order:
1. Security headers
2. Authentication
3. Rate limiting
4. Validation

### Issue: Validation Errors Not Clear

**Problem:** Users don't understand validation errors

**Solution:** Use Zod's error formatting:

```typescript
if (!result.success) {
  const errors = result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  return NextResponse.json({ errors }, { status: 400 });
}
```

### Issue: Encrypted Data Not Decrypting

**Problem:** Cannot decrypt previously encrypted data

**Solution:** Ensure `ENCRYPTION_KEY` hasn't changed. If it has, you'll need to re-encrypt all data with the new key.

### Issue: Rate Limit Too Restrictive

**Problem:** Legitimate users hitting rate limits

**Solution:** Adjust limits per tier or implement bypass for specific users:

```typescript
withUserRateLimit({
  free: 200,        // Increase limits
  accelerator: 1000,
  premium: -1,
})
```

## Rollback Plan

If you need to rollback security features:

1. Remove middleware from routes
2. Revert to original route handlers
3. Keep security utilities for future use
4. Document issues encountered

## Checklist

- [ ] All API routes have security headers
- [ ] Protected routes have authentication
- [ ] All routes have rate limiting
- [ ] User input is validated
- [ ] Sensitive data is encrypted
- [ ] Security events are logged
- [ ] Error handling is implemented
- [ ] Tests are updated
- [ ] Documentation is updated
- [ ] Team is trained on new patterns

## Next Steps

1. Migrate one route at a time
2. Test thoroughly after each migration
3. Monitor security logs for issues
4. Adjust rate limits based on usage
5. Review and update validation schemas
6. Conduct security audit after migration

## Support

For migration help:
- Review: `SECURITY_IMPLEMENTATION.md`
- Example: `app/api/example-secure-route/route.ts`
- Quick Reference: `lib/security/README.md`
