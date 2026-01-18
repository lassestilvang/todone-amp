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
| T6.1.2 | Migrate hardcoded Tailwind colors to CSS variables | High | ✅ |
| T6.1.3 | Define semantic color tokens (e.g., `--color-surface`, `--color-on-surface`) | High | ✅ |
| T6.1.4 | Create `ThemeProvider` component to wrap app initialization | Medium | ✅ |
| T6.1.5 | Add smooth transition animation for theme changes (150-200ms) | Medium | ✅ |
| T6.1.6 | Prevent flash of wrong theme on initial load (SSR/hydration) | High | ✅ |

### 2. 🌓 Dark/Light Mode Implementation

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.2.1 | Audit all components for missing `dark:` variants | High | ✅ |
| T6.2.2 | Fix Sidebar component dark mode styles | High | ✅ |
| T6.2.3 | Fix TaskCard component dark mode styles | High | ✅ |
| T6.2.4 | Fix Modal/Dialog components dark mode styles | High | ✅ |
| T6.2.5 | Fix Form inputs/buttons dark mode styles | High | ✅ |
| T6.2.6 | Fix DropdownMenu components dark mode styles | Medium | ✅ |
| T6.2.7 | Fix DatePicker/Calendar dark mode styles | Medium | ✅ |
| T6.2.8 | Fix Toast/Notification dark mode styles | Medium | ✅ |
| T6.2.9 | Fix EmptyState illustrations dark mode | Low | ✅ |
| T6.2.10 | Ensure all icons have appropriate color in both modes | Medium | ✅ |

### 3. 🎯 Theme Switcher UI

| ID | Task | Priority | Status |
|----|------|----------|--------|
| T6.3.1 | Create `ThemeSwitcher` component with system/light/dark options | High | ✅ |
| T6.3.2 | Add theme toggle to app header/navbar | High | ✅ |
| T6.3.3 | Add theme toggle to mobile navigation | High | ✅ |
| T6.3.4 | Create animated sun/moon icon transition | Low | ✅ |
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

**Remaining Work (~47 files with ~264 hardcoded color usages):**

| Category | Files | Count |
|----------|-------|-------|
| DailyReview/ | DailyReviewSettings, IncompleteTasksReview, OverdueTasksReview, TodayTasksPreview, TomorrowPreview | 5 |
| Eisenhower/ | MatrixLegend, MatrixQuadrant, MatrixTaskCard | 3 |
| FocusMode/ | BreakReminder, FocusModeFullscreen, FocusModeWidget, FocusSessionHistory, FocusSettings, PomodoroTimer | 6 |
| Habits/ | HabitForm, HabitItem, HabitList, HabitReminder, HabitStats, HabitStreakCalendar | 6 |
| Other components | AITaskParser, AccessibilityAuditor, AdvancedFilterBuilder, BadgesDisplay, CalendarIntegration, CalendarView, EmailAssist, ExternalCalendarEvents, GroupedTaskList, InstallPrompt, IntegrationManager, KarmaWidget, Leaderboard, LevelProgressBar, MobileBoardView, MobileInboxView, MyContributionsView, NotificationCenter, ShareProjectModal, TeamActivityOnSharedProject, TeamMembersList, VirtualTaskList, WeeklyGoalProgress | 23 |
| WeeklyReview/ | KarmaWeekly (partial - has bg-white/20 overlays) | 1 |
| Pages/Views | AuthPage (partial), SettingsView (partial), WeeklyAgendaView (partial) | 3 |

**All tests now passing** - Previous test failures have been fixed.

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

#### ✅ Task NS-1: Migrate T-Z Components (COMPLETED)
Migrated: TaskListSkeleton, TimeBlockingView, TeamMemberProfile, TeamDashboard, TaskSuggestions, TemplateCard, TemplatePreview

#### ✅ Task NS-2: Migrate UI Component Library (COMPLETED)
Migrated: Modal, Badge, Skeleton, Avatar stories, Tooltip stories, Dropdown stories, Card stories + related tests

#### ✅ Task NS-3: Migrate Pages and Views (COMPLETED)
Migrated: AuthPage, WeeklyReviewView, InboxView, TodayView, HabitsView, SettingsView, EisenhowerView, WeeklyAgendaView, DailyAgendaView, UpcomingView

#### ✅ Task NS-4: Fix Failing Tests (COMPLETED)
Fixed: CalendarIntegration.test, FloatingActionButton.test, ProjectSharing.test, TaskAssignmentModal.test, TaskItem.test, TaskListSkeleton.test

---

#### Task NS-1b: Migrate DailyReview Components (NEW)
**Files to migrate (5):**
- `DailyReview/DailyReviewSettings.tsx`
- `DailyReview/IncompleteTasksReview.tsx`
- `DailyReview/OverdueTasksReview.tsx`
- `DailyReview/TodayTasksPreview.tsx`
- `DailyReview/TomorrowPreview.tsx`

---

#### Task NS-1c: Migrate Eisenhower Components (NEW)
**Files to migrate (3):**
- `Eisenhower/MatrixLegend.tsx`
- `Eisenhower/MatrixQuadrant.tsx`
- `Eisenhower/MatrixTaskCard.tsx`

---

#### Task NS-1d: Migrate FocusMode Components (NEW)
**Files to migrate (6):**
- `FocusMode/BreakReminder.tsx`
- `FocusMode/FocusModeFullscreen.tsx`
- `FocusMode/FocusModeWidget.tsx`
- `FocusMode/FocusSessionHistory.tsx`
- `FocusMode/FocusSettings.tsx`
- `FocusMode/PomodoroTimer.tsx`

---

#### Task NS-1e: Migrate Habits Components (NEW)
**Files to migrate (6):**
- `Habits/HabitForm.tsx`
- `Habits/HabitItem.tsx`
- `Habits/HabitList.tsx`
- `Habits/HabitReminder.tsx`
- `Habits/HabitStats.tsx`
- `Habits/HabitStreakCalendar.tsx`

---

#### Task NS-1f: Migrate Remaining Misc Components (NEW)
**Files to migrate (23):**
- `AITaskParser.tsx`, `AccessibilityAuditor.tsx`, `AdvancedFilterBuilder.tsx`
- `BadgesDisplay.tsx`, `CalendarIntegration.tsx`, `CalendarView.tsx`
- `EmailAssist.tsx`, `ExternalCalendarEvents.tsx`, `GroupedTaskList.tsx`
- `InstallPrompt.tsx`, `IntegrationManager.tsx`, `KarmaWidget.tsx`
- `Leaderboard.tsx`, `LevelProgressBar.tsx`, `MobileBoardView.tsx`
- `MobileInboxView.tsx`, `MyContributionsView.tsx`, `NotificationCenter.tsx`
- `ShareProjectModal.tsx`, `TeamActivityOnSharedProject.tsx`, `TeamMembersList.tsx`
- `VirtualTaskList.tsx`, `WeeklyGoalProgress.tsx`

---

### Phase 2: Theme Infrastructure (Priority: High)

#### ✅ Task NS-5: Create ThemeProvider Component (T6.1.4) - COMPLETED
**Description:** Created a React context provider that initializes theme on app mount, syncs with system preferences, and provides theme utilities to components.

**Implemented:**
- Created `src/contexts/ThemeContext.ts` with `ThemeContextValue` interface and context
- Created `src/components/ThemeProvider.tsx` that wraps app and manages theme classes
- Updated `src/hooks/useTheme.ts` to use the new context
- Wrapped App content in `ThemeProvider` in `src/App.tsx`
- Theme initialization, system preference listening, and DOM class management all working

---

#### ✅ Task NS-6: Prevent Theme Flash on Load (T6.1.6) - COMPLETED
**Description:** Added inline script in `index.html` to set theme class before React hydrates.

**Implemented:**
- Added synchronous inline script in `<head>` that runs before CSS loads
- Reads `todone-theme` from localStorage and parses stored state
- Respects system preference when mode is 'system'
- Adds 'dark' or 'light' class to `<html>` element immediately
- Wrapped in try/catch for robustness

---

#### ✅ Task NS-7: Add Theme Transition Animation (T6.1.5) - COMPLETED
**Description:** Optimized theme transitions for performance and accessibility.

**Implemented:**
- Replaced global `* { transition-colors }` with targeted `.theme-transition` class
- Added `--theme-transition-duration: 150ms` CSS variable
- Transitions only apply to: background-color, border-color, color, fill, stroke, box-shadow
- Added `prefers-reduced-motion` media query to disable transitions for accessibility
- Updated ThemeProvider to toggle transition class only during theme changes (not on initial load)
- Transition class is removed after animation completes to avoid affecting other animations

---

### Phase 3: Theme Switcher UI (Priority: High)

#### ✅ Task NS-8: Create ThemeSwitcher Component (T6.3.1) - COMPLETED
**Description:** Built a reusable theme toggle component with three modes: System, Light, Dark.

**Implemented:**
- Created `src/components/ThemeSwitcher.tsx` with three variants:
  - `icon` - Simple icon button that cycles through modes (light → dark → system)
  - `dropdown` - Dropdown menu with all options and check mark for selected
  - `segmented` - Segmented control showing all three options
- Supports `size` prop: `sm`, `md`, `lg`
- Supports `showLabel` prop to display text labels
- Full accessibility: ARIA roles (radiogroup, listbox, options), keyboard navigation
- Uses semantic color tokens (`bg-surface-*`, `text-content-*`, `bg-brand-*`)
- Created `ThemeSwitcher.test.tsx` with 22 passing tests
- Created `ThemeSwitcher.stories.tsx` with all variant/size combinations

---

#### ✅ Task NS-9: Integrate Theme Switcher in Header (T6.3.2) - COMPLETED
**Description:** Added ThemeSwitcher to the sidebar header, positioned near the collapse button.

**Implemented:**
- Added `ThemeSwitcher` import to `src/components/Sidebar.tsx`
- Integrated icon variant (size="sm") in header, next to tablet collapse button
- Stacks vertically when sidebar is collapsed on tablet
- Updated Sidebar tests to wrap with ThemeContext provider
- All 1680 tests pass

---

#### ✅ Task NS-10: Add Theme Switcher to Mobile Nav (T6.3.3) - COMPLETED
**Description:** Added theme toggle to both mobile navigation components.

**Implemented:**
- Added ThemeSwitcher to `src/components/MobileNav.tsx` header (next to hamburger menu)
- Added ThemeSwitcher to `src/components/MobileNavigation.tsx` header (next to menu toggle)
- Both use icon variant with size="sm" for compact mobile display
- All 1680 tests pass

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
| 2026-01-18 | T6.3.4: COMPLETED - Created AnimatedThemeIcon component with smooth sun/moon rotation and scale transitions (300ms duration). Sun rotates out clockwise while moon rotates in for dark mode, and vice versa. All 22 ThemeSwitcher tests pass. | Amp |
| 2026-01-18 | T6.3.3: COMPLETED - Added ThemeSwitcher to MobileNav.tsx and MobileNavigation.tsx headers. All 1680 tests pass. | Amp |
| 2026-01-18 | T6.3.2: COMPLETED - Added ThemeSwitcher to Sidebar header. Updated Sidebar.test.tsx to wrap with ThemeContext provider. All 1680 tests pass. | Amp |
| 2026-01-18 | T6.3.1: COMPLETED - Created ThemeSwitcher component with 3 variants (icon, dropdown, segmented), 3 sizes (sm, md, lg), optional labels, full accessibility support. Added 22 unit tests and Storybook stories. | Amp |
| 2026-01-17 | T6.2.10: COMPLETED - Ensured all icons have appropriate color in both modes. Created new icon color token system (`--color-icon-*`) in tokens.css with 11 semantic icon colors that auto-adjust for light/dark mode. Added Tailwind `text-icon-*` utilities. Migrated 50+ components including ActivityItem, AIAssistance, DailyReview (6 files), WeeklyReview (5 files), FocusMode (3 files), Habits (3 files), Eisenhower (2 files), and many more. Remaining 15 hardcoded colors are intentional (light text on gradient backgrounds). All 1658 tests pass. | Amp |
| 2026-01-17 | T6.2.9: COMPLETED - Fixed EmptyState illustrations dark mode. Added accent color tokens (purple, indigo, teal) to tokens.css and Tailwind config. Updated EmptyState base component with subtle background circle. Migrated DailyIntention and ReflectionInput to use semantic accent tokens. Fixed DroppableTaskList dark mode for drag-over state. All 1658 tests pass. | Amp |
| 2026-01-17 | T6.2.8: COMPLETED - Fixed Toast/Notification dark mode. Updated NotificationCenter (semantic tokens for icons, unread indicators, filter buttons, mark all read), NotificationPreferences (semantic tokens for notification type icons). All tests pass. | Amp |
| 2026-01-17 | T6.2.7: COMPLETED - Fixed DatePicker/Calendar dark mode. Updated RecurrenceCalendarView (semantic tokens for completed/upcoming/exception indicators and legend), MobileCalendarView (brand colors for selection, semantic tokens for today/priority), CalendarSelector (brand colors for checkboxes and action buttons), CalendarView (semantic-info-light for today indicator in month/week views). All 1658 tests pass. | Amp |
| 2026-01-17 | T6.2.6: COMPLETED - Fixed DropdownMenu components dark mode. Updated ContextMenu (semantic-error-light for danger hover), Dropdown.stories (semantic priority colors), PrioritySelector (ring-focus), AssigneeSelector (dark mode for selected items and clear all), ProjectSelector, SectionSelector, TeamSelector (dark mode for selected states). All 1658 tests pass. | Amp |
| 2026-01-17 | T6.2.5: COMPLETED - Fixed Form inputs/buttons dark mode. Updated TemplateForm, DatePickerInput, TimePickerInput, OAuthButton, RambleVoiceInput, CommentForm, FloatingActionButton, DataExportImport, CalendarView, SlackIntegration, EmailIntegration, OfflineIndicator, AtRiskTasks, ComparisonAnalytics, PersonalDashboard, EnhancedSearchBar, CalendarEventsList, ReportGenerator, SavedQueryManager, ContextMenu, TemplateGallery, TemplatePreview, KeyboardShortcutsSettings, TeamDashboard, TeamAnalytics, ConflictResolver, RecurrenceInstancesList. All 1658 tests pass. | Amp |
| 2026-01-17 | T6.2.4: COMPLETED - Fixed Modal dark mode. Updated QuickAddModal, MobileQuickAddModal, ShareProjectModal, AchievementDetailModal, TaskAssignmentModal to use semantic tokens. | Amp |
| 2026-01-17 | T6.2.3: COMPLETED - Fixed TaskCard dark mode. Updated TaskItem, MatrixTaskCard, SubTaskItem, SwipeableTaskItem to use semantic priority tokens and brand colors for selection states. | Amp |
| 2026-01-17 | T6.2.2: COMPLETED - Fixed Sidebar dark mode. Updated all active state styles from `bg-blue-100 text-blue-700` to `bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400`. | Amp |
| 2026-01-17 | T6.2.1: COMPLETED - Audited all components for missing dark: variants. Fixed AdvancedFilterBuilder, EmailAssist, AccessibilityAuditor, ExternalCalendarEvents. Remaining bg-white usages are intentional (toggle knobs, fullscreen overlays, contrast buttons). | Amp |
| 2026-01-17 | T6.1.6: COMPLETED - Prevented theme flash on load. Added inline script in `index.html` `<head>` to set dark/light class before CSS loads. | Amp |
| 2026-01-17 | T6.1.5: COMPLETED - Optimized theme transitions. Replaced global transition with targeted `.theme-transition` class, added CSS variable, transitions only on color properties, respects `prefers-reduced-motion`, updated ThemeProvider to toggle class only during changes. | Amp |
| 2026-01-16 | T6.1.4: COMPLETED - Created ThemeProvider component with context. Added `src/contexts/ThemeContext.ts`, `src/components/ThemeProvider.tsx`, updated `useTheme` hook to use context, wrapped App in ThemeProvider. All tests pass. | Amp |
| 2026-01-16 | T6.1.2: COMPLETED - Migrated remaining 47 files (DailyReview, Eisenhower, FocusMode, Habits, misc components). Only 20 intentional hardcoded colors remain (fullscreen dark theme, stories, p4 priority). All 1658 tests pass. | Amp |
| 2026-01-16 | T6.1.2: Partial completion - migrated T-Z components, UI library, pages/views, fixed tests; 47 files remaining (DailyReview, Eisenhower, FocusMode, Habits, misc) | Amp |
| 2026-01-16 | T6.1.2: Migrated ~93 component files to semantic tokens; ~68 files remaining; 6 tests need updates | Amp |
| 2026-01-15 | T6.1.2 in progress: Migrated core UI components (Card, Button, Input, Dropdown, Tooltip) to semantic tokens, updated related tests | Amp |
| 2026-01-15 | Completed T6.1.1 & T6.1.3: Created `src/styles/tokens.css` with full semantic token system, updated Tailwind config to use CSS variables | Amp |
| 2026-01-15 | Initial document creation | Amp |
