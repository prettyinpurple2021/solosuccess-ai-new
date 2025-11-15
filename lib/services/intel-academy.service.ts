import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { encrypt, decrypt } from '@/lib/security/encryption';
import { generateSecureRandomString } from '@/lib/security/encryption';
import { notificationService } from './notification-service';

const INTEL_ACADEMY_API_URL = process.env.INTEL_ACADEMY_API_URL || 'https://api.intelacademy.com';
const INTEL_ACADEMY_CLIENT_ID = process.env.INTEL_ACADEMY_CLIENT_ID || '';
const INTEL_ACADEMY_CLIENT_SECRET = process.env.INTEL_ACADEMY_CLIENT_SECRET || '';
const INTEL_ACADEMY_REDIRECT_URI = process.env.INTEL_ACADEMY_REDIRECT_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface IntelAcademyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface IntelAcademyUserInfo {
  id: string;
  email: string;
  name: string;
  subscription_tier: string;
}

export interface IntelAcademyCourse {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  progress: number;
  status: string;
  enrollmentDate?: string;
  completionDate?: string;
  lastAccessedAt?: string;
}

export interface IntelAcademyAchievement {
  id: string;
  name: string;
  type: string;
  description?: string;
  badgeUrl?: string;
  earnedAt: string;
}

export class IntelAcademyService {
  /**
   * Check rate limit for user
   */
  private static checkRateLimit(userId: string): void {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
      // Reset or initialize rate limit
      rateLimitMap.set(userId, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW,
      });
      return;
    }

    if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
      const waitTime = Math.ceil((userLimit.resetAt - now) / 1000);
      throw new Error(`Rate limit exceeded. Please try again in ${waitTime} seconds.`);
    }

    userLimit.count++;
  }

  /**
   * Retry logic with exponential backoff
   */
  private static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('400') || error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }

        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Generate OAuth 2.0 authorization URL for Intel Academy
   */
  static getAuthorizationUrl(userId: string, state?: string): string {
    const stateParam = state || generateSecureRandomString(32);
    
    const params = new URLSearchParams({
      client_id: INTEL_ACADEMY_CLIENT_ID,
      redirect_uri: INTEL_ACADEMY_REDIRECT_URI,
      response_type: 'code',
      scope: 'profile courses achievements',
      state: stateParam,
    });

    return `${INTEL_ACADEMY_API_URL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<IntelAcademyTokenResponse> {
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${INTEL_ACADEMY_API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          client_id: INTEL_ACADEMY_CLIENT_ID,
          client_secret: INTEL_ACADEMY_CLIENT_SECRET,
          redirect_uri: INTEL_ACADEMY_REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to exchange code for token: ${response.status} ${errorText}`);
      }

      return response.json();
    });
  }

  /**
   * Refresh access token using refresh token with automatic retry
   */
  static async refreshAccessToken(refreshToken: string): Promise<IntelAcademyTokenResponse> {
    // Decrypt the refresh token before using it
    const decryptedRefreshToken = decrypt(refreshToken);
    
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${INTEL_ACADEMY_API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: decryptedRefreshToken,
          client_id: INTEL_ACADEMY_CLIENT_ID,
          client_secret: INTEL_ACADEMY_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
      }

      return response.json();
    }, 3, 1000);
  }

  /**
   * Generate JWT token for Intel Academy SSO
   */
  static async generateSSOToken(
    userId: string,
    email: string,
    subscriptionTier: string,
    intelAcademyUserId?: string
  ): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    const token = await new SignJWT({
      userId,
      email,
      subscriptionTier,
      intelAcademyUserId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('solosuccess-ai')
      .setAudience('intel-academy')
      .setExpirationTime('1h') // 1 hour expiration
      .sign(secret);

    return token;
  }

  /**
   * Verify JWT token from Intel Academy
   */
  static async verifyIntelAcademyToken(token: string): Promise<any> {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'solosuccess-ai',
        audience: 'intel-academy',
      });
      return payload;
    } catch (error) {
      throw new Error('Invalid Intel Academy token');
    }
  }

  /**
   * Store Intel Academy integration for user with encrypted tokens
   */
  static async storeIntegration(
    userId: string,
    tokenData: IntelAcademyTokenResponse,
    intelAcademyUserId?: string
  ) {
    const tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);

    return prisma.intelAcademyIntegration.upsert({
      where: { userId },
      create: {
        userId,
        intelAcademyUserId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        lastSyncAt: new Date(),
        syncStatus: 'synced',
        isActive: true,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        lastSyncAt: new Date(),
        syncStatus: 'synced',
        isActive: true,
      },
    });
  }

  /**
   * Get Intel Academy integration for user
   */
  static async getIntegration(userId: string) {
    return prisma.intelAcademyIntegration.findUnique({
      where: { userId },
    });
  }

  /**
   * Check if access token is expired and refresh if needed
   */
  static async ensureValidToken(userId: string): Promise<string> {
    const integration = await this.getIntegration(userId);

    if (!integration) {
      throw new Error('Intel Academy integration not found');
    }

    if (!integration.accessToken || !integration.refreshToken) {
      throw new Error('No tokens available');
    }

    // Check if token is expired or will expire in next 5 minutes
    const now = new Date();
    const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000);

    if (integration.tokenExpiry && integration.tokenExpiry > expiryBuffer) {
      // Decrypt and return the access token
      return decrypt(integration.accessToken);
    }

    // Token expired, refresh it
    try {
      const newTokenData = await this.refreshAccessToken(integration.refreshToken);
      await this.storeIntegration(userId, newTokenData, integration.intelAcademyUserId || undefined);
      return newTokenData.access_token;
    } catch (error) {
      // Mark integration as inactive if refresh fails
      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          isActive: false,
          syncStatus: 'failed',
        },
      });
      
      // Send notification about expired connection (non-blocking)
      notificationService.notifyIntelAcademyDisconnected(
        userId,
        'Your Intel Academy connection has expired. Please reconnect to continue syncing your learning progress.'
      ).catch((error) => {
        console.error('Error sending Intel Academy expiration notification:', error);
      });
      
      throw error;
    }
  }

  /**
   * Get user info from Intel Academy with rate limiting
   */
  static async getUserInfo(userId: string, accessToken: string): Promise<IntelAcademyUserInfo> {
    this.checkRateLimit(userId);

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${INTEL_ACADEMY_API_URL}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get user info: ${response.status} ${errorText}`);
      }

      return response.json();
    });
  }

  /**
   * Fetch user courses from Intel Academy
   */
  static async fetchUserCourses(userId: string, accessToken: string): Promise<IntelAcademyCourse[]> {
    this.checkRateLimit(userId);

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${INTEL_ACADEMY_API_URL}/api/v1/user/courses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch courses: ${response.status} ${errorText}`);
      }

      return response.json();
    });
  }

  /**
   * Fetch user achievements from Intel Academy
   */
  static async fetchUserAchievements(userId: string, accessToken: string): Promise<IntelAcademyAchievement[]> {
    this.checkRateLimit(userId);

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${INTEL_ACADEMY_API_URL}/api/v1/user/achievements`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch achievements: ${response.status} ${errorText}`);
      }

      return response.json();
    });
  }

  /**
   * Get SSO redirect URL for Intel Academy
   */
  static async getSSORedirectUrl(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, subscriptionTier: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const integration = await this.getIntegration(userId);
    const intelAcademyUserId = integration?.intelAcademyUserId;

    const ssoToken = await this.generateSSOToken(
      userId,
      user.email,
      user.subscriptionTier,
      intelAcademyUserId || undefined
    );
    
    return `${INTEL_ACADEMY_API_URL}/sso/login?token=${ssoToken}`;
  }

  /**
   * Sync subscription tier with Intel Academy
   */
  static async syncSubscriptionTier(userId: string, subscriptionTier: string): Promise<void> {
    this.checkRateLimit(userId);

    try {
      const accessToken = await this.ensureValidToken(userId);

      await this.retryWithBackoff(async () => {
        const response = await fetch(`${INTEL_ACADEMY_API_URL}/api/v1/user/subscription`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            subscription_tier: subscriptionTier,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to sync subscription tier: ${response.status} ${errorText}`);
        }
      });

      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'synced',
        },
      });
    } catch (error) {
      console.error('Error syncing subscription tier:', error);
      
      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          syncStatus: 'failed',
        },
      });
      
      throw error;
    }
  }

  /**
   * Disconnect Intel Academy integration
   */
  static async disconnectIntegration(userId: string): Promise<void> {
    const integration = await this.getIntegration(userId);
    
    if (integration && integration.accessToken) {
      try {
        // Attempt to revoke the token with Intel Academy
        const accessToken = decrypt(integration.accessToken);
        await fetch(`${INTEL_ACADEMY_API_URL}/oauth/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: accessToken,
            client_id: INTEL_ACADEMY_CLIENT_ID,
            client_secret: INTEL_ACADEMY_CLIENT_SECRET,
          }),
        });
      } catch (error) {
        console.error('Error revoking token:', error);
        // Continue with disconnect even if revocation fails
      }
    }

    await prisma.intelAcademyIntegration.update({
      where: { userId },
      data: {
        isActive: false,
        accessToken: null,
        refreshToken: null,
        syncStatus: 'disconnected',
      },
    });
  }
}
