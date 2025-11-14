import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/auth';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PASSWORD', message: 'Password is required' } },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid password' } },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid password' } },
        { status: 401 }
      );
    }

    // Soft delete user (set deletedAt timestamp)
    // This allows for data recovery if needed
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${userId}@deleted.com`, // Prevent email conflicts
      },
    });

    // Note: In production, you might want to:
    // 1. Cancel Stripe subscriptions
    // 2. Schedule hard deletion after grace period
    // 3. Send confirmation email
    // 4. Log the deletion for audit purposes

    return NextResponse.json({
      success: true,
      data: {
        message: 'Account deleted successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete account',
        },
      },
      { status: 500 }
    );
  }
}
