/**
 * PrimeReact Theme Override
 * Custom theme configuration for PrimeReact components
 * Based on the developed design system
 */

import { tokens } from './tokens';

export const primeReactTheme = {
  // Button component styles
  button: {
    root: {
      background: tokens.gradients.primary,
      border: 'none',
      borderRadius: tokens.borderRadius.md,
      padding: tokens.components.button.padding.base,
      fontWeight: tokens.typography.fontWeight.semibold,
      transition: `all ${tokens.transitions.duration.medium} ${tokens.transitions.timing.ease}`,
      boxShadow: tokens.shadows.button,
    },
    rootHover: {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadows.buttonHover,
    },
    rootDisabled: {
      background: tokens.colors.neutral[300],
      cursor: 'not-allowed',
      boxShadow: 'none',
      transform: 'none',
    },
    // Button variants
    variants: {
      primary: {
        background: tokens.gradients.primary,
        color: tokens.colors.neutral.white,
      },
      secondary: {
        background: tokens.colors.neutral[200],
        color: tokens.colors.text.primary,
      },
      success: {
        background: tokens.colors.status.success,
        color: tokens.colors.neutral.white,
      },
      danger: {
        background: tokens.colors.status.error,
        color: tokens.colors.neutral.white,
      },
      warning: {
        background: tokens.colors.status.warning,
        color: tokens.colors.neutral.white,
      },
      info: {
        background: tokens.colors.status.info,
        color: tokens.colors.neutral.white,
      },
    },
  },

  // Card component styles
  card: {
    root: {
      background: tokens.colors.background.primary,
      borderRadius: tokens.components.card.borderRadius,
      boxShadow: tokens.shadows.cardLg,
      border: tokens.components.card.border,
      padding: tokens.components.card.padding,
    },
    header: {
      padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
      background: tokens.gradients.primary,
      color: tokens.colors.neutral.white,
      borderRadius: `${tokens.components.card.borderRadius} ${tokens.components.card.borderRadius} 0 0`,
    },
    body: {
      padding: tokens.components.card.padding,
    },
    footer: {
      padding: tokens.spacing[4],
      borderTop: `1px solid ${tokens.colors.border.light}`,
    },
  },

  // Input field styles
  input: {
    root: {
      padding: tokens.components.input.padding,
      borderRadius: tokens.components.input.borderRadius,
      border: tokens.components.input.border,
      fontSize: tokens.typography.fontSize.base,
      transition: `border-color ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
    },
    rootFocus: {
      borderColor: tokens.colors.primary.main,
      boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.1)`,
      outline: 'none',
    },
    rootError: {
      borderColor: tokens.colors.status.error,
    },
  },

  // Dropdown/Select styles
  dropdown: {
    root: {
      borderRadius: tokens.borderRadius.md,
      border: tokens.components.input.border,
      background: tokens.colors.background.primary,
    },
    panel: {
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.lg,
      border: 'none',
    },
    item: {
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
    },
    itemHover: {
      background: tokens.gradients.primaryHover,
      color: tokens.colors.primary.main,
    },
  },

  // Dialog/Modal styles
  dialog: {
    root: {
      borderRadius: tokens.borderRadius.xl,
      boxShadow: tokens.shadows['2xl'],
      border: 'none',
    },
    header: {
      padding: tokens.spacing[6],
      background: tokens.colors.background.primary,
      borderBottom: `1px solid ${tokens.colors.border.light}`,
      borderRadius: `${tokens.borderRadius.xl} ${tokens.borderRadius.xl} 0 0`,
    },
    content: {
      padding: tokens.spacing[6],
    },
    footer: {
      padding: tokens.spacing[6],
      borderTop: `1px solid ${tokens.colors.border.light}`,
      background: tokens.colors.background.secondary,
    },
  },

  // Message/Toast styles
  message: {
    root: {
      borderRadius: tokens.borderRadius.md,
      padding: tokens.spacing[4],
      boxShadow: tokens.shadows.md,
    },
    variants: {
      success: {
        background: tokens.gradients.success,
        borderLeft: `4px solid ${tokens.colors.status.success}`,
        color: tokens.colors.status.successDark,
      },
      info: {
        background: tokens.gradients.info,
        borderLeft: `4px solid ${tokens.colors.status.info}`,
        color: tokens.colors.status.infoDark,
      },
      warn: {
        background: tokens.gradients.warning,
        borderLeft: `4px solid ${tokens.colors.status.warning}`,
        color: tokens.colors.status.warningDark,
      },
      error: {
        background: tokens.gradients.error,
        borderLeft: `4px solid ${tokens.colors.status.error}`,
        color: tokens.colors.status.errorDark,
      },
    },
  },

  // Avatar styles
  avatar: {
    root: {
      borderRadius: tokens.borderRadius.circle,
      background: tokens.gradients.primary,
      color: tokens.colors.neutral.white,
      fontWeight: tokens.typography.fontWeight.bold,
    },
    sizes: tokens.components.avatar.size,
  },

  // Badge styles
  badge: {
    root: {
      borderRadius: tokens.borderRadius.full,
      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
    },
    variants: {
      success: {
        background: tokens.colors.status.success,
        color: tokens.colors.neutral.white,
      },
      danger: {
        background: tokens.colors.status.error,
        color: tokens.colors.neutral.white,
      },
      warning: {
        background: tokens.colors.status.warning,
        color: tokens.colors.neutral.white,
      },
      info: {
        background: tokens.colors.status.info,
        color: tokens.colors.neutral.white,
      },
    },
  },

  // Progress Spinner styles
  progressSpinner: {
    circle: {
      stroke: tokens.colors.primary.main,
      strokeWidth: '4',
    },
  },

  // Divider styles
  divider: {
    root: {
      borderColor: tokens.colors.border.light,
    },
  },

  // DataTable styles
  dataTable: {
    root: {
      borderRadius: tokens.borderRadius.xl,
      overflow: 'hidden',
      boxShadow: tokens.shadows.cardLg,
    },
    header: {
      background: tokens.colors.background.secondary,
      padding: tokens.spacing[4],
      borderBottom: `2px solid ${tokens.colors.border.light}`,
    },
    thead: {
      background: tokens.gradients.primarySubtle,
      color: tokens.colors.text.primary,
      fontWeight: tokens.typography.fontWeight.semibold,
    },
    tbody: {
      tr: {
        transition: `background ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
      },
      trHover: {
        background: tokens.colors.background.secondary,
      },
    },
    footer: {
      background: tokens.colors.background.secondary,
      padding: tokens.spacing[4],
      borderTop: `1px solid ${tokens.colors.border.light}`,
    },
  },

  // Panel styles
  panel: {
    root: {
      borderRadius: tokens.borderRadius.xl,
      boxShadow: tokens.shadows.card,
      border: tokens.components.card.border,
    },
    header: {
      background: tokens.gradients.primarySubtle,
      padding: tokens.spacing[4],
      borderRadius: `${tokens.borderRadius.xl} ${tokens.borderRadius.xl} 0 0`,
      fontWeight: tokens.typography.fontWeight.semibold,
    },
    content: {
      padding: tokens.spacing[4],
    },
  },

  // Accordion styles
  accordion: {
    tab: {
      borderRadius: tokens.borderRadius.md,
      marginBottom: tokens.spacing[2],
      boxShadow: tokens.shadows.sm,
    },
    header: {
      padding: tokens.spacing[4],
      background: tokens.colors.background.primary,
      transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
    },
    headerActive: {
      background: tokens.gradients.primarySubtle,
      color: tokens.colors.primary.main,
    },
    content: {
      padding: tokens.spacing[4],
      background: tokens.colors.background.primary,
    },
  },

  // TabView styles
  tabView: {
    nav: {
      background: tokens.colors.background.secondary,
      borderBottom: `2px solid ${tokens.colors.border.light}`,
    },
    tab: {
      padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
      transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
      fontWeight: tokens.typography.fontWeight.medium,
    },
    tabActive: {
      background: tokens.gradients.primary,
      color: tokens.colors.neutral.white,
      borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
    },
    panels: {
      padding: tokens.spacing[6],
    },
  },

  // Menu styles
  menu: {
    root: {
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.xl,
      border: 'none',
      padding: tokens.spacing[2],
    },
    item: {
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      borderRadius: tokens.borderRadius.base,
      transition: `all ${tokens.transitions.duration.base} ${tokens.transitions.timing.ease}`,
      fontWeight: tokens.typography.fontWeight.medium,
    },
    itemHover: {
      background: tokens.gradients.primaryHover,
      color: tokens.colors.primary.main,
      transform: 'translateX(4px)',
    },
    separator: {
      borderTop: `1px solid ${tokens.colors.border.light}`,
      margin: `${tokens.spacing[2]} 0`,
    },
  },

  // Tooltip styles
  tooltip: {
    root: {
      background: tokens.colors.neutral[800],
      color: tokens.colors.neutral.white,
      borderRadius: tokens.borderRadius.base,
      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
      fontSize: tokens.typography.fontSize.sm,
      boxShadow: tokens.shadows.lg,
    },
  },
};

export default primeReactTheme;
