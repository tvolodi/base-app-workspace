# Theme System Documentation

## Overview

This comprehensive theme system provides a consistent design language for the entire application. It's built on top of PrimeReact and includes custom tokens, component styles, and utility functions.

## 📁 File Structure

```
src/theme/
├── index.js                 # Main theme export with utilities
├── tokens.js                # Design tokens (colors, typography, spacing, etc.)
├── primeReactTheme.js       # PrimeReact component theme configuration
├── primeReactOverrides.css  # CSS overrides for PrimeReact components
└── examples.js              # Usage examples and patterns
```

## 🎨 Design Tokens

### Accessing Tokens

```javascript
import { tokens } from './theme';

// Use tokens directly
const primaryColor = tokens.colors.primary.main; // #667eea
const spacing = tokens.spacing[4]; // 1rem
const borderRadius = tokens.borderRadius.md; // 0.75rem
```

### Color Palette

```javascript
// Primary Colors
tokens.colors.primary.main     // #667eea
tokens.colors.primary.dark     // #4338ca
tokens.colors.secondary.main   // #764ba2

// Status Colors
tokens.colors.status.success   // #10b981
tokens.colors.status.error     // #dc2626
tokens.colors.status.warning   // #f59e0b
tokens.colors.status.info      // #3b82f6

// Neutral Colors
tokens.colors.neutral[50]      // #f8fafc (lightest)
tokens.colors.neutral[900]     // #0f172a (darkest)

// Text Colors
tokens.colors.text.primary     // #1f2937
tokens.colors.text.secondary   // #6b7280
```

### Gradients

```javascript
tokens.gradients.primary           // Main gradient
tokens.gradients.primarySubtle     // Light background gradient
tokens.gradients.background        // Page background gradient
tokens.gradients.error             // Error message gradient
```

### Typography

```javascript
// Font Sizes
tokens.typography.fontSize.xs      // 0.75rem (12px)
tokens.typography.fontSize.base    // 1rem (16px)
tokens.typography.fontSize['3xl']  // 1.875rem (30px)

// Font Weights
tokens.typography.fontWeight.normal    // 400
tokens.typography.fontWeight.semibold  // 600
tokens.typography.fontWeight.bold      // 700
```

### Spacing

```javascript
tokens.spacing[0]   // 0
tokens.spacing[1]   // 0.25rem (4px)
tokens.spacing[4]   // 1rem (16px)
tokens.spacing[8]   // 2rem (32px)
tokens.spacing[16]  // 4rem (64px)
```

### Shadows

```javascript
tokens.shadows.sm          // Small shadow
tokens.shadows.md          // Medium shadow
tokens.shadows.lg          // Large shadow
tokens.shadows.xl          // Extra large shadow
tokens.shadows.card        // Card shadow
tokens.shadows.cardLg      // Elevated card shadow
tokens.shadows.button      // Button shadow
tokens.shadows.buttonHover // Button hover shadow
```

### Border Radius

```javascript
tokens.borderRadius.sm      // 0.375rem (6px)
tokens.borderRadius.md      // 0.75rem (12px)
tokens.borderRadius.xl      // 1.25rem (20px)
tokens.borderRadius.full    // 9999px
tokens.borderRadius.circle  // 50%
```

## 🛠️ Theme Utilities

### Import Utilities

```javascript
import theme, { 
  gradient, 
  shadow, 
  radius, 
  transition,
  themePresets,
  buttonStyle,
  cardStyle,
  inputStyle
} from './theme';
```

### Gradient Utility

```javascript
// Use in inline styles
<div style={{ background: gradient('primary') }}>
  Gradient Background
</div>

// Available gradients
gradient('primary')
gradient('primarySubtle')
gradient('background')
gradient('error')
gradient('success')
```

### Shadow Utility

```javascript
// Use in inline styles
<Card style={{ boxShadow: shadow('cardLg') }}>
  Content
</Card>

// Available shadows
shadow('sm')
shadow('md')
shadow('lg')
shadow('xl')
shadow('card')
shadow('button')
```

### Border Radius Utility

```javascript
<div style={{ borderRadius: radius('xl') }}>
  Rounded corners
</div>
```

### Transition Utility

```javascript
// transition(properties, duration, timing)
const style = {
  transition: transition('all', 'medium', 'ease')
};

// Available durations: 'fast', 'base', 'medium', 'slow'
// Available timings: 'linear', 'ease', 'easeIn', 'easeOut', 'easeInOut'
```

## 🎭 Theme Presets

Pre-configured style objects for common UI patterns:

### Form Container

```javascript
import { themePresets } from './theme';

<div style={themePresets.formContainer}>
  <h2 style={themePresets.gradientText}>My Form</h2>
  {/* Form fields */}
</div>
```

### Section Container

```javascript
<div style={themePresets.sectionContainer}>
  <h3>Section Title</h3>
  <p>Section content...</p>
</div>
```

### Hero Section

```javascript
<div style={themePresets.heroSection}>
  <h1 style={themePresets.gradientText}>Hero Title</h1>
  <p>Hero description...</p>
</div>
```

### Gradient Text

```javascript
<h1 style={themePresets.gradientText}>
  Beautiful Gradient Text
</h1>
```

### Icon Badge

```javascript
const badge = themePresets.iconBadge('lg');

<div style={badge}>
  <i className="pi pi-check"></i>
</div>
```

### Status Badge

```javascript
const successBadge = themePresets.statusBadge('success');

<span style={successBadge}>Active</span>
```

## 🔧 Component Style Generators

### Button Styles

```javascript
import { buttonStyle } from './theme';

// Generate button styles
const primaryBtn = buttonStyle('primary', 'lg');
const dangerBtn = buttonStyle('danger', 'base');

<button style={primaryBtn}>Primary Button</button>
```

Variants: `'primary'`, `'secondary'`, `'success'`, `'danger'`, `'warning'`, `'info'`  
Sizes: `'sm'`, `'base'`, `'lg'`, `'xl'`

### Card Styles

```javascript
import { cardStyle } from './theme';

// Basic card
<div style={cardStyle(false)}>Content</div>

// Elevated card
<div style={cardStyle(true)}>Content with elevation</div>
```

### Input Styles

```javascript
import { inputStyle } from './theme';

// Normal input
<input style={inputStyle(false)} />

// Error state
<input style={inputStyle(true)} />
```

## 📦 Using with PrimeReact Components

### Basic Usage

The theme is automatically applied to all PrimeReact components via CSS overrides. Simply use components normally:

```javascript
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

<Card>
  <Button label="Themed Button" icon="pi pi-check" />
</Card>
```

### Custom Styling

You can still apply custom styles while maintaining theme consistency:

```javascript
<Button 
  label="Custom Button"
  style={{
    background: gradient('primary'),
    borderRadius: radius('md'),
    boxShadow: shadow('button')
  }}
/>
```

### Using PrimeFlex Utilities

Combine with PrimeFlex utility classes:

```javascript
<div className="flex justify-content-center align-items-center gap-3 p-4">
  <Button label="Button 1" />
  <Button label="Button 2" className="p-button-outlined" />
</div>
```

## 🎯 Common Patterns

### Styled Form

```javascript
import { themePresets, gradient, shadow } from './theme';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const MyForm = () => (
  <div style={themePresets.formContainer}>
    <h2 style={themePresets.gradientText}>Login</h2>
    
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Email</label>
      <InputText className="w-full" placeholder="Enter email" />
    </div>

    <Button 
      label="Submit"
      className="w-full"
      style={{
        background: gradient('primary'),
        border: 'none',
        boxShadow: shadow('button')
      }}
    />
  </div>
);
```

### Dashboard Card

```javascript
import { Card } from 'primereact/card';
import { themePresets } from './theme';

const StatCard = ({ icon, label, value, color }) => (
  <Card style={themePresets.elevatedCard}>
    <div className="flex align-items-center justify-content-between">
      <div>
        <p className="text-600 m-0 mb-2">{label}</p>
        <h3 className="text-3xl font-bold m-0" style={{ color }}>
          {value}
        </h3>
      </div>
      <div style={{
        ...themePresets.iconBadge('2xl'),
        background: `${color}20`
      }}>
        <i className={`pi ${icon} text-3xl`} style={{ color }}></i>
      </div>
    </div>
  </Card>
);
```

### Profile Header

```javascript
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { gradient, radius } from './theme';

const ProfileHeader = ({ user }) => {
  const header = (
    <div style={{
      background: gradient('primary'),
      padding: '2rem',
      color: 'white',
      borderRadius: `${radius('xl')} ${radius('xl')} 0 0`
    }}>
      <div className="flex align-items-center gap-3">
        <Avatar label={user.name[0]} size="xlarge" />
        <div>
          <h2 className="m-0">{user.name}</h2>
          <p className="m-0 opacity-90">@{user.username}</p>
        </div>
        <Badge value="Online" severity="success" />
      </div>
    </div>
  );

  return <Card header={header}>{/* Content */}</Card>;
};
```

### Notification Message

```javascript
import { Message } from 'primereact/message';

<Message 
  severity="success" 
  text="Your changes have been saved successfully!"
  className="w-full"
/>

{/* Available severities: success, info, warn, error */}
```

### Data Table

```javascript
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';

const MyTable = ({ data }) => {
  const statusTemplate = (rowData) => (
    <Badge 
      value={rowData.status} 
      severity={rowData.status === 'Active' ? 'success' : 'danger'}
    />
  );

  return (
    <DataTable value={data} className="shadow-6 border-round-xl">
      <Column field="name" header="Name" sortable />
      <Column field="email" header="Email" sortable />
      <Column field="status" header="Status" body={statusTemplate} />
    </DataTable>
  );
};
```

## 🎨 Customization

### Overriding Token Values

Create a custom tokens file:

```javascript
// customTokens.js
import { tokens as baseTokens } from './theme/tokens';

export const customTokens = {
  ...baseTokens,
  colors: {
    ...baseTokens.colors,
    primary: {
      ...baseTokens.colors.primary,
      main: '#your-custom-color',
    },
  },
};
```

### Adding New Gradients

```javascript
// In your component
const customGradient = 'linear-gradient(135deg, #your-start 0%, #your-end 100%)';

<div style={{ background: customGradient }}>
  Custom gradient
</div>
```

### Creating Custom Presets

```javascript
import { tokens } from './theme';

const myCustomPreset = {
  background: tokens.colors.background.primary,
  padding: tokens.spacing[8],
  borderRadius: tokens.borderRadius['2xl'],
  boxShadow: tokens.shadows.xl,
  // Add more styles
};
```

## 📱 Responsive Design

### Using Breakpoints

```javascript
import { tokens } from './theme';

// In CSS-in-JS or styled-components
const responsiveStyle = {
  padding: tokens.spacing[8],
  [`@media (max-width: ${tokens.breakpoints.md})`]: {
    padding: tokens.spacing[4],
  },
};
```

### PrimeFlex Responsive Classes

```javascript
<div className="grid">
  <div className="col-12 md:col-6 lg:col-4">
    {/* Responsive columns */}
  </div>
</div>
```

## 🔍 Best Practices

1. **Always use tokens** instead of hard-coded values
2. **Use utility functions** for consistent styling
3. **Leverage PrimeFlex** for layout and spacing
4. **Apply theme presets** for common patterns
5. **Use PrimeReact components** for consistency
6. **Test responsive** behavior on all screen sizes
7. **Maintain accessibility** with proper ARIA labels

## 📚 Examples

See `theme/examples.js` for complete working examples of:
- Themed forms
- Profile cards
- Dashboard statistics
- Notification panels
- Data tables
- Action buttons
- Hero sections

## 🚀 Getting Started

1. Import the theme in your component:
```javascript
import theme, { gradient, shadow, themePresets } from './theme';
```

2. Use theme tokens and utilities:
```javascript
<div style={{
  background: gradient('primary'),
  padding: theme.tokens.spacing[6],
  borderRadius: theme.tokens.borderRadius.xl,
  boxShadow: shadow('cardLg')
}}>
  Themed Content
</div>
```

3. Apply to PrimeReact components:
```javascript
<Button 
  label="Action"
  style={{
    background: gradient('primary'),
    border: 'none'
  }}
/>
```

## 🆘 Troubleshooting

**Q: Styles not applying?**  
A: Ensure you've imported `primeReactOverrides.css` after PrimeReact CSS in App.js

**Q: Colors look different?**  
A: Check that you're using tokens correctly and not mixing custom colors

**Q: Responsive issues?**  
A: Use PrimeFlex classes and test on actual devices

**Q: Component not styled?**  
A: Some components may need explicit style props or class names

---

**For more information**, see the complete examples in `theme/examples.js` and refer to [PrimeReact documentation](https://primereact.org/).
