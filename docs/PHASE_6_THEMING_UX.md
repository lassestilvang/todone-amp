# Phase 6: Theming & User Experience Polish

**Status**: 🔵 Planning  
**Priority**: High  
**Started**: January 2026

---

## Overview

This phase focuses on implementing a robust, accessible theming system with dark/light mode support, ensuring excellent contrast and readability across all components, and polishing the overall user experience for a professional, cohesive look.

---

## Current State Analysis

### ✅ What's Already Implemented
- Theme store (`src/store/themeStore.ts`) with `system`, `light`, `dark` modes
- Multiple color themes: `default`, `nord`, `dracula`, `solarized-light`, `solarized-dark`
- `useTheme` hook with DOM class management
- Tailwind `darkMode: 'class'` configuration
- CSS custom properties for theme colors
- Persistence via Zustand persist middleware
- System preference detection via `prefers-color-scheme`

### ⚠️ Issues to Address
- **Inconsistent dark mode coverage**: ~764+ `dark:` variants exist but many components lack proper dark mode styles
- **No theme switcher UI**: Settings page has theme options but no quick-access toggle
- **CSS custom properties underutilized**: Themes define vars but components use hardcoded Tailwind classes
- **Contrast issues**: Some color combinations don't meet WCAG AA standards
- **Missing transitions**: Theme changes can be jarring without smooth transitions

---

## Task Categories

### 1. 🎨 Core Theming Infrastructure

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.1.1 | Create unified CSS custom property system for all color tokens | High | ⬜ |
| T6.1.2 | Migrate hardcoded Tailwind colors to CSS variables | High | ⬜ |
| T6.1.3 | Define semantic color tokens (e.g., `--color-surface`, `--color-on-surface`) | High | ⬜ |
| T6.1.4 | Create `ThemeProvider` component to wrap app initialization | Medium | ⬜ |
| T6.1.5 | Add smooth transition animation for theme changes (150-200ms) | Medium | ⬜ |
| T6.1.6 | Prevent flash of wrong theme on initial load (SSR/hydration) | High | ⬜ |

### 2. 🌓 Dark/Light Mode Implementation

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.2.1 | Audit all components for missing `dark:` variants | High | ⬜ |
| T6.2.2 | Fix Sidebar component dark mode styles | High | ⬜ |
| T6.2.3 | Fix TaskCard component dark mode styles | High | ⬜ |
| T6.2.4 | Fix Modal/Dialog components dark mode styles | High | ⬜ |
| T6.2.5 | Fix Form inputs/buttons dark mode styles | High | ⬜ |
| T6.2.6 | Fix DropdownMenu components dark mode styles | Medium | ⬜ |
| T6.2.7 | Fix DatePicker/Calendar dark mode styles | Medium | ⬜ |
| T6.2.8 | Fix Toast/Notification dark mode styles | Medium | ⬜ |
| T6.2.9 | Fix EmptyState illustrations dark mode | Low | ⬜ |
| T6.2.10 | Ensure all icons have appropriate color in both modes | Medium | ⬜ |

### 3. 🎯 Theme Switcher UI

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.3.1 | Create `ThemeSwitcher` component with system/light/dark options | High | ⬜ |
| T6.3.2 | Add theme toggle to app header/navbar | High | ⬜ |
| T6.3.3 | Add theme toggle to mobile navigation | High | ⬜ |
| T6.3.4 | Create animated sun/moon icon transition | Low | ⬜ |
| T6.3.5 | Add keyboard shortcut for theme toggle (e.g., `Cmd+Shift+L`) | Low | ⬜ |
| T6.3.6 | Show current theme indicator in UI | Medium | ⬜ |

### 4. 🎭 Color Theme Selection

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.4.1 | Create theme preview thumbnails for Settings | Medium | ⬜ |
| T6.4.2 | Complete Nord theme implementation | Medium | ⬜ |
| T6.4.3 | Complete Dracula theme implementation | Medium | ⬜ |
| T6.4.4 | Complete Solarized Light theme implementation | Medium | ⬜ |
| T6.4.5 | Complete Solarized Dark theme implementation | Medium | ⬜ |
| T6.4.6 | Add theme preview in Settings before applying | Low | ⬜ |
| T6.4.7 | Consider additional popular themes (One Dark, GitHub, etc.) | Low | ⬜ |

### 5. ♿ Accessibility & Contrast

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.5.1 | Audit all color combinations for WCAG AA contrast (4.5:1 text, 3:1 UI) | High | ⬜ |
| T6.5.2 | Fix priority colors (P1-P4) contrast in both modes | High | ⬜ |
| T6.5.3 | Ensure focus ring visibility in all themes | High | ⬜ |
| T6.5.4 | Fix disabled state contrast | Medium | ⬜ |
| T6.5.5 | Ensure sufficient contrast for placeholder text | Medium | ⬜ |
| T6.5.6 | Add high-contrast mode option for accessibility | Low | ⬜ |
| T6.5.7 | Test with color blindness simulation tools | Medium | ⬜ |
| T6.5.8 | Ensure chart/graph colors are distinguishable | Medium | ⬜ |

### 6. ✨ Visual Polish & UX

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.6.1 | Unify shadow styles across light/dark modes | Medium | ⬜ |
| T6.6.2 | Add subtle background patterns/gradients for visual interest | Low | ⬜ |
| T6.6.3 | Polish hover/active states for consistency | Medium | ⬜ |
| T6.6.4 | Improve loading skeleton styles for dark mode | Medium | ⬜ |
| T6.6.5 | Add micro-interactions for theme changes | Low | ⬜ |
| T6.6.6 | Ensure smooth scrollbar styling in both modes | Low | ⬜ |
| T6.6.7 | Update favicon/app icon based on theme | Low | ⬜ |
| T6.6.8 | Polish empty states with theme-aware illustrations | Low | ⬜ |

### 7. 📱 Responsive Theme Considerations

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.7.1 | Ensure mobile touch targets have proper contrast | High | ⬜ |
| T6.7.2 | Test theme switching on mobile devices | High | ⬜ |
| T6.7.3 | Optimize theme CSS for mobile performance | Medium | ⬜ |
| T6.7.4 | Ensure bottom sheet/drawer dark mode compatibility | Medium | ⬜ |
| T6.7.5 | Test PWA theme-color meta tag updates | Medium | ⬜ |

### 8. 🧪 Testing & Quality Assurance

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.8.1 | Add Storybook stories for all theme variants | High | ⬜ |
| T6.8.2 | Create visual regression tests for theme changes | Medium | ⬜ |
| T6.8.3 | Add E2E tests for theme switching functionality | High | ⬜ |
| T6.8.4 | Test theme persistence across sessions | High | ⬜ |
| T6.8.5 | Test system preference change detection | Medium | ⬜ |
| T6.8.6 | Add unit tests for theme store edge cases | Medium | ⬜ |
| T6.8.7 | Manual testing on different OS dark mode settings | Medium | ⬜ |

### 9. 📖 Documentation

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.9.1 | Document theming architecture in DOCS.md | Medium | ⬜ |
| T6.9.2 | Create contribution guide for adding new themes | Low | ⬜ |
| T6.9.3 | Document semantic color token naming convention | Medium | ⬜ |
| T6.9.4 | Add JSDoc comments to theme utilities | Low | ⬜ |

---

## Implementation Plan

### Sprint 1: Foundation (Week 1-2)
Focus: Core infrastructure and critical dark mode fixes

1. **T6.1.1-T6.1.3**: Establish CSS custom property system
2. **T6.1.6**: Prevent theme flash on load
3. **T6.2.1**: Complete component audit
4. **T6.2.2-T6.2.5**: Fix major component dark modes
5. **T6.3.1-T6.3.2**: Create and integrate theme switcher

### Sprint 2: Polish (Week 3-4)
Focus: Remaining components and accessibility

1. **T6.2.6-T6.2.10**: Fix remaining component dark modes
2. **T6.5.1-T6.5.5**: Address all contrast issues
3. **T6.3.3, T6.3.6**: Mobile theme toggle
4. **T6.4.2-T6.4.5**: Complete alternate themes

### Sprint 3: Quality (Week 5)
Focus: Testing and documentation

1. **T6.8.1-T6.8.6**: Testing coverage
2. **T6.6.1-T6.6.4**: Visual polish
3. **T6.7.1-T6.7.5**: Mobile testing
4. **T6.9.1-T6.9.3**: Documentation

---

## Technical Specifications

### Semantic Color Token System

```css
:root {
  /* Surfaces */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f3f4f6;
  --color-surface-elevated: #ffffff;
  
  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #ffffff;
  
  /* Borders */
  --color-border-default: #e5e7eb;
  --color-border-hover: #d1d5db;
  --color-border-focus: #3b82f6;
  
  /* Interactive */
  --color-interactive-primary: #22c55e;
  --color-interactive-hover: #16a34a;
  --color-interactive-active: #15803d;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}

.dark {
  --color-surface-primary: #111827;
  --color-surface-secondary: #1f2937;
  --color-surface-tertiary: #374151;
  --color-surface-elevated: #1f2937;
  
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #111827;
  
  --color-border-default: #374151;
  --color-border-hover: #4b5563;
  --color-border-focus: #60a5fa;
  
  --color-interactive-primary: #4ade80;
  --color-interactive-hover: #22c55e;
  --color-interactive-active: #16a34a;
}
```

### Theme Switcher Component API

```tsx
interface ThemeSwitcherProps {
  variant?: 'icon' | 'dropdown' | 'segmented'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + L` | Toggle light/dark mode |
| `Cmd/Ctrl + Shift + T` | Open theme selector |

---

## Success Criteria

- [ ] All components render correctly in both light and dark modes
- [ ] Theme persists across browser sessions
- [ ] System preference is respected when set to "system"
- [ ] All text meets WCAG AA contrast requirements (4.5:1)
- [ ] All UI elements meet WCAG AA contrast requirements (3:1)
- [ ] Theme can be changed without page reload
- [ ] No flash of incorrect theme on initial load
- [ ] Storybook shows all components in both themes
- [ ] E2E tests pass for theme functionality
- [ ] Mobile experience is smooth and performant

---

## Dependencies

- Tailwind CSS (existing)
- Zustand (existing)
- Lucide React icons (existing)

---

## Related Documents

- [PHASE_5_ROADMAP.md](./PHASE_5_ROADMAP.md) - Previous phase
- [DOCS.md](../DOCS.md) - Main documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Initial document creation | Amp |
