import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('accessToken')?.value;

    // If token exists, increment token version to invalidate all refresh tokens
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        await prisma.user.update({
          where: { id: payload.userId },
          data: {
            tokenVersion: {
              increment: 1,
            },
          },
        });
      }
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: 'Logged out successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

    // Clear cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during logout',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
