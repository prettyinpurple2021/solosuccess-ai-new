/**
 * Color theme system for SoloSuccess AI
 * Provides consistent color palettes across the application
 */

export type ColorTheme = 'blue' | 'purple' | 'teal' | 'sunset' | 'ocean';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

export const colorThemes: Record<ColorTheme, ThemeColors> = {
  blue: {
    primary: '#3B82F6', // blue-500
    secondary: '#6366F1', // indigo-500
    accent: '#1E40AF', // blue-800
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #1E40AF 100%)',
  },
  purple: {
    primary: '#9333EA', // purple-600
    secondary: '#A855F7', // purple-500
    accent: '#7C3AED', // violet-600
    gradient: 'linear-gradient(135deg, #9333EA 0%, #A855F7 50%, #7C3AED 100%)',
  },
  teal: {
    primary: '#14B8A6', // teal-500
    secondary: '#06B6D4', // cyan-500
    accent: '#0891B2', // cyan-600
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #0891B2 100%)',
  },
  sunset: {
    primary: '#F97316', // orange-500
    secondary: '#EC4899', // pink-500
    accent: '#9333EA', // purple-600
    gradient: 'linear-gradient(135deg, #F97316 0%, #EC4899 50%, #9333EA 100%)',
  },
  ocean: {
    primary: '#60A5FA', // blue-400
    secondary: '#2DD4BF', // teal-400
    accent: '#22D3EE', // cyan-400
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #2DD4BF 50%, #22D3EE 100%)',
  },
};

/**
 * Get theme colors by name
 */
export const getThemeColors = (theme: ColorTheme): ThemeColors => {
  return colorThemes[theme];
};

/**
 * Get CSS gradient string for a theme
 */
export const getThemeGradient = (theme: ColorTheme): string => {
  return colorThemes[theme].gradient;
};
