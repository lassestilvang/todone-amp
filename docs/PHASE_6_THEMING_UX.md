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
| T6.1.1 | Create unified CSS custom property system for all color tokens | High | ✅ |
| T6.1.2 | Migrate hardcoded Tailwind colors to CSS variables | High | 🔄 |
| T6.1.3 | Define semantic color tokens (e.g., `--color-surface`, `--color-on-surface`) | High | ✅ |
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

## Migration Progress Report

### T6.1.2 - Semantic Token Migration Status

**Infrastructure Created:**
- ✅ `src/styles/tokens.css` - Complete semantic token system with light/dark mode support
- ✅ `tailwind.config.js` - Extended with semantic color utilities (surface, content, border, interactive, semantic, sidebar, input, tooltip)

**Components Migrated (~93 files):**
- ✅ **UI Components**: Card, Button, Input, Dropdown, Tooltip (core reusable components)
- ✅ **A-B Components**: AccessibilityAuditor, AchievementDetailModal, ActivityFeed, AIAssistance, AnalyticsDashboard, BoardView, BottomSheet, BulkActionsToolbar, etc. (23 files)
- ✅ **C-D Components**: CalendarIntegration, CommentForm, ConflictResolver, DailyReview/*, DashboardLayout, DatePickerInput, etc. (~20 files)
- ✅ **E-H Components**: EmailIntegration, EnhancedSearchBar, FilterPanel, FloatingActionButton, GroupedTaskList, etc. (12 files)
- ✅ **I-L Components**: IntegrationManager, KarmaWidget, KeyboardShortcutsHelp, LabelManagement, Leaderboard, ListViewOptions, etc. (14 files)
- ✅ **M-P Components**: MobileNav, NotificationCenter, PermissionManager, PersonalDashboard, ProductivityChart, ProjectSharing, etc. (20 files)
- ✅ **Q-S Components**: QuickAddModal, RichTextEditor, Sidebar, SlackIntegration, StreakDisplay, SubTaskList, SyncStatus, etc. (25 files)
- 🔄 **T-Z Components**: Partially migrated (TaskItem, TaskDetailPanel, TeamDashboard, TemplateGallery, etc.)

**Remaining Work (~68 files with hardcoded colors):**
- 49 files in `src/components/`
- 10 files in `src/components/ui/`
- 9 files in other `src/` folders (pages, views, etc.)

**Test Updates Needed:**
- 6 tests failing due to class name changes:
  - `CalendarIntegration.test.tsx` - expects `border-gray-200`, `bg-white`
  - `FloatingActionButton.test.tsx` - expects `text-red-600`, `bg-gray-800`
  - `ProjectSharing.test.tsx` - expects `bg-white`
  - `TaskItem.test.tsx` - expects `line-through text-gray-400`, `hover:bg-gray-50`

**Token Mapping Reference:**
| Old Class | New Semantic Class |
|-----------|-------------------|
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
| `focus:ring-brand-500` | `focus:ring-focus` |

---

## Next Steps

### Phase 1: Complete T6.1.2 Migration (Priority: Critical)

#### Task NS-1: Migrate Remaining T-Z Components
**Description:** Complete the semantic token migration for all components starting with T through Z. These were partially migrated but the subagent was interrupted.

**Files to migrate (~25):**
- `TaskItem.tsx`, `TaskList.tsx`, `TaskDetailPanel.tsx`, `TaskSuggestions.tsx`, `TaskAssignmentModal.tsx`, `TaskListSkeleton.tsx`
- `TeamDashboard.tsx`, `TeamSettings.tsx`, `TeamAnalytics.tsx`, `TeamMembersList.tsx`, `TeamMemberProfile.tsx`, `TeamSelector.tsx`, `TeamActivityOnSharedProject.tsx`
- `TemplateCard.tsx`, `TemplateForm.tsx`, `TemplateGallery.tsx`, `TemplatePreview.tsx`
- `TimeBlockingView.tsx`, `TimePickerInput.tsx`
- `TutorialTooltip.tsx`
- `UndoNotification.tsx`, `UserProfile.tsx`
- `ViewSwitcher.tsx`, `VirtualizedTaskList.tsx`, `VirtualTaskList.tsx`
- `WeeklyGoalProgress.tsx`

**Approach:** Apply the token mapping reference above. Replace `bg-white dark:bg-gray-800` patterns with single `bg-surface-primary` class. Remove redundant `dark:` variants where semantic tokens handle both modes.

---

#### Task NS-2: Migrate UI Component Library
**Description:** Migrate remaining 10 files in `src/components/ui/` that still use hardcoded colors.

**Files to audit:**
- `Skeleton/Skeleton.tsx` and stories
- `Badge/Badge.tsx`
- `Modal/Modal.tsx`
- `Toast/Toast.tsx`
- `Switch/Switch.tsx`
- `Checkbox/Checkbox.tsx`
- `Select/Select.tsx`
- `Tabs/Tabs.tsx`
- `Progress/Progress.tsx`
- `Avatar/Avatar.tsx`

**Note:** UI components are highest priority as they're reused throughout the app. Changes here have the widest impact.

---

#### Task NS-3: Migrate Pages and Views
**Description:** Migrate 9 remaining files in `src/pages/` and `src/views/` folders.

**Files to check:**
- `src/pages/` - Settings page, Auth pages, etc.
- `src/views/` - Main view components
- `src/index.css` - Base layer styles (already partially done)

---

#### Task NS-4: Fix Failing Tests
**Description:** Update 6 test files that expect old hardcoded class names.

| Test File | Changes Needed |
|-----------|----------------|
| `CalendarIntegration.test.tsx` | `border-gray-200` → `border-border`, `bg-white` → `bg-surface-primary` |
| `FloatingActionButton.test.tsx` | `text-red-600` → `text-semantic-error`, `bg-gray-800` → `bg-surface-tertiary` or specific dark token |
| `ProjectSharing.test.tsx` | `bg-white` → `bg-surface-primary` |
| `TaskItem.test.tsx` | `text-gray-400` → `text-content-tertiary`, `hover:bg-gray-50` → `hover:bg-surface-tertiary` |

**Note:** Tests should verify semantic behavior, not specific class names. Consider refactoring tests to check computed styles or data-testid attributes instead.

---

### Phase 2: Theme Infrastructure (Priority: High)

#### Task NS-5: Create ThemeProvider Component (T6.1.4)
**Description:** Create a React context provider that initializes theme on app mount, syncs with system preferences, and provides theme utilities to components.

**Requirements:**
- Wrap app in `main.tsx` or `App.tsx`
- Call `useThemeStore().initialize()` on mount
- Apply theme class to document root
- Listen for system preference changes
- Provide `useTheme()` hook for components

**File:** `src/components/ThemeProvider.tsx`

---

#### Task NS-6: Prevent Theme Flash on Load (T6.1.6)
**Description:** Add inline script in `index.html` to set theme class before React hydrates, preventing flash of wrong theme.

**Implementation:**
```html
<script>
  (function() {
    const stored = localStorage.getItem('todone-theme');
    const theme = stored ? JSON.parse(stored) : null;
    const mode = theme?.state?.mode || 'system';
    const isDark = mode === 'dark' || 
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  })();
</script>
```

---

#### Task NS-7: Add Theme Transition Animation (T6.1.5)
**Description:** Currently `src/index.css` has `* { @apply transition-colors duration-150; }` but this may cause performance issues. Optimize to only transition specific properties on theme-related elements.

**Considerations:**
- Use CSS custom property for transition duration
- Consider `prefers-reduced-motion` for accessibility
- Only apply to color/background properties, not all properties

---

### Phase 3: Theme Switcher UI (Priority: High)

#### Task NS-8: Create ThemeSwitcher Component (T6.3.1)
**Description:** Build a reusable theme toggle component with three modes: System, Light, Dark.

**Variants:**
- `icon` - Simple icon button that cycles through modes
- `dropdown` - Dropdown menu with all options
- `segmented` - Segmented control showing all three options

**File:** `src/components/ThemeSwitcher.tsx`

**Props:**
```tsx
interface ThemeSwitcherProps {
  variant?: 'icon' | 'dropdown' | 'segmented'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}
```

---

#### Task NS-9: Integrate Theme Switcher in Header (T6.3.2)
**Description:** Add ThemeSwitcher to the main app header/navbar, positioned near user profile or settings.

**Files to modify:**
- `src/components/Sidebar.tsx` or equivalent header component
- Position: Near top-right, before user avatar

---

#### Task NS-10: Add Theme Switcher to Mobile Nav (T6.3.3)
**Description:** Add theme toggle to mobile navigation drawer/bottom sheet.

**Files to modify:**
- `src/components/MobileNav.tsx`
- `src/components/MobileNavigation.tsx`
- `src/components/BottomSheet.tsx` (if used for settings)

---

### Phase 4: Validation & Testing (Priority: Medium)

#### Task NS-11: Run Full Test Suite
**Description:** After completing migration, run all tests and fix any remaining failures.

**Commands:**
```bash
npm run type-check
npm run lint
npm run test
npm run build
```

**Acceptance criteria:** All tests pass, no lint errors, build succeeds.

---

#### Task NS-12: Visual Audit in Storybook
**Description:** Review all components in Storybook in both light and dark modes.

**Commands:**
```bash
npm run storybook
```

**Checklist:**
- [ ] All text is readable in both modes
- [ ] Borders are visible in both modes
- [ ] Interactive states (hover, focus, active) work correctly
- [ ] No color clashing or poor contrast

---

#### Task NS-13: Add E2E Theme Tests (T6.8.3)
**Description:** Create Playwright tests for theme switching functionality.

**Test cases:**
- Theme persists after page reload
- System preference is respected
- Manual toggle overrides system preference
- Theme applies to all components correctly

**File:** `e2e/theme.spec.ts`

---

### Phase 5: Documentation (Priority: Low)

#### Task NS-14: Document Theming Architecture (T6.9.1)
**Description:** Add theming section to DOCS.md explaining the token system, how to use semantic classes, and how to add new themes.

**Topics to cover:**
- Token naming conventions
- How CSS variables work with Tailwind
- Adding new color themes
- Testing theme changes

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | T6.1.2: Migrated ~93 component files to semantic tokens; ~68 files remaining; 6 tests need updates | Amp |
| 2026-01-15 | T6.1.2 in progress: Migrated core UI components (Card, Button, Input, Dropdown, Tooltip) to semantic tokens, updated related tests | Amp |
| 2026-01-15 | Completed T6.1.1 & T6.1.3: Created `src/styles/tokens.css` with full semantic token system, updated Tailwind config to use CSS variables | Amp |
| 2026-01-15 | Initial document creation | Amp |
