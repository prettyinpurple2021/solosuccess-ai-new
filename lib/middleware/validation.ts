import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { sanitizeHtml, sanitizeInput } from '@/lib/validation/schemas';

/**
 * Validation middleware
 * Validates request body against a Zod schema
 */
export function withValidation<T extends z.ZodType>(schema: T) {
  return async (
    request: NextRequest,
    handler: (req: NextRequest & { validatedData: z.infer<T> }) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      // Parse request body
      let body: any;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: 'Invalid JSON in request body',
            },
          },
          { status: 400 }
        );
      }

      // Validate against schema
      const validatedData = schema.parse(body);

      // Attach validated data to request
      (request as any).validatedData = validatedData;

      return handler(request as any);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      console.error('Validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Validation error',
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Query parameter validation middleware
 */
export function withQueryValidation<T extends z.ZodType>(schema: T) {
  return async (
    request: NextRequest,
    handler: (req: NextRequest & { validatedQuery: z.infer<T> }) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      // Extract query parameters
      const { searchParams } = new URL(request.url);
      const query: Record<string, any> = {};

      searchParams.forEach((value, key) => {
        query[key] = value;
      });

      // Validate against schema
      const validatedQuery = schema.parse(query);

      // Attach validated query to request
      (request as any).validatedQuery = validatedQuery;

      return handler(request as any);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Query parameter validation failed',
              details: error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      console.error('Query validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Validation error',
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * XSS prevention middleware
 * Sanitizes string inputs to prevent XSS attacks
 */
export function withXssProtection() {
  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      // Parse request body
      const body = await request.json().catch(() => ({}));

      // Recursively sanitize all string values
      const sanitizedBody = sanitizeObject(body);

      // Replace request body with sanitized version
      const sanitizedRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitizedBody),
      });

      return handler(sanitizedRequest);
    } catch (error) {
      console.error('XSS protection middleware error:', error);
      return handler(request);
    }
  };
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * SQL injection prevention middleware
 * Note: Prisma ORM already prevents SQL injection, but this adds extra validation
 */
export function withSqlInjectionProtection() {
  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      // Check for common SQL injection patterns in URL and headers
      const url = request.url.toLowerCase();
      const sqlPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
        /((\%27)|(\'))union/i,
        /exec(\s|\+)+(s|x)p\w+/i,
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(url)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_INPUT',
                message: 'Invalid characters detected in request',
              },
            },
            { status: 400 }
          );
        }
      }

      return handler(request);
    } catch (error) {
      console.error('SQL injection protection middleware error:', error);
      return handler(request);
    }
  };
}

/**
 * File upload validation middleware
 */
export function withFileUploadValidation(options: {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedMimeTypes = [],
    allowedExtensions = [],
  } = options;

  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    try {
      const contentType = request.headers.get('content-type') || '';

      if (!contentType.includes('multipart/form-data')) {
        return handler(request);
      }

      // Get content length
      const contentLength = parseInt(request.headers.get('content-length') || '0');

      if (contentLength > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
            },
          },
          { status: 413 }
        );
      }

      return handler(request);
    } catch (error) {
      console.error('File upload validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'File upload validation error',
          },
        },
        { status: 500 }
      );
    }
  };
}
