/**
 * Sentry server-side configuration
 * This file configures Sentry for Node.js/Edge runtime
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Performance monitoring
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive environment variables
    if (event.extra) {
      delete event.extra.DATABASE_URL;
      delete event.extra.NEXTAUTH_SECRET;
      delete event.extra.OPENAI_API_KEY;
      delete event.extra.STRIPE_SECRET_KEY;
      delete event.extra.JWT_SECRET;
    }
    
    return event;
  },
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
});
