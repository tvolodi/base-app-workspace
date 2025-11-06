/**
 * Theme-aware style hooks and utilities
 * Provides dynamic styles that adapt to the current theme
 */

import { useTheme } from '../contexts/ThemeContext';

/**
 * Hook to get theme-aware inline styles
 * These styles adapt to the current theme automatically
 */
export const useThemeStyles = () => {
  const { theme, isCustomTheme } = useTheme();
  
  // Check if it's the warm earth theme
  const isWarmEarthTheme = theme === 'custom-warm-earth';

  // Determine gradient based on theme
  let gradientStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  let buttonShadow = 'rgba(102, 126, 234, 0.4)';
  
  if (isWarmEarthTheme) {
    gradientStyle = 'linear-gradient(135deg, #b08968 0%, #7f5539 100%)';
    buttonShadow = 'rgba(176, 137, 104, 0.4)';
  }

  return {
    // Gradient text style (works with all themes)
    gradientText: {
      background: `var(--primary-color, ${gradientStyle})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },

    // Primary button with gradient (for custom themes)
    primaryButton: (isCustomTheme || isWarmEarthTheme) ? {
      background: gradientStyle,
      border: 'none',
      boxShadow: `0 4px 12px ${buttonShadow}`,
    } : {},

    // Link color (adapts to theme)
    primaryLink: {
      color: isWarmEarthTheme ? '#b08968' : 'var(--primary-color, #667eea)',
    },
  };
};

/**
 * Utility function to merge styles
 */
export const mergeStyles = (...styles) => {
  return Object.assign({}, ...styles);
};
