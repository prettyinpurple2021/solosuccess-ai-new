import { NextRequest, NextResponse } from 'next/server';
import { generateMfaSecret } from '@/lib/auth/mfa';
import { generateRecoveryCodes } from '@/lib/auth/password';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie or header
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
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
        },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
      },
    });

    if (!user) {
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

    // Check if MFA is already enabled
    if (user.mfaEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MFA_ALREADY_ENABLED',
            message: 'MFA is already enabled for this account',
          },
        },
        { status: 400 }
      );
    }

    // Generate MFA secret and QR code
    const { secret, qrCode } = await generateMfaSecret(user.email);

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes(10);

    // Store MFA secret (not enabled yet until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaSecret: secret,
        recoveryCodes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          secret,
          qrCode,
          recoveryCodes,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
