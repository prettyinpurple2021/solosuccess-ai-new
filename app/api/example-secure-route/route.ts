import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware/compose';
import { withAuth } from '@/lib/middleware/auth';
import { withRateLimit, withUserRateLimit } from '@/lib/middleware/rate-limit';
import { withSecurityHeaders } from '@/lib/middleware/security-headers';
import { withValidation } from '@/lib/middleware/validation';
import { withXssProtection, withSqlInjectionProtection } from '@/lib/middleware/validation';
import { z } from 'zod';
import {
  logSecurityEvent,
  SecurityEventType,
  SecurityEventSeverity,
} from '@/lib/security/monitoring';
import { encrypt, decrypt } from '@/lib/security/encryption';

/**
 * Example secure API route demonstrating all security features
 * 
 * This route shows how to:
 * 1. Apply security headers
 * 2. Implement authentication
 * 3. Apply rate limiting
 * 4. Validate and sanitize input
 * 5. Prevent XSS and SQL injection
 * 6. Log security events
 * 7. Encrypt sensitive data
 */

// Define request schema
const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  sensitiveData: z.string().optional(),
});

// POST handler with all security middleware
export const POST = withMiddleware(
  [
    withSecurityHeaders(),
    withAuth,
    withUserRateLimit({ free: 10, accelerator: 50, premium: -1 }),
    withXssProtection(),
    withSqlInjectionProtection(),
    withValidation(requestSchema),
  ],
  async (request: any) => {
    try {
      const { validatedData } = request;
      const user = request.user;

      // Log security event
      logSecurityEvent({
        type: SecurityEventType.SENSITIVE_DATA_ACCESS,
        severity: SecurityEventSeverity.LOW,
        userId: user.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        resource: '/api/example-secure-route',
        details: {
          action: 'process_message',
        },
      });

      // Encrypt sensitive data if provided
      let encryptedData: string | null = null;
      if (validatedData.sensitiveData) {
        encryptedData = encrypt(validatedData.sensitiveData);
      }

      // Process the request
      const response = {
        success: true,
        data: {
          message: `Processed: ${validatedData.message}`,
          userId: user.id,
          encryptedData: encryptedData ? 'Data encrypted successfully' : null,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error processing request:', error);

      // Log error event
      logSecurityEvent({
        type: SecurityEventType.ENCRYPTION_ERROR,
        severity: SecurityEventSeverity.MEDIUM,
        userId: (request as any).user?.id,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to process request',
          },
        },
        { status: 500 }
      );
    }
  }
);

// GET handler with basic security
export const GET = withMiddleware(
  [withSecurityHeaders(), withRateLimit({ maxRequests: 100, windowMs: 60000 })],
  async (request: NextRequest) => {
    return NextResponse.json({
      success: true,
      data: {
        message: 'This is a secure endpoint',
        features: [
          'Security headers',
          'Rate limiting',
          'Authentication',
          'Input validation',
          'XSS protection',
          'SQL injection prevention',
          'Security event logging',
          'Data encryption',
        ],
      },
    });
  }
);
