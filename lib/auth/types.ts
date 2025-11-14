// Authentication types and interfaces

export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    subscriptionTier: string;
    emailVerified: boolean;
  };
  token: string;
  refreshToken: string;
  requiresMfa?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  recoveryCodes: string[];
}

export interface MfaVerifyRequest {
  userId: string;
  code: string;
}
