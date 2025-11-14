import { NextRequest, NextResponse } from 'next/server';
import { mfaVerifySchema } from '@/lib/auth/validation';
import { verifyMfaCode, verifyRecoveryCode } from '@/lib/auth/mfa';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Validate input
    const validation = mfaVerifySchema.safeParse({
      userId: payload.userId,
      code: body.code,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { userId, code } = validation.data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mfaSecret: true,
        mfaEnabled: true,
        recoveryCodes: true,
      },
    });

    if (!user || !user.mfaSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MFA_NOT_SETUP',
            message: 'MFA is not set up for this account',
          },
        },
        { status: 400 }
      );
    }

    // Try to verify as TOTP code first
    const isTotpValid = verifyMfaCode(user.mfaSecret, code);

    if (isTotpValid) {
      // Enable MFA if this is the first verification
      if (!user.mfaEnabled) {
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaEnabled: true },
        });
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'MFA code verified successfully',
            mfaEnabled: true,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    // Try to verify as recovery code
    const { valid, remainingCodes } = verifyRecoveryCode(
      user.recoveryCodes,
      code
    );

    if (valid) {
      // Update recovery codes (remove used one)
      await prisma.user.update({
        where: { id: user.id },
        data: { recoveryCodes: remainingCodes },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Recovery code verified successfully',
            remainingRecoveryCodes: remainingCodes.length,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    // Neither TOTP nor recovery code is valid
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_MFA_CODE',
          message: 'Invalid MFA code or recovery code',
        },
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('MFA verification error:', error);
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
