# Theming Architecture Guide

**Last Updated**: January 2026

This document explains Todone's theming system, including how to use semantic color tokens, add new themes, and ensure accessibility compliance.

---

## Overview

Todone uses a **CSS Custom Properties (variables) based theming system** integrated with Tailwind CSS. This approach provides:

- **Automatic dark/light mode** with system preference detection
- **9 color themes** (default, nord, dracula, solarized-light/dark, one-dark, github-light/dark, high-contrast)
- **Semantic color tokens** that adapt automatically per theme
- **WCAG AA accessible** color contrast throughout
- **Smooth 150ms transitions** between theme changes
- **No flash of wrong theme** on initial page load

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  ThemeSwitcher   │  │  Settings Page   │  │  Components   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
│           │                     │                    │          │
│           └─────────────┬───────┴────────────────────┘          │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    useTheme() Hook                       │   │
│  │      Provides: mode, theme, resolvedMode, isDark,        │   │
│  │                setMode(), setTheme()                     │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   ThemeProvider                          │   │
│  │    - Manages <html> class (light/dark + theme-*)         │   │
│  │    - Handles transitions (theme-transition class)        │   │
│  │    - Listens to system preference changes                │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  themeStore (Zustand)                    │   │
│  │    - Persists mode + theme to localStorage               │   │
│  │    - Resolves 'system' mode to light/dark                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CSS Custom Properties                       │   │
│  │   :root (light) / .dark / .theme-* class overrides       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Tailwind Utilities                         │   │
│  │    bg-surface-*, text-content-*, border-border, etc.     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── styles/
│   ├── tokens.css              # Default light/dark CSS variables
│   ├── tokens.ts               # TypeScript token constants
│   └── themes/
│       ├── index.css           # Imports all theme files
│       ├── nord.css            # Nord theme overrides
│       ├── dracula.css         # Dracula theme overrides
│       ├── solarized-light.css
│       ├── solarized-dark.css
│       ├── one-dark.css
│       ├── github-light.css
│       ├── github-dark.css
│       └── high-contrast.css   # Accessibility theme (WCAG AAA)
│
├── store/
│   └── themeStore.ts           # Zustand store for theme state
│
├── contexts/
│   └── ThemeContext.ts         # React context definition
│
├── components/
│   ├── ThemeProvider.tsx       # Provider that manages DOM classes
│   └── ThemeSwitcher.tsx       # UI component for theme selection
│
└── hooks/
    └── useTheme.ts             # Hook to consume theme context
```

---

## Semantic Color Token System

### Token Categories

| Category | Purpose | Example Tokens |
|----------|---------|----------------|
| **Surface** | Backgrounds, containers | `surface-primary`, `surface-elevated` |
| **Content** | Typography, text | `content-primary`, `content-secondary` |
| **Border** | Borders, dividers | `border`, `border-subtle` |
| **Interactive** | Buttons, links | `interactive-primary`, `interactive-hover` |
| **Semantic** | Status indicators | `semantic-success`, `semantic-error` |
| **Priority** | Task priorities | `priority-p1`, `priority-p2` |
| **Sidebar** | Sidebar-specific | `sidebar-bg`, `sidebar-hover` |
| **Input** | Form elements | `input-bg`, `input-border` |
| **Icon** | Icon colors | `icon-success`, `icon-warning` |
| **Accent** | Decorative | `accent-purple`, `accent-teal` |

### Using Tokens in Components

```tsx
// ✅ CORRECT: Use semantic Tailwind classes
<div className="bg-surface-primary text-content-primary border border-border">
  <button className="bg-interactive-primary hover:bg-interactive-primary-hover">
    Click me
  </button>
</div>

// ❌ WRONG: Hardcoded colors require dark: variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <button className="bg-green-500 dark:bg-green-400">Click me</button>
</div>
```

### Migration Reference

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-white` / `dark:bg-gray-800` | `bg-surface-primary` |
| `bg-gray-50` / `dark:bg-gray-700` | `bg-surface-secondary` |
| `bg-gray-100` | `bg-surface-tertiary` |
| `text-gray-900` / `dark:text-white` | `text-content-primary` |
| `text-gray-600/700` | `text-content-secondary` |
| `text-gray-400/500` | `text-content-tertiary` |
| `border-gray-200/300` / `dark:border-gray-700` | `border-border` |
| `hover:bg-gray-100` | `hover:bg-surface-tertiary` |
| `text-red-600` | `text-semantic-error` |
| `text-green-600` | `text-semantic-success` |
| `focus:ring-blue-500` | `focus:ring-focus` |

---

## Theme Modes

The system supports three modes:

| Mode | Behavior |
|------|----------|
| `light` | Always light mode |
| `dark` | Always dark mode |
| `system` | Follows OS preference via `prefers-color-scheme` |

### Programmatic Usage

```tsx
import { useTheme } from '@/hooks/useTheme'

function MyComponent() {
  const { mode, theme, resolvedMode, isDark, setMode, setTheme } = useTheme()
  
  // mode: 'light' | 'dark' | 'system'
  // theme: 'default' | 'nord' | 'dracula' | ...
  // resolvedMode: 'light' | 'dark' (always resolved, even for 'system')
  // isDark: boolean (shorthand for resolvedMode === 'dark')
  
  return (
    <button onClick={() => setMode('dark')}>
      Switch to Dark
    </button>
  )
}
```

---

## Available Themes

| Theme | Type | Description |
|-------|------|-------------|
| `default` | Light/Dark | Standard Todone green brand colors |
| `nord` | Dark | Arctic, north-bluish palette |
| `dracula` | Dark | Popular dark theme with purple accents |
| `solarized-light` | Light | Ethan Schoonover's Solarized Light |
| `solarized-dark` | Dark | Ethan Schoonover's Solarized Dark |
| `one-dark` | Dark | Atom One Dark inspired |
| `github-light` | Light | GitHub's light theme |
| `github-dark` | Dark | GitHub's dark theme |
| `high-contrast` | Dark | WCAG AAA compliant, maximum contrast |

---

## Adding a New Theme

### Step 1: Create Theme CSS File

Create `src/styles/themes/my-theme.css`:

```css
/* ==========================================================================
   My Theme
   ========================================================================== */

.theme-my-theme {
  /* Surface Colors */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f5f5f5;
  --color-surface-tertiary: #eeeeee;
  --color-surface-elevated: #ffffff;
  --color-surface-overlay: rgba(0, 0, 0, 0.5);

  /* Text Colors */
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  --color-text-tertiary: #9e9e9e;
  --color-text-inverse: #ffffff;
  --color-text-disabled: #bdbdbd;

  /* Border Colors */
  --color-border-default: #e0e0e0;
  --color-border-hover: #bdbdbd;
  --color-border-focus: #2196f3;
  --color-border-subtle: #eeeeee;

  /* Interactive Colors */
  --color-interactive-primary: #2196f3;
  --color-interactive-primary-hover: #1976d2;
  --color-interactive-primary-active: #1565c0;
  /* ... continue with all tokens ... */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  /* ... */
}

/* Set color-scheme for browser UI */
.theme-my-theme {
  color-scheme: light; /* or 'dark' for dark themes */
}
```

### Step 2: Import Theme

Add to `src/styles/themes/index.css`:

```css
@import './my-theme.css';
```

### Step 3: Register Theme

Update `src/store/themeStore.ts`:

```typescript
export type ThemeName =
  | 'default'
  | 'nord'
  // ... existing themes
  | 'my-theme'  // Add new theme
```

Update `src/components/ThemeProvider.tsx`:

```typescript
const themeClassMap: Record<ThemeName, string> = {
  default: '',
  nord: 'theme-nord',
  // ... existing themes
  'my-theme': 'theme-my-theme',  // Add mapping
}
```

### Step 4: Add to Settings UI

Update the theme selector in `src/views/SettingsView.tsx` to include your new theme option.

---

## Preventing Flash of Wrong Theme

The app prevents a flash of incorrect theme on initial load using an inline script in `index.html`:

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('todone-theme');
      if (stored) {
        var parsed = JSON.parse(stored);
        var mode = parsed.state?.mode || 'system';
        var resolved = mode;
        if (mode === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
        }
        document.documentElement.classList.add(resolved);
      }
    } catch (e) {}
  })();
</script>
```

This runs synchronously before CSS loads, ensuring the correct theme class is applied immediately.

---

## Theme Transitions

Theme changes use smooth CSS transitions for visual polish:

```css
html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition: background-color 150ms ease-in-out,
              border-color 150ms ease-in-out,
              color 150ms ease-in-out !important;
}
```

The `theme-transition` class is only applied during theme changes (not on initial load) to avoid affecting other animations.

**Accessibility**: Transitions are disabled for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  html.theme-transition * {
    transition: none !important;
  }
}
```

---

## Accessibility Compliance

### Contrast Requirements

All color combinations meet WCAG 2.1 AA standards:
- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text/UI components**: 3:1 minimum contrast ratio
- **Focus indicators**: Visible in all themes

### High Contrast Theme

For users with low vision, the `high-contrast` theme provides WCAG AAA compliance:
- Pure black background (`#000000`)
- Pure white text (`#ffffff`)
- 21:1 contrast ratio for primary text
- 3px focus rings for visibility
- Saturated, distinguishable colors

### Color Blindness Considerations

The app uses multiple indicators beyond color alone:
- Icons accompany status colors (✓ for success, ⚠ for warning, ✗ for error)
- Priority labels include text ("P1 - Urgent", "High", etc.)
- Charts use patterns/shapes in addition to color

---

## ThemeSwitcher Component

Three variants are available:

```tsx
// Simple icon button that cycles through modes
<ThemeSwitcher variant="icon" size="sm" />

// Dropdown menu with all options
<ThemeSwitcher variant="dropdown" size="md" showLabel />

// Segmented control with all three modes visible
<ThemeSwitcher variant="segmented" size="lg" showLabel />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'icon' \| 'dropdown' \| 'segmented'` | `'icon'` | UI style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `showLabel` | `boolean` | `false` | Show text label |
| `className` | `string` | - | Additional classes |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + L` | Toggle light/dark mode |

---

## Testing Themes

### Storybook

View all components in different themes:

```bash
npm run storybook
```

Use the theme selector in the toolbar to preview components across all theme variants.

### E2E Tests

Theme-related tests are in `e2e/theme.spec.ts`:

```bash
npm run test:e2e:chromium -- --grep "theme"
```

### Visual Regression

Baseline screenshots for theme changes are in `e2e/__snapshots__/`:

```bash
npm run test:e2e:chromium -- theme-visual.spec.ts
```

---

## Troubleshooting

### Theme not applying

1. Check that `ThemeProvider` wraps your app in `App.tsx`
2. Verify the theme class is on `<html>` element in DevTools
3. Check localStorage for `todone-theme` key

### Colors not updating

1. Ensure you're using semantic tokens (`bg-surface-*`) not hardcoded colors
2. Check that the CSS variable is defined in the theme file
3. Verify Tailwind config maps the utility to the CSS variable

### Flash of wrong theme

1. Check the inline script in `index.html` is present
2. Verify the script runs before any CSS loads
3. Test with slow 3G throttling in DevTools

---

## Related Documentation

- [PHASE_6_THEMING_UX.md](./PHASE_6_THEMING_UX.md) - Theming implementation tasks and status
- [DEVELOPER_QUICK_REFERENCE.md](./DEVELOPER_QUICK_REFERENCE.md) - Code patterns
- [AGENTS.md](../AGENTS.md) - Development standards
