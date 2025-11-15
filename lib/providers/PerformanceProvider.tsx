'use client';

import React, { useEffect } from 'react';
import { usePerformanceMonitor } from '@/lib/hooks/usePerformanceMonitor';

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Monitor web vitals
  usePerformanceMonitor((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value),
          event_category: 'Web Vitals',
          non_interaction: true,
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch((error) => {
        console.error('[Performance] Failed to send vitals:', error);
      });
    }
  });

  useEffect(() => {
    // Report long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(
                `[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`,
                entry
              );
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });

        return () => observer.disconnect();
      } catch (error) {
        // longtask not supported
      }
    }
  }, []);

  return <>{children}</>;
};
