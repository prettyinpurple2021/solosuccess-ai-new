/**
 * Responsive utility functions and constants
 */

export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1920,
} as const;

export const TOUCH_TARGET_SIZE = {
  min: 44, // Minimum touch target size in pixels (WCAG 2.1 AA)
  comfortable: 48, // Comfortable touch target size
  large: 56, // Large touch target for primary actions
} as const;

/**
 * Get responsive font size based on viewport
 */
export function getResponsiveFontSize(
  base: number,
  scale: { mobile?: number; tablet?: number; desktop?: number } = {}
): string {
  const mobileSize = scale.mobile ?? base * 0.875; // 87.5% of base
  const tabletSize = scale.tablet ?? base;
  const desktopSize = scale.desktop ?? base * 1.125; // 112.5% of base

  return `clamp(${mobileSize}px, ${base}px + 0.5vw, ${desktopSize}px)`;
}

/**
 * Get responsive spacing based on viewport
 */
export function getResponsiveSpacing(
  base: number,
  scale: { mobile?: number; tablet?: number; desktop?: number } = {}
): string {
  const mobileSpacing = scale.mobile ?? base * 0.75;
  const tabletSpacing = scale.tablet ?? base;
  const desktopSpacing = scale.desktop ?? base * 1.25;

  return `clamp(${mobileSpacing}rem, ${base}rem + 0.5vw, ${desktopSpacing}rem)`;
}

/**
 * Check if device is likely a touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get optimal image sizes for responsive images
 */
export function getResponsiveImageSizes(
  sizes: { mobile?: number; tablet?: number; desktop?: number } = {}
): string {
  const mobile = sizes.mobile ?? 100;
  const tablet = sizes.tablet ?? 50;
  const desktop = sizes.desktop ?? 33;

  return `(max-width: 767px) ${mobile}vw, (max-width: 1023px) ${tablet}vw, ${desktop}vw`;
}

/**
 * Responsive container max widths
 */
export const CONTAINER_MAX_WIDTH = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;
