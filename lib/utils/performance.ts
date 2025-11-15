/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit execution rate
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, options);
  }

  // Fallback for browsers that don't support requestIdleCallback
  return window.setTimeout(callback, 1) as unknown as number;
}

/**
 * Cancel idle callback wrapper
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window === 'undefined') return;

  if ('cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Check if device is low-end based on hardware concurrency
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;

  // Consider device low-end if it has <= 2 cores or <= 2GB RAM
  return cores <= 2 || memory <= 2;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;

  return window.devicePixelRatio || 1;
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Get optimal image quality based on connection and device
 */
export function getOptimalImageQuality(): number {
  if (typeof navigator === 'undefined') return 80;

  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  if (!connection) return 80;

  const effectiveType = connection.effectiveType;
  const saveData = connection.saveData;

  if (saveData) return 50;

  switch (effectiveType) {
    case '4g':
      return 90;
    case '3g':
      return 70;
    case '2g':
    case 'slow-2g':
      return 50;
    default:
      return 80;
  }
}

/**
 * Check if animations should be reduced
 */
export function shouldReduceAnimations(): boolean {
  return prefersReducedMotion() || isLowEndDevice();
}

/**
 * Get optimal blur intensity for glassmorphism
 */
export function getOptimalBlurIntensity(): 'light' | 'medium' | 'strong' {
  if (isLowEndDevice()) {
    return 'light';
  }

  const dpr = getDevicePixelRatio();
  if (dpr > 2) {
    return 'medium';
  }

  return 'strong';
}

/**
 * Batch DOM reads and writes
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  read(fn: () => void): void {
    this.readQueue.push(fn);
    this.schedule();
  }

  write(fn: () => void): void {
    this.writeQueue.push(fn);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;

    this.scheduled = true;
    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    // Execute all reads first
    while (this.readQueue.length > 0) {
      const fn = this.readQueue.shift();
      fn?.();
    }

    // Then execute all writes
    while (this.writeQueue.length > 0) {
      const fn = this.writeQueue.shift();
      fn?.();
    }

    this.scheduled = false;
  }
}

export const domBatcher = new DOMBatcher();
