import { prisma } from '@/lib/prisma';

export interface IntegrationConfig {
  provider: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export class IntegrationService {
  private static integrationConfigs: Record<string, IntegrationConfig> = {
    google_analytics: {
      provider: 'google_analytics',
      clientId: process.env.GOOGLE_ANALYTICS_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_ANALYTICS_REDIRECT_URI || '',
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    },
    stripe: {
      provider: 'stripe',
      clientId: process.env.STRIPE_CLIENT_ID || '',
      clientSecret: process.env.STRIPE_SECRET_KEY || '',
      redirectUri: process.env.STRIPE_REDIRECT_URI || '',
      scopes: ['read_only'],
    },
  };

  static async getAuthorizationUrl(
    provider: string,
    userId: string,
    state?: string
  ): Promise<string> {
    const config = this.integrationConfigs[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state: state || userId,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrls: Record<string, string> = {
      google_analytics: 'https://accounts.google.com/o/oauth2/v2/auth',
      stripe: 'https://connect.stripe.com/oauth/authorize',
    };

    return `${authUrls[provider]}?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    provider: string,
    code: string
  ): Promise<OAuthTokenResponse> {
    const config = this.integrationConfigs[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const tokenUrls: Record<string, string> = {
      google_analytics: 'https://oauth2.googleapis.com/token',
      stripe: 'https://connect.stripe.com/oauth/token',
    };

    const response = await fetch(tokenUrls[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  static async refreshAccessToken(
    provider: string,
    refreshToken: string
  ): Promise<OAuthTokenResponse> {
    const config = this.integrationConfigs[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const tokenUrls: Record<string, string> = {
      google_analytics: 'https://oauth2.googleapis.com/token',
      stripe: 'https://connect.stripe.com/oauth/token',
    };

    const response = await fetch(tokenUrls[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    return response.json();
  }

  static async saveIntegration(
    userId: string,
    provider: string,
    tokenData: OAuthTokenResponse,
    metadata?: any
  ) {
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    return prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      create: {
        userId,
        provider,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: expiresAt,
        scope: tokenData.scope,
        metadata,
        isActive: true,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || undefined,
        tokenExpiry: expiresAt,
        scope: tokenData.scope,
        metadata,
        isActive: true,
        lastSyncAt: new Date(),
      },
    });
  }

  static async getIntegration(userId: string, provider: string) {
    return prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
  }

  static async getActiveIntegrations(userId: string) {
    return prisma.integration.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  static async getValidAccessToken(
    userId: string,
    provider: string
  ): Promise<string> {
    const integration = await this.getIntegration(userId, provider);
    if (!integration || !integration.isActive) {
      throw new Error(`No active integration found for ${provider}`);
    }

    // Check if token is expired
    if (
      integration.tokenExpiry &&
      integration.tokenExpiry < new Date()
    ) {
      // Refresh token
      if (!integration.refreshToken) {
        throw new Error('Token expired and no refresh token available');
      }

      const newTokenData = await this.refreshAccessToken(
        provider,
        integration.refreshToken
      );
      await this.saveIntegration(userId, provider, newTokenData);
      return newTokenData.access_token;
    }

    return integration.accessToken || '';
  }

  static async disconnectIntegration(userId: string, provider: string) {
    return prisma.integration.update({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      data: {
        isActive: false,
      },
    });
  }

  static async deleteIntegration(userId: string, provider: string) {
    return prisma.integration.delete({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
  }
}
