import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_MISSING',
            message: 'Refresh token not found',
          },
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid or expired refresh token',
          },
        },
        { status: 401 }
      );
    }

    // Get user and verify token version
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        tokenVersion: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Check token version for rotation
    if (user.tokenVersion !== payload.tokenVersion) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Refresh token has been revoked',
          },
        },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          token: newAccessToken,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

    // Set new HTTP-only cookies
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during token refresh',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
