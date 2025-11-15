import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const INTEL_ACADEMY_API_URL = process.env.INTEL_ACADEMY_API_URL || 'https://api.intelacademy.com';
const INTEL_ACADEMY_CLIENT_ID = process.env.INTEL_ACADEMY_CLIENT_ID || '';
const INTEL_ACADEMY_CLIENT_SECRET = process.env.INTEL_ACADEMY_CLIENT_SECRET || '';
const INTEL_ACADEMY_REDIRECT_URI = process.env.INTEL_ACADEMY_REDIRECT_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

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

export class IntelAcademyService {
  /**
   * Generate OAuth 2.0 authorization URL for Intel Academy
   */
  static getAuthorizationUrl(userId: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: INTEL_ACADEMY_CLIENT_ID,
      redirect_uri: INTEL_ACADEMY_REDIRECT_URI,
      response_type: 'code',
      scope: 'profile courses achievements',
      state: state || userId,
    });

    return `${INTEL_ACADEMY_API_URL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<IntelAcademyTokenResponse> {
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
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<IntelAcademyTokenResponse> {
    const response = await fetch(`${INTEL_ACADEMY_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: INTEL_ACADEMY_CLIENT_ID,
        client_secret: INTEL_ACADEMY_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate JWT token for Intel Academy SSO
   */
  static generateSSOToken(userId: string, email: string, subscriptionTier: string): string {
    const payload = {
      userId,
      email,
      subscriptionTier,
      iss: 'solosuccess-ai',
      aud: 'intel-academy',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    return jwt.sign(payload, JWT_SECRET);
  }

  /**
   * Verify JWT token from Intel Academy
   */
  static verifyIntelAcademyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid Intel Academy token');
    }
  }

  /**
   * Store Intel Academy integration for user
   */
  static async storeIntegration(
    userId: string,
    tokenData: IntelAcademyTokenResponse,
    intelAcademyUserId?: string
  ) {
    const tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

    return prisma.intelAcademyIntegration.upsert({
      where: { userId },
      create: {
        userId,
        intelAcademyUserId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry,
        lastSyncAt: new Date(),
        syncStatus: 'active',
        isActive: true,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry,
        lastSyncAt: new Date(),
        syncStatus: 'active',
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
      return integration.accessToken;
    }

    // Token expired, refresh it
    const newTokenData = await this.refreshAccessToken(integration.refreshToken);
    await this.storeIntegration(userId, newTokenData, integration.intelAcademyUserId || undefined);

    return newTokenData.access_token;
  }

  /**
   * Get user info from Intel Academy
   */
  static async getUserInfo(accessToken: string): Promise<IntelAcademyUserInfo> {
    const response = await fetch(`${INTEL_ACADEMY_API_URL}/api/v1/user/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Redirect user to Intel Academy with SSO token
   */
  static async getRedirectUrl(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, subscriptionTier: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const ssoToken = this.generateSSOToken(userId, user.email, user.subscriptionTier);
    
    return `${INTEL_ACADEMY_API_URL}/sso/login?token=${ssoToken}`;
  }

  /**
   * Sync subscription tier with Intel Academy
   */
  static async syncSubscriptionTier(userId: string, subscriptionTier: string): Promise<void> {
    try {
      const accessToken = await this.ensureValidToken(userId);

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
        throw new Error(`Failed to sync subscription tier: ${response.statusText}`);
      }

      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'active',
        },
      });
    } catch (error) {
      console.error('Error syncing subscription tier:', error);
      
      await prisma.intelAcademyIntegration.update({
        where: { userId },
        data: {
          syncStatus: 'error',
        },
      });
      
      throw error;
    }
  }

  /**
   * Disconnect Intel Academy integration
   */
  static async disconnectIntegration(userId: string): Promise<void> {
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
