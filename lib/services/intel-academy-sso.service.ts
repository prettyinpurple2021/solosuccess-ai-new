import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const INTEL_ACADEMY_API_URL = process.env.INTEL_ACADEMY_API_URL || 'https://api.intelacademy.com';
const JWT_SECRET = process.env.JWT_SECRET || '';

export interface SSOTokenPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  intelAcademyUserId?: string;
}

/**
 * Service for Intel Academy SSO token generation and management
 */
export class IntelAcademySSOService {
  /**
   * Generate JWT token for Intel Academy SSO with 1-hour expiration
   */
  static async generateSSOToken(payload: SSOTokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    const token = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      subscriptionTier: payload.subscriptionTier,
      intelAcademyUserId: payload.intelAcademyUserId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('solosuccess-ai')
      .setAudience('intel-academy')
      .setExpirationTime('1h') // 1 hour expiration as per requirements
      .sign(secret);

    return token;
  }

  /**
   * Verify SSO JWT token
   */
  static async verifySSOToken(token: string): Promise<SSOTokenPayload> {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'solosuccess-ai',
        audience: 'intel-academy',
      });

      return {
        userId: payload.userId as string,
        email: payload.email as string,
        subscriptionTier: payload.subscriptionTier as string,
        intelAcademyUserId: payload.intelAcademyUserId as string | undefined,
      };
    } catch (error) {
      throw new Error('Invalid or expired SSO token');
    }
  }

  /**
   * Build SSO redirect URL with token
   */
  static buildSSORedirectUrl(token: string): string {
    const params = new URLSearchParams({
      token,
    });

    return `${INTEL_ACADEMY_API_URL}/sso/login?${params.toString()}`;
  }

  /**
   * Generate SSO token and redirect URL for user
   */
  static async generateSSORedirectForUser(userId: string): Promise<string> {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch Intel Academy integration
    const integration = await prisma.intelAcademyIntegration.findUnique({
      where: { userId },
      select: {
        intelAcademyUserId: true,
        isActive: true,
      },
    });

    if (!integration || !integration.isActive) {
      throw new Error('Intel Academy integration not active');
    }

    // Generate SSO token
    const token = await this.generateSSOToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      intelAcademyUserId: integration.intelAcademyUserId || undefined,
    });

    // Build and return redirect URL
    return this.buildSSORedirectUrl(token);
  }

  /**
   * Log SSO event for security monitoring
   */
  static async logSSOEvent(
    userId: string,
    success: boolean,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          type: 'sso_redirect',
          severity: success ? 'low' : 'medium',
          userId,
          ip,
          userAgent,
          resource: 'intel_academy',
          action: success ? 'sso_success' : 'sso_failed',
          details: {
            success,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Error logging SSO event:', error);
      // Don't throw - logging failure shouldn't break SSO
    }
  }
}
