# Design System - Color Palette & Tokens

## Color Palette

### Primary Colors
```css
--app-primary: #4f46e5         /* Indigo 600 */
--app-primary-dark: #4338ca    /* Indigo 700 */
--app-secondary: #8b5cf6       /* Purple 500 */
```

### Gradient Colors
```css
/* Primary Gradient */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Background Gradient */
linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)

/* Auth Button Gradient */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Error Gradient */
linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)

/* Hover Gradient */
linear-gradient(135deg, #667eea15 0%, #764ba215 100%)
```

### Neutral Colors
```css
--gray-50: #f8fafc
--gray-100: #f1f5f9
--gray-200: #e2e8f0
--gray-300: #cbd5e1
--gray-400: #94a3b8
--gray-500: #64748b
--gray-600: #475569
--gray-700: #334155
--gray-800: #1e293b
--gray-900: #0f172a
```

### Status Colors
```css
--success: #10b981   /* Green 500 */
--warning: #f59e0b   /* Amber 500 */
--error: #dc2626     /* Red 600 */
--info: #3b82f6      /* Blue 500 */
```

## Typography Scale

### Font Families
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
--text-4xl: 2.25rem    /* 36px */
```

### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

## Spacing Scale
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
```

## Shadow Scale
```css
/* Elevation Levels */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

/* Component Specific */
--app-card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--app-card-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--button-shadow: 0 4px 12px rgba(102, 126, 234, 0.4)
--button-shadow-hover: 0 8px 20px rgba(102, 126, 234, 0.5)
```

## Border Radius
```css
--radius-sm: 0.375rem   /* 6px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.75rem    /* 12px */
--radius-xl: 1rem       /* 16px */
--radius-2xl: 1.25rem   /* 20px */
--radius-full: 50%      /* Circle */

/* Component Specific */
--card-radius: 20px
--button-radius: 12px
--input-radius: 12px
--dropdown-radius: 12px
```

## Transitions
```css
/* Duration */
--transition-fast: 0.15s
--transition-base: 0.2s
--transition-slow: 0.3s

/* Easing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-default: ease

/* Common Transitions */
transition: all 0.3s ease
transition: transform 0.3s ease
transition: color 0.2s ease
transition: background 0.3s ease
```

## Component Tokens

### Buttons
```css
/* Primary Button */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
padding: 0.875rem 1.5rem
border-radius: 12px
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4)

/* Button Hover */
transform: translateY(-2px)
box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5)

/* Disabled Button */
background: #d1d5db
cursor: not-allowed
```

### Cards
```css
background: white
padding: 2rem
border-radius: 20px
box-shadow: var(--app-card-shadow-lg)
border: 1px solid rgba(0, 0, 0, 0.05)
```

### Header
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
padding: 1rem 2rem
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
backdrop-filter: blur(10px)
```

### Inputs
```css
padding: 0.625rem 1rem
border: 2px solid #e5e7eb
border-radius: 12px
transition: border-color 0.2s ease

/* Focus State */
border-color: #667eea
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
```

### Links
```css
color: #667eea
text-decoration: none
font-weight: 600
transition: color 0.2s ease

/* Hover */
color: #764ba2
text-decoration: underline
```

## Icon Sizes
```css
--icon-xs: 0.75rem    /* 12px */
--icon-sm: 1rem       /* 16px */
--icon-md: 1.25rem    /* 20px */
--icon-lg: 1.5rem     /* 24px */
--icon-xl: 2rem       /* 32px */
--icon-2xl: 3rem      /* 48px */
--icon-3xl: 4rem      /* 64px */
--icon-4xl: 5rem      /* 80px */
```

## Breakpoints
```css
/* Mobile First Approach */
--screen-sm: 640px    /* Small devices */
--screen-md: 768px    /* Tablets */
--screen-lg: 1024px   /* Laptops */
--screen-xl: 1280px   /* Desktops */
--screen-2xl: 1536px  /* Large screens */

/* Usage */
@media (max-width: 768px) {
  /* Mobile styles */
}
```

## Z-Index Scale
```css
--z-dropdown: 1000
--z-sticky: 1000
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

## Animation Keyframes

### Dropdown Slide
```css
@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Spinner
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Error Shake
```css
@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

## Usage Examples

### Creating a Card
```jsx
<Card className="shadow-6 border-round-xl p-4">
  <h2 className="text-2xl font-bold mb-3">Title</h2>
  <p className="text-600">Content</p>
</Card>
```

### Creating a Button
```jsx
<Button 
  label="Click Me"
  icon="pi pi-check"
  className="w-full p-button-lg"
  style={{ 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  }}
/>
```

### Using PrimeFlex Utilities
```jsx
<div className="flex justify-content-center align-items-center gap-3 p-4">
  <i className="pi pi-check text-green-500"></i>
  <span className="text-600">Success message</span>
</div>
```

---

**Note**: This design system is built on top of PrimeReact's default theme and can be further customized using PrimeReact's theme designer tool.
