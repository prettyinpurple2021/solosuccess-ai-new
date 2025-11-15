import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers middleware
 * Adds comprehensive security headers to all responses
 */
export function withSecurityHeaders() {
  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const response = await handler(request);

    // HSTS - Force HTTPS for 2 years
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );

    // X-Frame-Options - Prevent clickjacking
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // X-Content-Type-Options - Prevent MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection - Enable XSS filter
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy - Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy - Disable unnecessary browser features
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Content-Security-Policy - Comprehensive CSP
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.stripe.com wss:",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

    // X-DNS-Prefetch-Control - Control DNS prefetching
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    return response;
  };
}

/**
 * API-specific security headers
 * More restrictive headers for API endpoints
 */
export function withApiSecurityHeaders() {
  return async (
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const response = await handler(request);

    // HSTS
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );

    // Prevent caching of sensitive API responses
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'DENY');

    // Content-Type for JSON APIs
    if (!response.headers.has('Content-Type')) {
      response.headers.set('Content-Type', 'application/json');
    }

    return response;
  };
}
