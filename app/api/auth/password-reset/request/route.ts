import { NextRequest, NextResponse } from 'next/server';
import { passwordResetRequestSchema } from '@/lib/auth/validation';
import { generateResetToken } from '@/lib/auth/password';
import { sendPasswordResetEmail } from '@/lib/email/sendgrid';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = passwordResetRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user && !user.deletedAt) {
      // Generate reset token
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Send reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't expose email sending errors to user
      }
    }

    // Always return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
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
