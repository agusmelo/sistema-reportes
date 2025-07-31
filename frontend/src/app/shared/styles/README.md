# Design System Documentation

This document describes the unified design system implemented for the Sistema de Reportes application.

## Overview

Our design system provides a comprehensive set of CSS custom properties, utility classes, component styles, and mixins that ensure consistency across the entire application.

## Architecture

### 1. Global Styles (`src/styles.css`)
- **CSS Custom Properties**: Complete design token system with colors, typography, spacing, shadows, etc.
- **Global Reset**: Consistent box-sizing and base styles
- **Utility Classes**: Tailwind-inspired utility classes for rapid development

### 2. Component Styles (`src/app/shared/styles/components.css`)
- **Form Components**: Consistent form field styles, labels, validation states
- **Button Components**: Button variants, sizes, states, and interactions
- **Card Components**: Card layouts with headers, bodies, and footers
- **Table Components**: Table styling with sorting, hover states, and responsive design
- **Modal Components**: Modal overlays, animations, and sizes
- **Alert Components**: Alert variants for different message types
- **Layout Components**: Container, section, and grid utilities

### 3. Mixins and Utilities (`src/app/shared/styles/mixins.css`)
- **Reusable Patterns**: Common CSS patterns as utility classes
- **Animation Helpers**: Predefined animations and transitions
- **State Mixins**: Loading, error, success, and warning states
- **Accessibility Helpers**: Screen reader utilities, focus management
- **Responsive Utilities**: Mobile-first responsive design patterns

## Design Tokens

### Colors

#### Primary Colors
- `--color-primary`: #007bff (Main brand color)
- `--color-primary-dark`: #0056b3 (Hover states)
- `--color-primary-light`: #66b3ff (Lighter variant)
- `--color-primary-lighter`: #e3f2fd (Background tints)

#### Semantic Colors
- `--color-success`: #28a745 (Success states)
- `--color-warning`: #ffc107 (Warning states)
- `--color-danger`: #dc3545 (Error states)
- `--color-info`: #17a2b8 (Information states)
- `--color-orange`: #fd7e14 (Emergency/urgent states)

#### Neutral Colors
- `--color-gray-50` to `--color-gray-900`: Complete grayscale palette
- `--text-primary`, `--text-secondary`, `--text-muted`: Text color hierarchy
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`: Background color hierarchy

### Typography

#### Font Families
- `--font-family-base`: 'Inter', 'Segoe UI', sans-serif (Primary font)
- `--font-family-mono`: 'JetBrains Mono', 'Fira Code', monospace (Code font)

#### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
- `--font-size-4xl`: 2.25rem (36px)

#### Font Weights
- `--font-weight-light`: 300
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Spacing Scale

Based on a 4px base unit:
- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-5`: 1.25rem (20px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-10`: 2.5rem (40px)
- `--space-12`: 3rem (48px)

### Border Radius
- `--radius-sm`: 0.25rem (4px)
- `--radius-base`: 0.375rem (6px)
- `--radius-md`: 0.5rem (8px)
- `--radius-lg`: 0.75rem (12px)
- `--radius-xl`: 1rem (16px)
- `--radius-full`: 9999px (Fully rounded)

### Shadows
- `--shadow-sm`: Subtle shadow for cards
- `--shadow-base`: Standard shadow for components
- `--shadow-md`: Medium shadow for hover states
- `--shadow-lg`: Large shadow for elevated components
- `--shadow-xl`: Extra large shadow for modals

## Utility Classes

### Layout
```css
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
```

### Spacing
```css
.p-4 { padding: var(--space-4); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.m-4 { margin: var(--space-4); }
.mx-auto { margin-left: auto; margin-right: auto; }
```

### Typography
```css
.text-sm { font-size: var(--font-size-sm); }
.text-lg { font-size: var(--font-size-lg); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.text-center { text-align: center; }
.text-primary { color: var(--text-primary); }
```

### Colors
```css
.bg-primary { background-color: var(--bg-primary); }
.bg-success { background-color: var(--color-success); }
.text-danger { color: var(--color-danger); }
```

## Component Guidelines

### Buttons

Use the `.btn` base class with variant modifiers:

```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary Action</button>
<button class="btn btn-outline-primary">Outlined Button</button>
<button class="btn btn-ghost">Ghost Button</button>
```

Button sizes:
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Forms

Use consistent form styling:

```html
<div class="form-group">
  <label class="form-label required">Email Address</label>
  <input type="email" class="form-input" placeholder="Enter email">
  <div class="form-error-text">Please enter a valid email</div>
</div>
```

### Cards

Standard card structure:

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Subtitle</p>
  </div>
  <div class="card-body">
    <!-- Card content -->
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Tables

Responsive table structure:

```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Header 1</th>
        <th>Header 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Responsive Design

The design system follows a mobile-first approach with these breakpoints:

- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

Use responsive utility classes:

```css
.grid-cols-1 .md:grid-cols-2 .lg:grid-cols-3
.text-sm .md:text-base .lg:text-lg
.p-4 .md:p-6 .lg:p-8
```

## Animation and Transitions

### Standard Transitions
- `--transition-fast`: 150ms ease (Quick interactions)
- `--transition-base`: 200ms ease (Standard interactions)
- `--transition-slow`: 300ms ease (Complex animations)

### Animation Classes
```css
.fade-in { animation: fadeIn 0.3s ease-in-out; }
.slide-up { animation: slideUp 0.3s ease-out; }
.scale-in { animation: scaleIn 0.2s ease-out; }
```

## Best Practices

### 1. Use Design Tokens
Always use CSS custom properties instead of hardcoded values:

```css
/* ✅ Good */
color: var(--text-primary);
padding: var(--space-4);

/* ❌ Bad */
color: #333;
padding: 16px;
```

### 2. Prefer Utility Classes
Use utility classes for simple styling:

```html
<!-- ✅ Good -->
<div class="flex items-center gap-4 p-6">

<!-- ❌ Bad -->
<div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem;">
```

### 3. Use Component Classes for Complex Patterns
For complex components, use predefined component classes:

```html
<!-- ✅ Good -->
<button class="btn btn-primary btn-lg">

<!-- ❌ Bad -->
<button class="bg-primary text-white p-4 rounded-md font-semibold">
```

### 4. Maintain Consistency
- Use consistent spacing from the scale
- Follow the established color palette
- Use standard border radius values
- Apply consistent typography hierarchy

### 5. Accessibility
- Always include focus states
- Use semantic HTML elements
- Provide adequate color contrast
- Support keyboard navigation

## Migration Guide

When updating existing components to use the design system:

1. **Replace hardcoded colors** with design tokens
2. **Update spacing** to use the consistent scale
3. **Apply utility classes** for common patterns
4. **Use component classes** for complex UI elements
5. **Test responsive behavior** across breakpoints
6. **Verify accessibility** compliance

## Examples

### Before (Old Style)
```css
.my-button {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.my-button:hover {
  background-color: #0056b3;
}
```

### After (Design System)
```html
<button class="btn btn-primary">My Button</button>
```

### Complex Component Example
```html
<div class="card card-hover">
  <div class="card-header">
    <h3 class="card-title">Invoice Details</h3>
  </div>
  <div class="card-body">
    <div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Client Name</label>
        <input class="form-input" type="text">
      </div>
      <div class="form-group">
        <label class="form-label">Amount</label>
        <input class="form-input" type="number">
      </div>
    </div>
  </div>
  <div class="card-footer">
    <button class="btn btn-secondary btn-sm">Cancel</button>
    <button class="btn btn-primary btn-sm">Save</button>
  </div>
</div>
```

This design system ensures consistency, maintainability, and scalability across the entire application while providing flexibility for future enhancements.
