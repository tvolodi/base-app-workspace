# Theme Integration Guide

## Overview

The application now features a comprehensive theme system that integrates our custom purple gradient design with PrimeReact's built-in themes. Users can switch between multiple themes from the Profile page, and the selected theme is applied globally across the entire application.

## Features

✅ **Custom Purple Gradient Theme** - Our signature theme with purple gradient design tokens  
✅ **22+ PrimeReact Themes** - Access to all standard PrimeReact themes  
✅ **Global Theme Application** - Theme applies to all components instantly  
✅ **Persistent Selection** - Theme choice is saved in localStorage  
✅ **Theme Indicator** - Visual feedback when switching themes  
✅ **Grouped Selection** - Themes organized by category (Custom, Light, Dark, etc.)  
✅ **Searchable Dropdown** - Filter themes by name  
✅ **Responsive Design** - Works perfectly on all screen sizes  

## Architecture

### Core Components

1. **ThemeContext** (`src/contexts/ThemeContext.js`)
   - Manages theme state
   - Handles theme loading and switching
   - Provides `useTheme()` hook
   - Saves theme preference to localStorage

2. **ThemeSelector** (`src/components/ThemeSelector.js`)
   - UI component for theme selection
   - Grouped dropdown with categories
   - Search functionality
   - Loading states

3. **Custom Theme** (`public/themes/custom-purple-gradient/theme.css`)
   - Custom CSS overrides for PrimeReact components
   - Integrates design tokens from `src/theme/tokens.js`
   - Enhanced gradients, shadows, and animations

4. **Theme Constants** (`src/constants/themes.js`)
   - List of available themes
   - Theme validation
   - Default theme configuration

### File Structure

```
frontend/
├── src/
│   ├── contexts/
│   │   └── ThemeContext.js          # Theme state management
│   ├── components/
│   │   ├── ThemeSelector.js         # Theme selection UI
│   │   └── Profile.js               # Includes ThemeSelector
│   ├── constants/
│   │   └── themes.js                # Theme definitions
│   ├── theme/
│   │   ├── tokens.js                # Design tokens
│   │   ├── index.js                 # Theme utilities
│   │   └── primeReactOverrides.css  # Additional overrides
│   └── App.css                      # Theme-specific styles
└── public/
    └── themes/
        ├── custom-purple-gradient/  # Custom theme
        │   └── theme.css
        ├── lara-light-indigo/       # PrimeReact themes
        ├── lara-dark-indigo/
        └── ... (20+ more themes)
```

## Available Themes

### Custom Themes
- **🎨 Custom Purple Gradient** (Recommended) - Our signature design

### Light Themes
- Light Indigo
- Light Blue
- Light Purple
- Light Teal

### Dark Themes
- Dark Indigo
- Dark Blue
- Dark Purple
- Dark Teal
- Arya Blue
- Arya Purple

### Material Design
- Material Design Light
- Material Design Dark

### Modern Themes
- Viva Light
- Viva Dark
- Mira
- Nano
- Fluent Light

### Classic Themes
- Saga Blue
- Saga Purple

### Bootstrap Themes
- Bootstrap Light Blue
- Bootstrap Dark Blue

## Usage

### For End Users

1. **Access Theme Selector**
   - Navigate to Profile page
   - Scroll to "Appearance Settings" section
   - Open the theme dropdown

2. **Select a Theme**
   - Browse themes by category
   - Use search to filter themes
   - Click on desired theme
   - Theme applies instantly

3. **Features**
   - Selected theme is saved automatically
   - Theme persists across sessions
   - Visual indicator shows active theme
   - Loading spinner during theme change

### For Developers

#### Using the Theme Hook

```javascript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, changeTheme, isLoading, getThemeInfo, isCustomTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => changeTheme('custom-purple-gradient')}>
        Use Custom Theme
      </button>
      {isCustomTheme && <p>Custom theme is active! 🎨</p>}
    </div>
  );
}
```

#### Theme Context API

```javascript
const {
  theme,           // Current theme name (string)
  changeTheme,     // Function to change theme (themeName) => void
  isLoading,       // Boolean indicating if theme is loading
  getThemeInfo,    // Function to get current theme info
  isCustomTheme    // Boolean - true if custom-purple-gradient is active
} = useTheme();
```

#### Adding New Themes

1. **Add theme to constants:**

```javascript
// src/constants/themes.js
export const AVAILABLE_THEMES = [
  // ... existing themes
  { 
    value: 'my-new-theme', 
    label: 'My New Theme', 
    category: 'Custom' 
  },
];
```

2. **Create theme CSS file:**

```
public/themes/my-new-theme/theme.css
```

3. **Theme CSS structure:**

```css
/* Import base theme (optional) */
@import url('../../node_modules/primereact/resources/themes/lara-light-blue/theme.css');

/* Override CSS variables */
:root {
  --primary-color: #yourcolor;
  /* ... more variables */
}

/* Override component styles */
.p-button {
  /* Custom button styles */
}
```

## Custom Purple Gradient Theme

Our custom theme includes:

### Design Tokens Integration
- Primary colors: `#667eea` to `#764ba2` gradient
- Status colors: success, warning, error, info
- Neutral colors: Gray scale
- Semantic colors: text, background

### Enhanced Components
- **Buttons** - Gradient backgrounds, hover effects, shadows
- **Cards** - Rounded corners, elevation, hover transforms
- **Inputs** - Focus states, border animations
- **Dropdowns** - Smooth transitions, gradient highlights
- **Dialogs** - Gradient headers, modern styling
- **Messages** - Status-based gradients
- **DataTables** - Gradient headers, hover effects
- **Navigation** - Accordion, tabs, menus with gradients

### Special Features
- Custom scrollbar styling
- Gradient text utility class
- Elevated card animations
- Focus-visible accessibility
- Responsive adjustments

## Theme-Specific Styling

The application automatically applies theme-specific classes to the body:

```css
/* General theme class */
body.theme-{theme-name} { }

/* Custom theme specific */
body.custom-theme-active { }

/* Dark theme specific */
body.theme-lara-dark-indigo { }
```

You can use these classes to add custom styling:

```css
/* Apply only when custom theme is active */
body.custom-theme-active .my-component {
  background: var(--gradient-primary);
}

/* Apply to all dark themes */
body[class*="dark"] .my-component {
  background: #1e293b;
}
```

## CSS Variables

The custom theme exposes these CSS variables:

```css
:root {
  /* Colors */
  --primary-main: #667eea;
  --secondary-main: #764ba2;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  
  /* Shadows */
  --shadow-card: 0 4px 20px rgba(102, 126, 234, 0.15);
  --shadow-button: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
  
  /* Border Radius */
  --border-radius-lg: 1rem;
  --border-radius-xl: 1.25rem;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 300ms;
}
```

## Performance

- **Lazy Loading** - Theme CSS loaded only when selected
- **Caching** - Browser caches theme files
- **Smooth Transitions** - 300ms fade between themes
- **No Flash** - Initial theme loaded before render

## Accessibility

- **ARIA Labels** - All theme controls properly labeled
- **Keyboard Navigation** - Full keyboard support in dropdown
- **Focus Indicators** - Clear focus states
- **Screen Reader Support** - Descriptive announcements
- **Loading States** - Announced to assistive technologies

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Theme not loading
- Check browser console for errors
- Verify theme file exists in `public/themes/{theme-name}/theme.css`
- Clear browser cache
- Check localStorage: `localStorage.getItem('primeReactTheme')`

### Theme not persisting
- Check localStorage permissions
- Verify localStorage quota not exceeded
- Check for conflicting theme management code

### Custom theme not applying
- Verify `custom-purple-gradient` folder exists
- Check that theme.css file is valid
- Ensure no CSS syntax errors
- Check browser DevTools for 404 errors

### Theme switching is slow
- Check network tab for file sizes
- Verify CDN/cache configuration
- Consider preloading frequently used themes

## Best Practices

1. **Use Theme Hook** - Always use `useTheme()` instead of localStorage directly
2. **Theme-Agnostic Components** - Design components that work with all themes
3. **Test Multiple Themes** - Test your features with different themes
4. **Respect User Choice** - Don't force theme changes without user consent
5. **Graceful Fallbacks** - Handle theme loading failures gracefully

## Future Enhancements

Potential improvements:

- [ ] Theme preview before applying
- [ ] Custom theme builder UI
- [ ] Theme import/export functionality
- [ ] System theme detection (dark mode)
- [ ] Scheduled theme switching (day/night)
- [ ] Per-page theme overrides
- [ ] Theme animation presets
- [ ] A11y theme variants (high contrast)

## Related Documentation

- [THEME_GUIDE.md](./THEME_GUIDE.md) - Complete theme system guide
- [THEME_QUICK_REFERENCE.md](./THEME_QUICK_REFERENCE.md) - Quick reference card
- [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md) - UI enhancement documentation
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system overview

## Support

For issues or questions about themes:
1. Check this documentation
2. Review PrimeReact theme documentation
3. Check browser console for errors
4. Test with default theme first

---

**Last Updated:** November 6, 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team
