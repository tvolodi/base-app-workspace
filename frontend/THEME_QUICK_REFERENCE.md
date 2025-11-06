# Theme Quick Reference Card

## 🎨 Common Imports

```javascript
// Main theme with utilities
import theme, { 
  tokens,
  gradient, 
  shadow, 
  radius,
  themePresets,
  buttonStyle,
  cardStyle 
} from './theme';

// PrimeReact Components
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
```

## 🎯 Quick Patterns

### Gradient Button
```javascript
<Button 
  label="Click Me"
  style={{
    background: gradient('primary'),
    border: 'none',
    boxShadow: shadow('button')
  }}
/>
```

### Elevated Card
```javascript
<Card style={themePresets.elevatedCard}>
  Content
</Card>
```

### Gradient Text
```javascript
<h1 style={themePresets.gradientText}>
  Title
</h1>
```

### Form Container
```javascript
<div style={themePresets.formContainer}>
  {/* Form content */}
</div>
```

### Icon Badge
```javascript
<div style={themePresets.iconBadge('lg')}>
  <i className="pi pi-check"></i>
</div>
```

## 🎨 Color Reference

```javascript
// Primary
tokens.colors.primary.main        // #667eea
tokens.colors.secondary.main      // #764ba2

// Status
tokens.colors.status.success      // #10b981
tokens.colors.status.error        // #dc2626
tokens.colors.status.warning      // #f59e0b
tokens.colors.status.info         // #3b82f6

// Gradients
gradient('primary')                // Main gradient
gradient('primarySubtle')          // Light background
gradient('background')             // Page background
```

## 📐 Spacing

```javascript
tokens.spacing[1]   // 0.25rem (4px)
tokens.spacing[2]   // 0.5rem (8px)
tokens.spacing[4]   // 1rem (16px)
tokens.spacing[6]   // 1.5rem (24px)
tokens.spacing[8]   // 2rem (32px)
```

## 🔤 Typography

```javascript
tokens.typography.fontSize.sm      // 0.875rem
tokens.typography.fontSize.base    // 1rem
tokens.typography.fontSize.lg      // 1.125rem
tokens.typography.fontSize['2xl']  // 1.5rem
tokens.typography.fontSize['3xl']  // 1.875rem

tokens.typography.fontWeight.normal    // 400
tokens.typography.fontWeight.semibold  // 600
tokens.typography.fontWeight.bold      // 700
```

## 🌓 Shadows

```javascript
shadow('sm')         // Small
shadow('md')         // Medium
shadow('lg')         // Large
shadow('xl')         // Extra large
shadow('card')       // Card shadow
shadow('cardLg')     // Elevated card
shadow('button')     // Button shadow
```

## 📏 Border Radius

```javascript
radius('sm')     // 0.375rem (6px)
radius('md')     // 0.75rem (12px)
radius('lg')     // 1rem (16px)
radius('xl')     // 1.25rem (20px)
radius('full')   // 9999px
radius('circle') // 50%
```

## 🎭 PrimeFlex Classes

### Layout
```javascript
className="flex"                    // Flexbox
className="grid"                    // Grid layout
className="flex-column"             // Column direction
className="justify-content-center"  // Center horizontally
className="align-items-center"      // Center vertically
```

### Spacing
```javascript
className="p-4"     // Padding: 1rem
className="m-4"     // Margin: 1rem
className="gap-3"   // Gap: 0.75rem
className="mb-4"    // Margin bottom: 1rem
```

### Sizing
```javascript
className="w-full"   // Width: 100%
className="h-full"   // Height: 100%
```

### Grid
```javascript
className="col-12"              // Full width
className="col-12 md:col-6"     // Half on medium+
className="col-12 lg:col-4"     // Third on large+
```

## 🎨 Message Severities

```javascript
<Message severity="success" text="Success!" />
<Message severity="info" text="Info!" />
<Message severity="warn" text="Warning!" />
<Message severity="error" text="Error!" />
```

## 🏷️ Badge Severities

```javascript
<Badge value="Active" severity="success" />
<Badge value="Alert" severity="danger" />
<Badge value="Pending" severity="warning" />
<Badge value="Info" severity="info" />
```

## 🔘 Button Variants

```javascript
<Button label="Primary" />
<Button label="Secondary" className="p-button-secondary" />
<Button label="Success" className="p-button-success" />
<Button label="Danger" className="p-button-danger" />
<Button label="Warning" className="p-button-warning" />
<Button label="Info" className="p-button-info" />
<Button label="Outlined" className="p-button-outlined" />
<Button label="Text" className="p-button-text" />
```

## 📊 Button Sizes

```javascript
<Button label="Small" className="p-button-sm" />
<Button label="Default" />
<Button label="Large" className="p-button-lg" />
```

## 🎯 Common Inline Styles

### Gradient Background
```javascript
style={{ background: gradient('primary') }}
```

### Elevated Shadow
```javascript
style={{ boxShadow: shadow('cardLg') }}
```

### Rounded Corners
```javascript
style={{ borderRadius: radius('xl') }}
```

### Centered Content
```javascript
className="flex justify-content-center align-items-center"
```

### Card with Padding
```javascript
style={{
  background: tokens.colors.background.primary,
  padding: tokens.spacing[6],
  borderRadius: radius('xl'),
  boxShadow: shadow('card')
}}
```

### Gradient Header
```javascript
style={{
  background: gradient('primary'),
  color: 'white',
  padding: tokens.spacing[4],
  borderRadius: `${radius('xl')} ${radius('xl')} 0 0`
}}
```

## 📱 Responsive Patterns

### Mobile First
```javascript
className="col-12 md:col-6 lg:col-4"
// Mobile: Full width
// Tablet: Half width
// Desktop: Third width
```

### Hide on Mobile
```javascript
className="hidden md:block"
```

### Stack on Mobile
```javascript
className="flex flex-column md:flex-row"
```

## ⚡ Performance Tips

1. Import only what you need
2. Use CSS classes over inline styles when possible
3. Memoize components with React.memo
4. Use PrimeFlex utilities for common patterns
5. Leverage CSS variables for dynamic theming

## 🔗 Quick Links

- Full Guide: `THEME_GUIDE.md`
- Examples: `theme/examples.js`
- Tokens: `theme/tokens.js`
- PrimeReact: https://primereact.org/
- PrimeFlex: https://primeflex.org/

---

**Pro Tip**: Bookmark this file for quick reference while developing!
