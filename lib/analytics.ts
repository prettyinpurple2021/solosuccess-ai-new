/**
 * Analytics tracking service
 * Integrates PostHog for product analytics
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

interface UserProperties {
  userId?: string;
  email?: string;
  subscriptionTier?: string;
  [key: string]: any;
}

class Analytics {
  private initialized = false;
  private userId: string | null = null;

  /**
   * Initialize analytics tracking
   */
  init() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    // PostHog initialization
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      // Dynamic import to avoid SSR issues
      import('posthog-js').then((posthog) => {
        posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.opt_out_capturing();
            }
          },
          capture_pageview: false, // We'll manually capture pageviews
          capture_pageleave: true,
          autocapture: false, // Manual event tracking for better control
        });
      });
    }

    this.initialized = true;
  }

  /**
   * Identify user for analytics
   */
  identify(userId: string, properties?: UserProperties) {
    if (typeof window === 'undefined') return;

    this.userId = userId;

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then((posthog) => {
        posthog.default.identify(userId, properties);
      });
    }
  }

  /**
   * Track custom event
   */
  track(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then((posthog) => {
        posthog.default.capture(event, properties);
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }
  }

  /**
   * Track page view
   */
  page(pageName?: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then((posthog) => {
        posthog.default.capture('$pageview', {
          $current_url: window.location.href,
          page_name: pageName,
          ...properties,
        });
      });
    }
  }

  /**
   * Reset analytics (on logout)
   */
  reset() {
    if (typeof window === 'undefined') return;

    this.userId = null;

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then((posthog) => {
        posthog.default.reset();
      });
    }
  }

  /**
   * Track user signup
   */
  trackSignup(method: 'email' | 'google' | 'linkedin', userId: string) {
    this.track('user_signup', {
      method,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track user login
   */
  trackLogin(method: 'email' | 'google' | 'linkedin', userId: string) {
    this.track('user_login', {
      method,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track subscription events
   */
  trackSubscription(action: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate', tier: string) {
    this.track('subscription_change', {
      action,
      tier,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track AI agent interactions
   */
  trackAgentInteraction(agentId: string, action: 'start_chat' | 'send_message' | 'end_chat') {
    this.track('agent_interaction', {
      agent_id: agentId,
      action,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track Mission Control usage
   */
  trackMissionControl(action: 'start' | 'complete' | 'cancel', objective?: string) {
    this.track('mission_control', {
      action,
      objective: objective?.substring(0, 100), // Truncate for privacy
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>) {
    this.track('feature_usage', {
      feature,
      action,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track errors (non-critical)
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track('client_error', {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500),
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export types
export type { AnalyticsEvent, UserProperties };
