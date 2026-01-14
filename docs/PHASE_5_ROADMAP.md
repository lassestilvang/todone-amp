# Phase 5 Roadmap - Feature & Codebase Improvements

**Created**: January 11, 2026  
**Status**: 🚧 In Progress  
**Predecessor**: Phase 4 (95% Complete, Production Ready)

---

## Executive Summary

This document outlines the next phase of Todone development, focusing on high-impact user features and codebase improvements that build on the solid Phase 4 foundation (1,267 tests, 0 TypeScript errors, 170+ components).

### Priority Tiers

| Tier | Timeline | Focus |
|------|----------|-------|
| **P0** | Weeks 1-2 | Quick wins, immediate value |
| **P1** | Weeks 3-6 | Core productivity features |
| **P2** | Weeks 7-10 | Advanced features |
| **P3** | Ongoing | Maintenance & polish |

---

## 🚀 Part 1: New User Features

### 1.1 Focus Mode / Pomodoro Timer

**Priority**: P0 | **Effort**: 3-5 days | **Impact**: High

#### Description
Built-in Pomodoro timer with task association, break reminders, focus statistics, and ambient sounds.

#### Technical Specification

**New Files:**
```
src/components/
├── FocusMode/
│   ├── FocusModeWidget.tsx       # Floating timer widget
│   ├── FocusModeFullscreen.tsx   # Immersive focus view
│   ├── PomodoroTimer.tsx         # Core timer component
│   ├── BreakReminder.tsx         # Break notification overlay
│   ├── FocusSessionHistory.tsx   # Past sessions list
│   └── FocusSettings.tsx         # Timer duration settings

src/store/
├── focusStore.ts                 # Timer state, sessions, settings

src/hooks/
├── useFocusTimer.ts              # Timer logic hook
├── useWakeLock.ts                # Prevent screen sleep during focus

src/utils/
├── focusStats.ts                 # Session statistics calculations
```

**Database Schema Addition:**
```typescript
// src/db/database.ts
interface FocusSession {
  id: string
  taskId: string | null
  startTime: Date
  endTime: Date | null
  duration: number          // seconds
  type: 'focus' | 'short-break' | 'long-break'
  completed: boolean
  interruptions: number
}

interface FocusSettings {
  userId: string
  focusDuration: number     // default: 25 min
  shortBreakDuration: number // default: 5 min
  longBreakDuration: number  // default: 15 min
  sessionsUntilLongBreak: number // default: 4
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
  soundType: 'bell' | 'chime' | 'none'
}
```

**Store Design:**
```typescript
// src/store/focusStore.ts
interface FocusState {
  isActive: boolean
  isPaused: boolean
  currentSession: FocusSession | null
  linkedTaskId: string | null
  timeRemaining: number
  sessionCount: number
  settings: FocusSettings
  
  // Actions
  startFocus: (taskId?: string) => void
  pauseFocus: () => void
  resumeFocus: () => void
  stopFocus: () => void
  skipToBreak: () => void
  recordInterruption: () => void
  updateSettings: (settings: Partial<FocusSettings>) => void
}
```

**UI Integration Points:**
- Floating widget in bottom-right corner (collapsible)
- Task context menu: "Start Focus Session"
- Keyboard shortcut: `Cmd+Shift+F`
- Stats integration with gamification system (karma for completed sessions)

**Dependencies:**
- None (uses existing patterns)

**Test Coverage:**
- Timer accuracy tests
- State persistence tests
- Break transition tests
- Interruption tracking tests

---

### 1.2 Natural Language AI Input ✅ COMPLETED

**Priority**: P1 | **Effort**: 5-7 days | **Impact**: High | **Status**: ✅ Completed January 12, 2026

#### Description
Enhanced quick-add that uses AI to parse complex natural language into fully structured tasks.

#### Implementation Summary

**Files Created:**
```
src/components/
├── AITaskParser.tsx              # Visual display of parsed task fields

src/utils/nlp/
├── index.ts                      # Module exports
├── taskParser.ts                 # Main parsing logic combining date & entity extraction
├── dateExtractor.ts              # Date/time NLP extraction (relative dates, times, explicit dates)
├── entityExtractor.ts            # Project, label, priority, duration, recurrence extraction
├── dateExtractor.test.ts         # 33 tests for date parsing
├── entityExtractor.test.ts       # 36 tests for entity extraction
├── taskParser.test.ts            # 23 tests for full parsing pipeline

src/components/
├── QuickAddModal.tsx             # Enhanced with AI parsing toggle and visual preview
```

**Features Implemented:**
- **Date Parsing**: today, tomorrow, next week, day names (Monday-Sunday), "in X days/weeks/months", explicit dates (Jan 15, 1/20)
- **Time Parsing**: at 3pm, at 14:00, noon, midnight, morning, afternoon, evening
- **Priority Detection**: p1-p4, !, !!, !!!, urgent, critical, high, low, etc.
- **Project Matching**: #hashtag syntax with fuzzy matching
- **Label Extraction**: @mention syntax
- **Duration Parsing**: 30 minutes, 2 hours, quick, half hour
- **Recurrence Detection**: daily, weekly, biweekly, monthly, yearly, every day/week/month
- **Location Extraction**: Basic heuristic detection
- **Confidence Score**: 0-1 confidence based on successfully parsed fields

**UI Enhancements:**
- AI toggle button in QuickAddModal header
- Visual pill display of parsed fields with icons
- Color-coded priority indicators
- Dark mode support
- Real-time parsing preview as user types

**Test Coverage:**
- 92 unit tests across all NLP modules
- Date/time parsing edge cases
- Entity extraction with various input formats
- Full parsing pipeline integration tests

**Privacy:**
- All parsing is local (rule-based, no API calls)
- No task data sent externally
- Future LLM integration would be opt-in

---

### 1.3 Daily Review Flow ✅ COMPLETED

**Priority**: P1 | **Effort**: 4-5 days | **Impact**: Medium-High | **Status**: ✅ Completed January 13, 2026

#### Description
Guided morning planning and evening reflection workflows to help users stay organized.

#### Implementation Summary

**Files Created:**
```
src/store/
├── dailyReviewStore.ts           # Zustand store for review state
├── dailyReviewStore.test.ts      # 21 unit tests

src/components/DailyReview/
├── index.ts                      # Exports all components
├── DailyReviewModal.tsx          # Main modal with step navigation
├── ReviewStep.tsx                # Reusable step wrapper
├── OverdueTasksReview.tsx        # Overdue tasks with reschedule options
├── TodayTasksPreview.tsx         # Today's tasks with priority colors
├── DailyIntention.tsx            # Set daily intention input
├── CompletedTasksCelebration.tsx # Celebration with karma stats
├── IncompleteTasksReview.tsx     # Incomplete tasks reschedule
├── TomorrowPreview.tsx           # Tomorrow's tasks preview
├── ReflectionInput.tsx           # Evening reflection textarea
├── ReviewSummary.tsx             # Final summary screen
├── DailyReviewSettings.tsx       # Settings for review preferences
```

**Database Schema Added:**
```typescript
interface DailyReview {
  id: string
  userId: string
  date: Date
  type: 'morning' | 'evening'
  intention?: string
  reflection?: string
  overdueTasks: string[]
  rescheduledTasks: string[]
  completedTaskCount: number
  completedAt?: Date
  createdAt: Date
}

interface DailyReviewSettings {
  userId: string
  morningReviewEnabled: boolean
  morningReviewTime: string
  eveningReviewEnabled: boolean
  eveningReviewTime: string
  autoPrompt: boolean
  lastMorningReview?: Date
  lastEveningReview?: Date
}
```

**Flow Steps:**
- **Morning**: ReviewOverdue → TodayPreview → SetIntention → ReviewComplete
- **Evening**: CelebrateCompleted → RescheduleIncomplete → TomorrowPreview → AddReflection → EveningComplete

**Features:**
- Keyboard navigation (Arrow Left/Right, Escape to close)
- Keyboard shortcut: `Cmd+Shift+R` to open (morning before noon, evening after)
- Progress indicator showing current step
- Reschedule overdue tasks to today/tomorrow/next week
- Set daily intention and evening reflection
- Celebration animation with karma earned
- Dark mode support
- 21 unit tests

#### Technical Specification (Original)

**New Files:**
```
src/components/
├── DailyReview/
│   ├── MorningPlanningFlow.tsx   # Step-by-step morning routine
│   ├── EveningReflectionFlow.tsx # End-of-day review
│   ├── ReviewStep.tsx            # Individual step component
│   ├── TaskReschedule.tsx        # Quick reschedule interface
│   ├── DailyIntention.tsx        # Set daily focus/intention
│   └── ReviewSummary.tsx         # Review completion summary

src/store/
├── dailyReviewStore.ts           # Review state and history
```

**Morning Planning Flow:**
```typescript
const morningSteps = [
  { id: 'overdue', title: 'Review Overdue', component: OverdueTasksReview },
  { id: 'today', title: "Today's Tasks", component: TodayTasksPreview },
  { id: 'intention', title: 'Set Intention', component: DailyIntention },
  { id: 'timeblock', title: 'Time Block', component: QuickTimeBlock },
  { id: 'ready', title: 'Ready to Go!', component: ReviewComplete },
]
```

**Evening Reflection Flow:**
```typescript
const eveningSteps = [
  { id: 'completed', title: 'Celebrate Wins', component: CompletedTasksCelebration },
  { id: 'incomplete', title: 'Reschedule', component: IncompleteTasksReview },
  { id: 'tomorrow', title: 'Plan Tomorrow', component: TomorrowPreview },
  { id: 'reflection', title: 'Daily Note', component: ReflectionInput },
  { id: 'done', title: 'Great Work!', component: EveningComplete },
]
```

**Trigger Options:**
- Automatic prompt based on time of day
- Manual trigger from sidebar/menu
- Keyboard shortcut: `Cmd+Shift+R`
- Configurable reminder notifications

---

### 1.4 Habit Tracker ✅ COMPLETED

**Priority**: P1 | **Effort**: 5-7 days | **Impact**: Medium-High | **Status**: ✅ Completed January 13, 2026

#### Description
Dedicated habit tracking separate from tasks, with visual streaks and completion grids.

#### Implementation Summary

**Files Created:**
```
src/store/
├── habitStore.ts                 # Zustand store for habit state
├── habitStore.test.ts            # 28 unit tests

src/components/Habits/
├── index.ts                      # Module exports
├── HabitList.tsx                 # Main habits view with filter tabs
├── HabitItem.tsx                 # Single habit row with streak indicator
├── HabitForm.tsx                 # Create/edit modal with emoji & color pickers
├── HabitStreakCalendar.tsx       # GitHub-style 12-week contribution grid
├── HabitStats.tsx                # Completion statistics (7/30/90 days)
├── HabitReminder.tsx             # Reminder time configuration

src/views/
├── HabitsView.tsx                # Full habits page with detail panel
```

**Database Schema Added:**
```typescript
interface Habit {
  id: string
  userId: string
  name: string
  description?: string
  icon: string              // Emoji
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  customDays?: number[]     // 0-6 for custom frequency
  targetCount: number       // Times per period (default: 1)
  reminderTime?: string
  createdAt: Date
  archivedAt?: Date
}

interface HabitCompletion {
  id: string
  habitId: string
  date: string              // YYYY-MM-DD
  count: number             // For habits with targetCount > 1
  note?: string
  completedAt: Date
}
```

**Features Implemented:**
- GitHub-style streak calendar (12 weeks / 84 days)
- Current and best streak tracking
- Completion rates for 7, 30, 90 days
- Daily, weekly, and custom day frequencies
- Target count support (multiple completions per day)
- Emoji icon picker with 20+ productivity-focused emojis
- Color picker with 12 preset colors
- Archive/unarchive habits
- Reminder time configuration
- Dark mode support

**Gamification Integration:**
- 10 karma per habit completion
- Streak bonus: +5 karma per streak day (max +50)

**Test Coverage:**
- 28 unit tests for habitStore
- Streak calculation tests
- Completion rate tests
- isHabitDueToday for all frequency types

---

### 1.5 Task Dependencies

**Priority**: P2 | **Effort**: 7-10 days | **Impact**: Medium

#### Description
"Blocked by" relationships between tasks with visual dependency graphs.

#### Technical Specification

**Database Schema Addition:**
```typescript
interface TaskDependency {
  id: string
  taskId: string            // The dependent task
  blockedByTaskId: string   // The blocking task
  type: 'blocks' | 'required-for'
  createdAt: Date
}

// Extend Task interface
interface Task {
  // ... existing fields
  blockedByIds?: string[]
  blocksIds?: string[]
  isBlocked?: boolean       // Computed: has incomplete blockers
}
```

**New Components:**
```
src/components/
├── Dependencies/
│   ├── DependencySelector.tsx    # Add/remove dependencies
│   ├── DependencyGraph.tsx       # Visual graph (react-flow or similar)
│   ├── BlockedIndicator.tsx      # Visual badge for blocked tasks
│   ├── DependencyChain.tsx       # Linear dependency view
│   └── CriticalPath.tsx          # Highlight critical path

src/utils/
├── dependencyGraph.ts            # Graph algorithms (topological sort, cycles)
```

**Behavior Rules:**
- Blocked tasks appear muted/greyed
- Cannot complete a task while blockers exist (with override option)
- Completing a blocker shows notification about unblocked tasks
- Circular dependency detection and prevention
- Cascading due date suggestions

**Visualization:**
- Inline "Blocked by X" badge on task items
- Dependency graph view (optional, using react-flow)
- Critical path highlighting for project planning

---

### 1.6 Eisenhower Matrix View

**Priority**: P0 | **Effort**: 2-3 days | **Impact**: Medium

#### Description
4-quadrant urgent/important visualization using existing priority data.

#### Technical Specification

**New Files:**
```
src/views/
├── EisenhowerView.tsx            # Main matrix view

src/components/
├── Eisenhower/
│   ├── EisenhowerMatrix.tsx      # 4-quadrant grid layout
│   ├── MatrixQuadrant.tsx        # Single quadrant container
│   ├── MatrixTaskCard.tsx        # Compact task card for matrix
│   └── MatrixLegend.tsx          # Quadrant labels/descriptions
```

**Quadrant Mapping:**
```typescript
type Quadrant = 'do-first' | 'schedule' | 'delegate' | 'eliminate'

const getQuadrant = (task: Task): Quadrant => {
  const isUrgent = task.priority <= 2 || isOverdue(task) || isDueToday(task)
  const isImportant = task.priority <= 2 || task.labels?.includes('important')
  
  if (isUrgent && isImportant) return 'do-first'      // Q1: Do
  if (!isUrgent && isImportant) return 'schedule'     // Q2: Schedule
  if (isUrgent && !isImportant) return 'delegate'     // Q3: Delegate
  return 'eliminate'                                   // Q4: Delete/Defer
}
```

**Features:**
- Drag-and-drop between quadrants (updates priority/labels)
- Color-coded quadrants
- Task count per quadrant
- Filter by project/label
- Quick actions per quadrant

---

### 1.7 Weekly Review Dashboard ✅ COMPLETED

**Priority**: P1 | **Effort**: 3-4 days | **Impact**: Medium | **Status**: ✅ Completed January 13, 2026

#### Description
Weekly summary view showing accomplishments, slipped tasks, and productivity trends.

#### Technical Specification

**New Files:**
```
src/views/
├── WeeklyReviewView.tsx          # Full weekly review page

src/components/
├── WeeklyReview/
│   ├── WeekSummaryHeader.tsx     # Week dates, overall stats
│   ├── CompletedThisWeek.tsx     # Celebration of completed tasks
│   ├── SlippedTasks.tsx          # Overdue/rescheduled tasks
│   ├── WeeklyTrends.tsx          # Charts comparing to previous weeks
│   ├── TopProjects.tsx           # Most active projects
│   ├── KarmaWeekly.tsx           # Karma earned this week
│   └── NextWeekPreview.tsx       # Upcoming tasks preview
```

**Metrics Displayed:**
```typescript
interface WeeklyMetrics {
  tasksCompleted: number
  tasksCreated: number
  completionRate: number        // completed / (completed + overdue)
  averageCompletionTime: number // hours from creation to completion
  busiestDay: string
  topProject: { name: string; tasksCompleted: number }
  karmaEarned: number
  streakStatus: { current: number; best: number }
  comparedToLastWeek: {
    tasksCompleted: number      // +/- difference
    completionRate: number
  }
}
```

---

### 1.8 Workspaces

**Priority**: P2 | **Effort**: 7-10 days | **Impact**: Medium

#### Description
Separate contexts (Work/Personal/Side Project) with quick switching and isolated data views.

#### Technical Specification

**Database Schema:**
```typescript
interface Workspace {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  createdAt: Date
}

// Extend existing entities
interface Project {
  // ... existing
  workspaceId: string
}

interface Task {
  // ... existing
  workspaceId: string       // Inherited from project or explicit
}
```

**New Components:**
```
src/components/
├── Workspace/
│   ├── WorkspaceSwitcher.tsx     # Dropdown/modal to switch
│   ├── WorkspaceSettings.tsx     # Manage workspaces
│   ├── WorkspaceBadge.tsx        # Visual indicator
│   └── WorkspaceOnboarding.tsx   # First-time setup

src/store/
├── workspaceStore.ts             # Active workspace, switching
```

**Behavior:**
- All views filtered by active workspace
- Quick switch via keyboard: `Cmd+1`, `Cmd+2`, etc.
- Cross-workspace search option
- Separate gamification stats per workspace (optional)

---

### 1.9 Dark Mode & Themes

**Priority**: P0 | **Effort**: 2-3 days | **Impact**: Medium

#### Description
Multiple color schemes including dark mode variants.

#### Technical Specification

**Theme Definitions:**
```typescript
// src/utils/themes.ts
const themes = {
  light: { /* current colors */ },
  dark: { /* dark variant */ },
  nord: { /* Nord color scheme */ },
  dracula: { /* Dracula theme */ },
  solarizedLight: { /* Solarized Light */ },
  solarizedDark: { /* Solarized Dark */ },
}
```

**Implementation:**
```
src/store/
├── themeStore.ts                 # Theme preference, system detection

src/hooks/
├── useTheme.ts                   # Theme application hook

src/styles/
├── themes/
│   ├── light.css
│   ├── dark.css
│   ├── nord.css
│   └── dracula.css
```

**Features:**
- System preference detection (`prefers-color-scheme`)
- Manual override
- Per-workspace theme option
- Smooth transitions between themes
- Tailwind dark mode classes

---

### 1.10 Smart Scheduling

**Priority**: P2 | **Effort**: 10-14 days | **Impact**: High

#### Description
AI-powered scheduling suggestions based on workload, patterns, and task properties.

#### Technical Specification

**Algorithm Inputs:**
```typescript
interface SchedulingContext {
  task: Task
  existingSchedule: TimeBlock[]
  historicalPatterns: {
    preferredWorkHours: { start: number; end: number }
    averageTaskDuration: Record<string, number> // by label/project
    completionTimeByPriority: Record<number, number>
    busiestDays: number[]     // 0-6
  }
  userPreferences: {
    maxTasksPerDay: number
    focusTimePreference: 'morning' | 'afternoon' | 'evening'
    bufferBetweenTasks: number
  }
}

interface ScheduleSuggestion {
  taskId: string
  suggestedDate: Date
  suggestedTime?: string
  confidence: number
  reason: string            // "You usually do deep work in the morning"
  alternatives: Date[]
}
```

**Components:**
```
src/components/
├── SmartScheduling/
│   ├── ScheduleSuggestion.tsx    # Suggestion card
│   ├── AutoScheduleModal.tsx     # Batch scheduling
│   ├── WorkloadPreview.tsx       # Calendar overlay showing load
│   └── SchedulingPreferences.tsx # User preferences

src/utils/
├── scheduling/
│   ├── workloadAnalyzer.ts       # Analyze current schedule
│   ├── patternDetector.ts        # Historical patterns
│   ├── suggestionEngine.ts       # Generate suggestions
│   └── conflictResolver.ts       # Handle overlaps
```

---

## 🛠️ Part 2: Codebase Improvements

### 2.1 Store Consolidation ✅ COMPLETED

**Priority**: P1 | **Effort**: 5-7 days | **Impact**: High (DX) | **Status**: ✅ Completed January 14, 2026

#### Problem
40+ individual stores create cognitive overhead and potential circular dependency issues.

#### Solution
Group related stores into domain slices while maintaining Zustand's simplicity.

**Proposed Structure:**
```
src/store/
├── index.ts                      # Re-exports all stores
├── domains/
│   ├── tasks/
│   │   ├── taskStore.ts
│   │   ├── recurrenceStore.ts
│   │   ├── taskDetailStore.ts
│   │   └── index.ts              # Combined task domain
│   ├── organization/
│   │   ├── projectStore.ts
│   │   ├── sectionStore.ts
│   │   ├── labelStore.ts
│   │   ├── filterStore.ts
│   │   └── index.ts
│   ├── collaboration/
│   │   ├── teamStore.ts
│   │   ├── teamMemberStore.ts
│   │   ├── shareStore.ts
│   │   ├── commentStore.ts
│   │   └── index.ts
│   ├── productivity/
│   │   ├── gamificationStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── dashboardStore.ts
│   │   └── index.ts
│   └── app/
│       ├── authStore.ts
│       ├── viewStore.ts
│       ├── keyboardStore.ts
│       ├── notificationStore.ts
│       └── index.ts
```

**Migration Strategy:**
1. Create domain folders without breaking existing imports
2. Add barrel exports (`index.ts`)
3. Update imports gradually (can be done incrementally)
4. Add ESLint rule to enforce new import paths

---

### 2.2 Component Library / Design System ✅ COMPLETED

**Priority**: P1 | **Effort**: 7-10 days | **Impact**: High (DX) | **Status**: ✅ Completed January 14, 2026

#### Description
Extract UI primitives into a documented design system.

#### Implementation Summary

**Files Created:**
```
src/components/ui/
├── Button/
│   ├── Button.tsx              # Enhanced with dark mode support
│   ├── Button.test.tsx         # 17 tests
│   └── index.ts
├── Input/
│   ├── Input.tsx               # Enhanced with dark mode support
│   ├── Input.test.tsx          # 26 tests
│   └── index.ts
├── Modal/
│   ├── Modal.tsx               # Portal-based with escape/overlay close
│   ├── Modal.test.tsx          # 12 tests
│   └── index.ts
├── Badge/
│   ├── Badge.tsx               # 6 variants, 3 sizes
│   ├── Badge.test.tsx          # 12 tests
│   └── index.ts
├── Card/
│   ├── Card.tsx                # Card, CardHeader, CardTitle, CardContent, CardFooter
│   ├── Card.test.tsx           # 30 tests
│   └── index.ts
├── Tooltip/
│   ├── Tooltip.tsx             # Portal-based with position options
│   ├── Tooltip.test.tsx        # 11 tests
│   └── index.ts
├── Avatar/
│   ├── Avatar.tsx              # Image with initials fallback
│   ├── Avatar.test.tsx         # 14 tests
│   └── index.ts
├── Skeleton/
│   ├── Skeleton.tsx            # Skeleton, SkeletonText, SkeletonAvatar
│   ├── Skeleton.test.tsx       # 26 tests
│   └── index.ts
├── Dropdown/
│   ├── Dropdown.tsx            # Context-based compound component
│   ├── Dropdown.test.tsx       # 8 tests
│   └── index.ts
└── index.ts                    # Barrel export for all components

src/styles/
└── tokens.ts                   # Design tokens (colors, spacing, radii, shadows, typography)
```

**Features:**
- 156 unit tests across all components
- Full dark mode support for all primitives
- Design tokens matching Tailwind config
- Compound components (Card, Dropdown) for flexible composition
- Backward compatibility via re-exports from original locations
- Barrel exports for clean imports: `import { Button, Card } from '@/components/ui'`

**Usage:**
```typescript
// Preferred: Import from the UI library
import { Button, Card, Modal, Badge } from '@/components/ui'

// Also works: Legacy imports (re-exported)
import { Button } from '@/components/Button'
```

---

### 2.3 E2E Testing with Playwright

**Priority**: P0 | **Effort**: 5-7 days | **Impact**: High

#### Description
Add end-to-end tests for critical user flows.

**Setup:**
```
e2e/
├── playwright.config.ts
├── fixtures/
│   ├── auth.fixture.ts           # Authenticated user setup
│   └── tasks.fixture.ts          # Pre-populated tasks
├── tests/
│   ├── auth.spec.ts              # Login/signup flows
│   ├── task-crud.spec.ts         # Create, edit, delete, complete
│   ├── quick-add.spec.ts         # Quick add modal
│   ├── drag-drop.spec.ts         # Reordering tasks
│   ├── views.spec.ts             # Navigate between views
│   ├── keyboard.spec.ts          # Keyboard shortcuts
│   └── mobile.spec.ts            # Mobile-specific flows
└── utils/
    └── helpers.ts
```

**Critical Flows to Test:**
1. New user signup → create first task → complete it
2. Quick add with natural language parsing
3. Drag-and-drop reordering
4. Project/section creation
5. Filter and search
6. Recurring task creation and completion
7. Mobile navigation

**CI Integration:**
```yaml
# .github/workflows/e2e.yml
- name: Run E2E Tests
  run: npx playwright test
  env:
    BASE_URL: http://localhost:5173
```

---

### 2.4 Storybook Documentation

**Priority**: P1 | **Effort**: 3-5 days | **Impact**: Medium (DX)

#### Description
Visual documentation of all components.

**Setup:**
```bash
npx storybook@latest init --type react_vite
```

**Structure:**
```
.storybook/
├── main.ts
├── preview.ts
└── theme.ts                      # Custom Storybook theme

src/components/
├── Button/
│   └── Button.stories.tsx
├── TaskItem/
│   └── TaskItem.stories.tsx
# ... etc
```

**Story Categories:**
- **Primitives**: Button, Input, Badge, etc.
- **Task Components**: TaskItem, TaskList, TaskDetailPanel
- **Views**: Inbox, Today, Calendar (with mock data)
- **Modals**: QuickAdd, CreateProject, etc.

---

### 2.5 Error Boundaries

**Priority**: P1 | **Effort**: 2-3 days | **Impact**: Medium

#### Description
Add granular error boundaries to prevent full app crashes.

**Implementation:**
```
src/components/
├── ErrorBoundary/
│   ├── ErrorBoundary.tsx         # Generic error boundary
│   ├── ViewErrorBoundary.tsx     # Per-view error handling
│   ├── ErrorFallback.tsx         # Error UI component
│   └── useErrorHandler.ts        # Hook for async errors
```

**Placement Strategy:**
```tsx
// App.tsx
<ErrorBoundary fallback={<AppErrorFallback />}>
  <Sidebar />
  <main>
    <ViewErrorBoundary>
      <CurrentView />
    </ViewErrorBoundary>
  </main>
  <ErrorBoundary fallback={null}>
    <TaskDetailPanel />
  </ErrorBoundary>
</ErrorBoundary>
```

---

### 2.6 Performance Monitoring

**Priority**: P2 | **Effort**: 2-3 days | **Impact**: Medium

#### Description
Track Core Web Vitals and custom metrics.

**Implementation:**
```typescript
// src/utils/performance.ts
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals'

export const initPerformanceMonitoring = () => {
  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

// Custom metrics
export const measureTaskRender = () => {
  performance.mark('task-render-start')
  // ... after render
  performance.measure('task-render', 'task-render-start')
}
```

**Dashboard:**
- Local performance dashboard in dev mode
- Optional integration with analytics service
- Bundle size tracking in CI

---

### 2.7 Console Log Cleanup

**Priority**: P0 | **Effort**: 1 day | **Impact**: Low

#### Description
Remove console statements and add lint rule.

**ESLint Rule:**
```javascript
// .eslintrc.cjs
rules: {
  'no-console': ['error', { allow: ['warn', 'error'] }],
}
```

**Migration:**
1. Run `grep -r "console.log" src/` to find all instances
2. Replace with proper logging utility or remove
3. Add lint rule
4. Create `src/utils/logger.ts` for structured logging

---

### 2.8 Repository Pattern for Future Backend

**Priority**: P2 | **Effort**: 5-7 days | **Impact**: Medium

#### Description
Abstract data access to prepare for future backend integration.

**Structure:**
```
src/repositories/
├── interfaces/
│   ├── ITaskRepository.ts
│   ├── IProjectRepository.ts
│   └── IUserRepository.ts
├── dexie/                        # Current IndexedDB implementation
│   ├── DexieTaskRepository.ts
│   ├── DexieProjectRepository.ts
│   └── DexieUserRepository.ts
├── api/                          # Future API implementation
│   ├── ApiTaskRepository.ts
│   └── ...
└── index.ts                      # Factory to get correct implementation
```

**Interface Example:**
```typescript
interface ITaskRepository {
  findById(id: string): Promise<Task | null>
  findAll(filter?: TaskFilter): Promise<Task[]>
  create(task: CreateTaskInput): Promise<Task>
  update(id: string, updates: Partial<Task>): Promise<Task>
  delete(id: string): Promise<void>
  bulkUpdate(ids: string[], updates: Partial<Task>): Promise<void>
}
```

---

### 2.9 Bundle Size CI Check

**Priority**: P1 | **Effort**: 1-2 days | **Impact**: Medium

#### Description
Track bundle size changes per PR.

**Implementation:**
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size

on: [pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: preactjs/compressed-size-action@v2
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          pattern: "./dist/**/*.{js,css}"
```

---

## 📅 Implementation Timeline

### Weeks 1-2: Quick Wins (P0)
- [x] Pomodoro Timer / Focus Mode ✅ (Completed January 11, 2026)
- [x] Eisenhower Matrix View ✅ (Completed January 12, 2026)
- [x] Dark Mode & Themes ✅ (Completed January 12, 2026)
- [x] E2E Testing Setup ✅ (Completed January 12, 2026)
- [x] Console Log Cleanup ✅ (Completed January 12, 2026)

### Weeks 3-6: Core Features (P1)
- [x] Natural Language AI Input ✅ (Completed January 12, 2026)
- [x] Daily Review Flow ✅ (Completed January 13, 2026)
- [x] Habit Tracker ✅ (Completed January 13, 2026)
- [x] Weekly Review Dashboard ✅ (Completed January 13, 2026)
- [x] Store Consolidation ✅ (Completed January 14, 2026)
- [x] Component Library ✅ (Completed January 14, 2026)
- [ ] Storybook
- [ ] Error Boundaries
- [ ] Bundle Size CI

### Weeks 7-10: Advanced Features (P2)
- [ ] Task Dependencies
- [ ] Workspaces
- [ ] Smart Scheduling
- [ ] Performance Monitoring
- [ ] Repository Pattern

### Ongoing (P3)
- Polish and bug fixes
- Performance optimization
- Accessibility improvements
- Documentation updates

---

## 📊 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test Coverage | ~85% | 90%+ |
| E2E Test Coverage | 0% | Critical paths covered |
| Bundle Size (main) | 226 kB | <250 kB |
| Lighthouse Performance | TBD | 90+ |
| TypeScript Errors | 0 | 0 |
| ESLint Warnings | 0 | 0 |

---

## 🔗 Related Documents

- [Phase 4 Final Status](./PHASE_4_FINAL_STATUS.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

**Created**: January 11, 2026  
**Author**: Amp AI Assistant  
**Status**: Ready for Review
