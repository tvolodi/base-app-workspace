/**
 * Theme Configuration and Utilities
 * Main theme export with helper functions
 */

import tokens from './tokens';
import primeReactTheme from './primeReactTheme';

// Helper function to get color by path
export const getColor = (path) => {
  const keys = path.split('.');
  let value = tokens.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return null;
  }
  
  return value;
};

// Helper function to get spacing
export const getSpacing = (size) => {
  return tokens.spacing[size] || size;
};

// Helper function to create custom shadows
export const createShadow = (color, opacity = 0.4, size = 'md') => {
  const baseSize = size === 'sm' ? '4px 8px' : size === 'lg' ? '8px 20px' : '4px 12px';
  return `0 ${baseSize} rgba(${color}, ${opacity})`;
};

// Helper function to apply theme to component style
export const applyComponentTheme = (componentName) => {
  return primeReactTheme[componentName] || {};
};

// Utility to generate gradient background
export const gradient = (type = 'primary') => {
  return tokens.gradients[type] || tokens.gradients.primary;
};

// Utility to generate transition
export const transition = (properties = 'all', duration = 'medium', timing = 'ease') => {
  const durationValue = tokens.transitions.duration[duration] || duration;
  const timingValue = tokens.transitions.timing[timing] || timing;
  return `${properties} ${durationValue} ${timingValue}`;
};

// Utility to generate box shadow
export const shadow = (level = 'md') => {
  return tokens.shadows[level] || tokens.shadows.md;
};

// Utility to generate border radius
export const radius = (size = 'md') => {
  return tokens.borderRadius[size] || tokens.borderRadius.md;
};

// Utility to generate responsive styles
export const responsive = (styles) => {
  return {
    mobile: styles.mobile || {},
    tablet: styles.tablet || {},
    desktop: styles.desktop || {},
  };
};

// Style generator for buttons
export const buttonStyle = (variant = 'primary', size = 'base') => {
  const variantStyles = primeReactTheme.button.variants[variant] || primeReactTheme.button.variants.primary;
  const padding = tokens.components.button.padding[size] || tokens.components.button.padding.base;
  
  return {
    ...variantStyles,
    padding,
    borderRadius: tokens.components.button.borderRadius,
    fontWeight: tokens.typography.fontWeight.semibold,
    transition: transition('all', 'medium', 'ease'),
  };
};

// Style generator for cards
export const cardStyle = (elevated = false) => {
  return {
    background: tokens.colors.background.primary,
    borderRadius: tokens.components.card.borderRadius,
    boxShadow: elevated ? tokens.shadows.cardLg : tokens.shadows.card,
    border: tokens.components.card.border,
    padding: tokens.components.card.padding,
  };
};

// Style generator for inputs
export const inputStyle = (hasError = false) => {
  return {
    padding: tokens.components.input.padding,
    borderRadius: tokens.components.input.borderRadius,
    border: hasError ? `2px solid ${tokens.colors.status.error}` : tokens.components.input.border,
    fontSize: tokens.typography.fontSize.base,
    transition: transition('border-color', 'base', 'ease'),
  };
};

// Theme presets for common UI patterns
export const themePresets = {
  // Form container
  formContainer: {
    background: tokens.colors.background.primary,
    padding: tokens.spacing[10],
    borderRadius: tokens.borderRadius['2xl'],
    boxShadow: tokens.shadows.cardLg,
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Section container
  sectionContainer: {
    background: tokens.colors.background.primary,
    padding: tokens.spacing[8],
    borderRadius: tokens.borderRadius.xl,
    boxShadow: tokens.shadows.card,
    marginBottom: tokens.spacing[6],
  },

  // Hero section
  heroSection: {
    textAlign: 'center',
    padding: `${tokens.spacing[16]} ${tokens.spacing[8]}`,
    background: tokens.gradients.background,
  },

  // Gradient text
  gradientText: {
    background: tokens.gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: tokens.typography.fontWeight.bold,
  },

  // Elevated card
  elevatedCard: {
    ...cardStyle(true),
    transition: transition('all', 'medium', 'ease'),
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadows['2xl'],
    },
  },

  // Icon badge
  iconBadge: (size = 'lg') => ({
    width: tokens.components.icon.size[size],
    height: tokens.components.icon.size[size],
    background: tokens.gradients.primary,
    borderRadius: tokens.borderRadius.circle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colors.neutral.white,
  }),

  // Status badge
  statusBadge: (status = 'success') => ({
    background: tokens.colors.status[status],
    color: tokens.colors.neutral.white,
    padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
  }),
};

// Export everything
export {
  tokens,
  primeReactTheme,
};

export default {
  tokens,
  primeReactTheme,
  getColor,
  getSpacing,
  createShadow,
  applyComponentTheme,
  gradient,
  transition,
  shadow,
  radius,
  responsive,
  buttonStyle,
  cardStyle,
  inputStyle,
  themePresets,
};
