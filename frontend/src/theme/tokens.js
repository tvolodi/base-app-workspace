/**
 * Design Tokens - Base Application Theme
 * Central source of truth for all design values
 */

export const tokens = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      main: '#667eea',
      dark: '#4338ca',
    },

    // Secondary Colors
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      main: '#764ba2',
      dark: '#5b21b6',
    },

    // Accent Colors
    accent: {
      blue: '#3b82f6',
      indigo: '#6366f1',
      purple: '#8b5cf6',
      pink: '#ec4899',
      cyan: '#06b6d4',
      teal: '#14b8a6',
    },

    // Status Colors
    status: {
      success: '#10b981',
      successLight: '#d1fae5',
      successDark: '#065f46',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      warningDark: '#92400e',
      error: '#dc2626',
      errorLight: '#fee2e2',
      errorDark: '#991b1b',
      info: '#3b82f6',
      infoLight: '#dbeafe',
      infoDark: '#1e40af',
    },

    // Neutral Colors (Gray Scale)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      white: '#ffffff',
      black: '#000000',
    },

    // Semantic Colors
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
      disabled: '#d1d5db',
    },

    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      inverse: '#1f2937',
      disabled: '#e5e7eb',
      gradient: {
        start: '#f8fafc',
        end: '#e0e7ff',
      },
    },

    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
    },
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primarySubtle: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
    primaryHover: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
    error: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    success: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    warning: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    info: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    textGradient: 'linear-gradient(to right, #ffffff, #e0e7ff)',
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      mono: "'Monaco', 'Courier New', monospace",
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
    circle: '50%',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    
    // Component specific shadows
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cardLg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    button: '0 4px 12px rgba(102, 126, 234, 0.4)',
    buttonHover: '0 8px 20px rgba(102, 126, 234, 0.5)',
    error: '0 4px 12px rgba(220, 38, 38, 0.15)',
  },

  // Transitions
  transitions: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      medium: '300ms',
      slow: '500ms',
    },

    timing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    property: {
      all: 'all',
      colors: 'color, background-color, border-color',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
    },
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1000,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component Specific Tokens
  components: {
    button: {
      padding: {
        sm: '0.5rem 1rem',
        base: '0.625rem 1.25rem',
        lg: '0.875rem 1.5rem',
        xl: '1rem 2rem',
      },
      borderRadius: '12px',
    },

    card: {
      padding: '2rem',
      paddingSm: '1.5rem',
      borderRadius: '20px',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    },

    input: {
      padding: '0.625rem 1rem',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      focusBorder: '2px solid #667eea',
    },

    header: {
      height: 'auto',
      padding: '1rem 2rem',
      paddingSm: '1rem',
    },

    avatar: {
      size: {
        xs: '24px',
        sm: '32px',
        base: '40px',
        lg: '48px',
        xl: '64px',
        '2xl': '80px',
      },
    },

    icon: {
      size: {
        xs: '12px',
        sm: '16px',
        base: '20px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
      },
    },
  },
};

export default tokens;
