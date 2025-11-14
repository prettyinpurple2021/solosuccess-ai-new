import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withSubscription, AuthenticatedRequest } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { composeMiddleware } from '@/lib/middleware/compose';

/**
 * Example protected route demonstrating middleware usage
 * This route requires authentication, rate limiting, and premium subscription
 */
async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: true,
      data: {
        message: 'This is a protected route',
        user: request.user,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}

// Apply middleware: rate limit -> auth -> subscription check -> handler
const protectedHandler = (request: NextRequest) =>
  composeMiddleware(
    withRateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
    withAuth,
    withSubscription('premium')
  )(request, handler as any);

export { protectedHandler as GET, protectedHandler as POST };
