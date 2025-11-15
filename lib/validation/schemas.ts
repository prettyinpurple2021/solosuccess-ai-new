import { z } from 'zod';

/**
 * Common validation schemas using Zod
 * Provides comprehensive input validation and sanitization
 */

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .trim()
    .optional(),
});

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset confirmation schema
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

// User profile update schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .trim()
    .optional(),
  businessName: z
    .string()
    .max(100, 'Business name must not exceed 100 characters')
    .trim()
    .optional(),
  businessType: z
    .string()
    .max(50, 'Business type must not exceed 50 characters')
    .trim()
    .optional(),
  industry: z
    .string()
    .max(50, 'Industry must not exceed 50 characters')
    .trim()
    .optional(),
});

// AI message schema
export const aiMessageSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(10000, 'Message must not exceed 10000 characters')
    .trim(),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
});

// Mission Control schema
export const missionControlSchema = z.object({
  objective: z
    .string()
    .min(10, 'Objective must be at least 10 characters')
    .max(5000, 'Objective must not exceed 5000 characters')
    .trim(),
  context: z
    .object({
      businessType: z.string().max(50).optional(),
      timeline: z.string().max(100).optional(),
      constraints: z.array(z.string().max(200)).max(10).optional(),
    })
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Competitor profile schema
export const competitorProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Competitor name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  website: z
    .string()
    .url('Invalid website URL')
    .max(255, 'Website URL must not exceed 255 characters')
    .optional(),
  industry: z
    .string()
    .max(50, 'Industry must not exceed 50 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  trackingSources: z
    .array(
      z.object({
        type: z.enum(['website', 'social', 'news']),
        url: z.string().url('Invalid source URL'),
      })
    )
    .max(10, 'Maximum 10 tracking sources allowed'),
});

// Content generation schema
export const contentGenerationSchema = z.object({
  contentType: z.enum(['social', 'email', 'blog', 'ad']),
  platform: z
    .enum(['twitter', 'linkedin', 'facebook', 'instagram', 'email', 'blog'])
    .optional(),
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(200, 'Topic must not exceed 200 characters')
    .trim(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  keywords: z.array(z.string().max(50)).max(10).optional(),
});

// Document generation schema
export const documentGenerationSchema = z.object({
  templateType: z.enum(['contract', 'proposal', 'nda', 'terms', 'privacy']),
  customization: z
    .object({
      companyName: z.string().max(100).optional(),
      jurisdiction: z.string().max(50).optional(),
      effectiveDate: z.string().datetime().optional(),
    })
    .optional(),
  fields: z.record(z.string(), z.any()).optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename format'),
  mimeType: z
    .string()
    .regex(/^[a-z]+\/[a-z0-9.+-]+$/, 'Invalid MIME type'),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
});

// Goal creation schema
export const goalSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  category: z
    .string()
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
  targetValue: z.number().positive().optional(),
  targetDate: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input for database queries
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate file extension against allowed types
 */
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Allowed file extensions for uploads
 */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
export const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];
export const ALLOWED_AVATAR_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
