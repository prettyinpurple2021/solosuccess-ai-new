import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    subscriptionTier: string;
  };
}

/**
 * JWT verification middleware
 * Verifies the access token and attaches user info to request
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('accessToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token is invalid or expired',
          },
        },
        { status: 401 }
      );
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found or inactive',
          },
        },
        { status: 401 }
      );
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    };

    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Role-based access control middleware
 * Checks if user has required subscription tier
 */
export function withRole(requiredTiers: string[]) {
  return async (
    request: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    if (!requiredTiers.includes(request.user.subscriptionTier)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBSCRIPTION_REQUIRED',
            message: `This feature requires one of the following subscription tiers: ${requiredTiers.join(', ')}`,
          },
        },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * Subscription tier checking middleware
 * Checks if user has minimum required subscription tier
 */
export function withSubscription(minTier: 'free' | 'accelerator' | 'premium') {
  const tierHierarchy = {
    free: 0,
    accelerator: 1,
    premium: 2,
  };

  return async (
    request: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const userTierLevel = tierHierarchy[request.user.subscriptionTier as keyof typeof tierHierarchy] ?? 0;
    const requiredTierLevel = tierHierarchy[minTier];

    if (userTierLevel < requiredTierLevel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FEATURE_NOT_AVAILABLE',
            message: `This feature requires ${minTier} subscription or higher`,
            details: {
              currentTier: request.user.subscriptionTier,
              requiredTier: minTier,
            },
          },
        },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * Verify authentication and return user info
 * Utility function for route handlers
 */
export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: {
    userId: string;
    email: string;
    subscriptionTier: string;
  };
}> {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('accessToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return { authenticated: false };
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return { authenticated: false };
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: {
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
      },
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false };
  }
}
