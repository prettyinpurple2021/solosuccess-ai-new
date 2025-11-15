import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  passwordResetConfirmSchema,
} from '@/lib/auth/validation';

describe('Auth Validation', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };
      
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123',
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'securepass123',
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetConfirmSchema', () => {
    it('should validate correct reset password data', () => {
      const validData = {
        token: 'valid-reset-token',
        newPassword: 'NewSecurePass123',
      };
      
      const result = passwordResetConfirmSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const invalidData = {
        token: 'valid-reset-token',
        newPassword: 'weak',
      };
      
      const result = passwordResetConfirmSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const invalidData = {
        token: '',
        newPassword: 'NewSecurePass123',
      };
      
      const result = passwordResetConfirmSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
