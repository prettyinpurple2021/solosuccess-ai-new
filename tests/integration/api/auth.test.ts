import { describe, it, expect, vi } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, verifyAccessToken } from '@/lib/auth/jwt';
import { registerSchema, loginSchema } from '@/lib/auth/validation';

describe('Auth Integration Tests', () => {
  describe('Registration Flow', () => {
    it('should validate and hash password during registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      // Validate input
      const validation = registerSchema.safeParse(userData);
      expect(validation.success).toBe(true);

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      expect(hashedPassword).not.toBe(userData.password);

      // Verify password
      const isValid = await verifyPassword(userData.password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject invalid registration data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
      };

      const validation = registerSchema.safeParse(invalidData);
      expect(validation.success).toBe(false);
    });
  });

  describe('Login Flow', () => {
    it('should validate credentials and generate token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      // Validate input
      const validation = loginSchema.safeParse(credentials);
      expect(validation.success).toBe(true);

      // Simulate password verification
      const hashedPassword = await hashPassword(credentials.password);
      const isValid = await verifyPassword(credentials.password, hashedPassword);
      expect(isValid).toBe(true);

      // Generate token
      const token = generateAccessToken({
        userId: 'test-user-id',
        email: credentials.email,
        subscriptionTier: 'free',
      });

      expect(token).toBeDefined();

      // Verify token
      const decoded = verifyAccessToken(token);
      expect(decoded?.email).toBe(credentials.email);
    });

    it('should reject invalid credentials', async () => {
      const hashedPassword = await hashPassword('correct-password');
      const isValid = await verifyPassword('wrong-password', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should handle token lifecycle', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        subscriptionTier: 'free' as const,
      };

      // Generate token
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();

      // Verify token
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);

      // Invalid token should return null
      const invalidDecoded = verifyAccessToken('invalid.token.here');
      expect(invalidDecoded).toBeNull();
    });
  });
});
