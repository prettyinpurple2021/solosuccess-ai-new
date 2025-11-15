'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Hook to monitor web vitals and performance metrics
 */
export function usePerformanceMonitor(
  onMetric?: (metric: { name: string; value: number }) => void
) {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observe First Contentful Paint (FCP)
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime;
            metricsRef.current.fcp = value;
            onMetric?.({ name: 'FCP', value });
            console.log(`[Performance] FCP: ${value.toFixed(2)}ms`);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.error('[Performance] Failed to observe FCP:', error);
      }

      return observer;
    };

    // Observe Largest Contentful Paint (LCP)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          const value = lastEntry.startTime;
          metricsRef.current.lcp = value;
          onMetric?.({ name: 'LCP', value });
          console.log(`[Performance] LCP: ${value.toFixed(2)}ms`);
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.error('[Performance] Failed to observe LCP:', error);
      }

      return observer;
    };

    // Observe First Input Delay (FID)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          const value = fidEntry.processingStart - fidEntry.startTime;
          metricsRef.current.fid = value;
          onMetric?.({ name: 'FID', value });
          console.log(`[Performance] FID: ${value.toFixed(2)}ms`);
        }
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.error('[Performance] Failed to observe FID:', error);
      }

      return observer;
    };

    // Observe Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
            metricsRef.current.cls = clsValue;
            onMetric?.({ name: 'CLS', value: clsValue });
            console.log(`[Performance] CLS: ${clsValue.toFixed(4)}`);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.error('[Performance] Failed to observe CLS:', error);
      }

      return observer;
    };

    // Measure Time to First Byte (TTFB)
    const measureTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      if (navigationEntry) {
        const value = navigationEntry.responseStart - navigationEntry.requestStart;
        metricsRef.current.ttfb = value;
        onMetric?.({ name: 'TTFB', value });
        console.log(`[Performance] TTFB: ${value.toFixed(2)}ms`);
      }
    };

    // Initialize observers
    const fcpObserver = observeFCP();
    const lcpObserver = observeLCP();
    const fidObserver = observeFID();
    const clsObserver = observeCLS();

    // Measure TTFB
    if (document.readyState === 'complete') {
      measureTTFB();
    } else {
      window.addEventListener('load', measureTTFB);
    }

    // Cleanup
    return () => {
      fcpObserver?.disconnect();
      lcpObserver?.disconnect();
      fidObserver?.disconnect();
      clsObserver?.disconnect();
      window.removeEventListener('load', measureTTFB);
    };
  }, [onMetric]);

  return metricsRef.current;
}

/**
 * Hook to monitor component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (renderCount.current > 1) {
      console.log(
        `[Performance] ${componentName} render #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms since last render)`
      );
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
  };
}
