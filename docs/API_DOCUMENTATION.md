# Todone API Documentation

Reference guide for Todone's data models, stores, and utilities.

## Table of Contents

1. [Data Types](#data-types)
2. [Store APIs](#store-apis)
3. [Utility Functions](#utility-functions)
4. [Hooks](#hooks)
5. [Database](#database)
6. [OAuth Integration](#oauth-integration)

## Data Types

### Task

```typescript
interface Task {
  id: string                    // Unique identifier
  title: string                 // Task title
  description?: string          // Task description (HTML)
  completed: boolean            // Completion status
  projectId?: string           // Parent project ID
  parentTaskId?: string        // Parent task ID (for sub-tasks)
  sectionId?: string           // Section ID within project
  priority: 1 | 2 | 3 | 4      // 1=Urgent, 4=Low
  status: 'pending' | 'completed' | 'cancelled'
  dueDate?: Date               // Due date
  dueTime?: string             // Due time (HH:mm format)
  duration?: number            // Estimated duration in minutes
  startTime?: string           // Start time (HH:mm format)
  labels: string[]             // Label IDs
  assigneeId?: string          // Assigned user ID
  reminders: Reminder[]        // Reminders
  recurrence?: RecurrencePattern
  recurrenceExceptions: Date[]
  attachments: string[]        // Attachment IDs
  comments: string[]           // Comment IDs
  subtasks: string[]           // Sub-task IDs
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}
```

### Project

```typescript
interface Project {
  id: string
  name: string
  color: string                 // Hex color code
  icon?: string
  description?: string
  parentProjectId?: string      // For sub-projects
  archived: boolean
  sections: string[]            // Section IDs
  tasks: string[]               // Direct task IDs
  createdAt: Date
  updatedAt: Date
}
```

### Label

```typescript
interface Label {
  id: string
  name: string
  color: string
  description?: string
  taskCount: number
  createdAt: Date
  updatedAt: Date
}
```

### Section

```typescript
interface Section {
  id: string
  name: string
  projectId: string
  order: number
  tasks: string[]
  collapsed: boolean
  createdAt: Date
  updatedAt: Date
}
```

### User

```typescript
interface User {
  id: string
  email: string
  name: string
  avatar?: string
  settings: UserSettings
  karma: KarmaStats
  createdAt: Date
  updatedAt: Date
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timeFormat: '12h' | '24h'
  dateFormat: string
  startOfWeek: 'sunday' | 'monday'
  defaultProject?: string
  defaultPriority: number
  notifications: NotificationPreferences
  keyboardShortcuts: Record<string, string>
  enableKarma: boolean
  dailyGoal: number
  weeklyGoal: number
  daysOff: number[]
  vacationMode: boolean
}
```

### Comment

```typescript
interface Comment {
  id: string
  taskId: string
  authorId: string
  content: string
  mentions: string[]            // User IDs or emails
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
}
```

### Reminder

```typescript
interface Reminder {
  id: string
  taskId: string
  type: 'automatic' | 'manual' | 'location'
  minutes?: number              // Minutes before due date
  customTime?: Date             // Custom reminder time
  location?: {
    name: string
    lat: number
    lng: number
    radius: number
  }
  enabled: boolean
  createdAt: Date
}
```

### RecurrencePattern

```typescript
interface RecurrencePattern {
  id: string
  taskId: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  interval: number              // Every N days/weeks/months
  daysOfWeek?: number[]         // 0=Sunday, 6=Saturday
  daysOfMonth?: number[]
  endDate?: Date                // Recurrence end date
  endAfter?: number             // End after N occurrences
  exceptions: Date[]            // Dates to skip
  nextOccurrence?: Date
  createdAt: Date
}
```

### Activity

```typescript
interface Activity {
  id: string
  userId: string
  taskId?: string
  action: 'create' | 'update' | 'delete' | 'complete'
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  timestamp: Date
  metadata?: Record<string, any>
}
```

### Filter

```typescript
interface Filter {
  id: string
  name: string
  query: string                 // Filter query string
  sort: SortOption[]
  group?: 'project' | 'priority' | 'dueDate'
  pinned: boolean
  createdAt: Date
}

interface SortOption {
  field: 'title' | 'dueDate' | 'priority' | 'created'
  order: 'asc' | 'desc'
}
```

## Store APIs

### TaskStore

**State:**
```typescript
interface TaskStoreState {
  tasks: Task[]
  expandedTaskIds: Set<string>
  selectedTaskIds: Set<string>
}
```

**Methods:**
```typescript
// CRUD
addTask(task: Task): void
updateTask(id: string, updates: Partial<Task>): void
deleteTask(id: string): void
getTask(id: string): Task | undefined

// Completion
toggleTask(id: string): void
completeTask(id: string): void
uncompleteTask(id: string): void

// Sub-tasks
indentTask(id: string): void
promoteSubtask(id: string): void
getSubtasks(parentId: string): Task[]
completeAllSubtasks(parentId: string): void

// Ordering
reorderTask(id: string, newIndex: number): void
moveTask(id: string, projectId: string, sectionId?: string): void

// Filtering & Search
searchTasks(query: string): Task[]
filterTasks(filter: Filter): Task[]
getTodayTasks(): Task[]
getUpcomingTasks(): Task[]
getOverdueTasks(): Task[]
getTasksByProject(projectId: string): Task[]
getTasksByLabel(labelId: string): Task[]

// Other
duplicateTask(id: string): Task
convertTaskToProject(id: string): Project
```

### ProjectStore

**State:**
```typescript
interface ProjectStoreState {
  projects: Project[]
  favorites: Set<string>
  expandedProjectIds: Set<string>
}
```

**Methods:**
```typescript
// CRUD
createProject(project: Project): void
updateProject(id: string, updates: Partial<Project>): void
deleteProject(id: string): void
getProject(id: string): Project | undefined

// Organization
moveProject(id: string, parentId: string | null): void
reorderProjects(projectIds: string[]): void
getSubprojects(parentId: string): Project[]

// Favorites
toggleFavorite(id: string): void
getFavorites(): Project[]

// Status
archiveProject(id: string): void
unarchiveProject(id: string): void
getArchivedProjects(): Project[]

// Search
searchProjects(query: string): Project[]
```

### AuthStore

**State:**
```typescript
interface AuthStoreState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**Methods:**
```typescript
// Authentication
login(email: string, password: string): Promise<void>
signup(data: {
  email: string
  name: string
  password: string
}): Promise<void>
logout(): void
getCurrentUser(): User | null

// Settings
updateSettings(settings: Partial<UserSettings>): void
updateProfile(profile: {
  name?: string
  avatar?: string
}): void
changePassword(oldPassword: string, newPassword: string): Promise<void>

// Preferences
setTheme(theme: 'light' | 'dark' | 'system'): void
setLanguage(language: string): void
updateKeyboardShortcut(action: string, keys: string): void
```

### LabelStore

**Methods:**
```typescript
createLabel(label: Label): void
updateLabel(id: string, updates: Partial<Label>): void
deleteLabel(id: string): void
getLabel(id: string): Label | undefined
getAllLabels(): Label[]
searchLabels(query: string): Label[]
```

### FilterStore

**Methods:**
```typescript
createFilter(filter: Filter): void
updateFilter(id: string, updates: Partial<Filter>): void
deleteFilter(id: string): void
applyFilter(id: string): void
getActiveFilter(): Filter | null
getFilteredTasks(filter: Filter): Task[]
```

### SyncStore

**Methods:**
```typescript
// Offline support
addPendingOperation(op: SyncOperation): void
syncPendingOperations(): Promise<void>
getOnlineStatus(): boolean
getConflicts(): ConflictResolution[]
resolveConflict(id: string, resolution: 'keep' | 'replace'): void
```

### GameficationStore

**Methods:**
```typescript
addKarma(points: number): void
getKarmaLevel(karma: number): KarmaLevel
getCurrentStreak(): number
getLongestStreak(): number
unlockAchievement(id: string): void
getAchievements(): Achievement[]
getLeaderboard(): User[]
```

### UndoRedoStore

**Methods:**
```typescript
recordAction(action: {
  name: string
  undo: () => void
  redo: () => void
}): void
undo(): void
redo(): void
canUndo(): boolean
canRedo(): boolean
clearHistory(): void
```

## Utility Functions

### Date Utilities (`dateUtils.ts`)

```typescript
// Predicates
isToday(date: Date): boolean
isTomorrow(date: Date): boolean
isThisWeek(date: Date): boolean
isThisMonth(date: Date): boolean
isOverdue(date: Date): boolean
isInPast(date: Date): boolean

// Calculations
daysUntilDue(date: Date): number
formatDate(date: Date, format: string): string
parseNaturalDate(text: string): Date | null
getStartOfDay(date: Date): Date
getEndOfDay(date: Date): Date
getStartOfWeek(date: Date): Date
getEndOfWeek(date: Date): Date

// Grouping
groupTasksByDate(tasks: Task[]): Record<string, Task[]>
groupTasksByWeek(tasks: Task[]): Record<string, Task[]>
getDateGroup(date: Date): 'today' | 'tomorrow' | 'thisWeek' | 'later'
```

### Filter Parser (`filterParser.ts`)

```typescript
// Parse filter queries like "p:Work status:completed !important"
parseFilter(query: string): Filter
validateFilter(filter: Filter): { valid: boolean; errors: string[] }

// Examples of valid queries:
// "p:Work" - filter by project
// "status:completed" - filter by status
// "!important" - filter by priority
// "#coding" - filter by label
// "p:Work & status:pending" - AND operator
// "p:Work | p:Personal" - OR operator
// "!p:Archive" - NOT operator
```

### Recurrence (`recurrence.ts`)

```typescript
parseRecurrenceFromText(text: string): RecurrencePattern | null
generateRecurrenceInstances(
  pattern: RecurrencePattern,
  startDate: Date,
  endDate: Date
): Date[]
getNextOccurrence(pattern: RecurrencePattern): Date | null
isOccurrenceException(pattern: RecurrencePattern, date: Date): boolean
addException(pattern: RecurrencePattern, date: Date): void
removeException(pattern: RecurrencePattern, date: Date): void

// Examples
parseRecurrenceFromText("every Monday") // Returns weekly pattern
generateRecurrenceInstances(pattern, new Date(), addMonths(new Date(), 3))
```

### Export/Import (`exportImport.ts`)

```typescript
// Export
exportDataAsJSON(user: User): string
exportTasksAsCSV(tasks: Task[]): string
exportCompletionReportAsCSV(tasks: Task[]): string
exportTasksAsHTML(tasks: Task[]): string
exportActivityLogAsCSV(activities: Activity[]): string
exportActivityLogAsJSON(activities: Activity[]): string

// Import
parseImportedData(data: any, format: 'json' | 'csv'): ImportResult
validateImportedData(data: ImportResult): ValidationResult
detectImportSource(data: any): 'todoist' | 'google-tasks' | 'asana' | 'native'

// Specific importers
importFromTodoist(data: any): ImportResult
importFromGoogleTasks(data: any): ImportResult
importFromAsana(data: any): ImportResult
```

### Calendar Sync (`calendarSync.ts`)

```typescript
taskToCalendarEvent(task: Task): CalendarEvent
tasksToCalendarEvents(tasks: Task[]): CalendarEvent[]
filterSyncableTasks(tasks: Task[]): Task[]
generateSyncReport(tasks: Task[], synced: Task[]): SyncReport
createICalExport(tasks: Task[]): string
getTasksNeedingSync(tasks: Task[], lastSyncTime: Date): Task[]
```

### OAuth (`oauth.ts`)

```typescript
generatePKCEChallenge(): PKCEPair
buildAuthorizationUrl(provider: string, options: OAuthOptions): string
exchangeCodeForToken(provider: string, code: string): Promise<OAuthToken>
refreshAccessToken(provider: string, token: OAuthToken): Promise<OAuthToken>
revokeToken(provider: string, token: OAuthToken): Promise<void>
isTokenExpired(token: OAuthToken): boolean
getValidToken(provider: string): Promise<OAuthToken>
storeOAuthToken(provider: string, token: OAuthToken): void
getStoredOAuthToken(provider: string): OAuthToken | null
```

### Other Utilities

```typescript
// String utilities
cn(...classes: any[]): string                    // Merge classnames
truncate(text: string, length: number): string
capitalize(text: string): string

// Task utilities
getTaskPriorityLabel(priority: number): string
getPriorityColor(priority: number): string
getTaskStatus(task: Task): string
isTaskOverdue(task: Task): boolean

// Validation
validateTaskTitle(title: string): { valid: boolean; error?: string }
validateEmail(email: string): boolean
validateUrl(url: string): boolean
```

## Hooks

### Custom Hooks

```typescript
// Store hooks
useTaskStore(selector?: (state) => any): TaskStoreState | any
useProjectStore(selector?: (state) => any): ProjectStoreState | any
useAuthStore(selector?: (state) => any): AuthStoreState | any

// Performance hooks
useDebounce<T>(value: T, delay: number): T
useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T

// UI hooks
useIsMobile(): boolean
useIsTablet(): boolean
useIsDesktop(): boolean
useReducedMotion(): boolean
useDyslexiaFont(): [boolean, (enabled: boolean) => void]

// Keyboard hooks
useKeyboardShortcuts(): void
useKeyboardNavigation(items: any[]): {
  selectedIndex: number
  select: (index: number) => void
}

// OAuth hooks
useOAuth(provider: string): {
  token: OAuthToken | null
  isAuthenticated: boolean
  isLoading: boolean
  initiateOAuth: () => Promise<void>
  logout: () => void
}

// Gesture hooks
useSwipeGestures(ref: RefObject<HTMLElement>): {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}
```

## Database

### Schema

```typescript
export const db = new Dexie('Todone')
db.version(1).stores({
  users: 'id, email',
  projects: 'id, parentProjectId, archived',
  sections: 'id, projectId',
  tasks: 'id, projectId, status, dueDate, parentTaskId',
  labels: 'id, name',
  comments: 'id, taskId',
  activities: 'id, userId, taskId, timestamp',
  filters: 'id, userId, pinned',
  reminders: 'id, taskId',
  integrations: 'id, userId, provider',
  // ... more tables
})
```

### Querying

```typescript
// Get all tasks
db.tasks.toArray()

// Get with filter
db.tasks.where('projectId').equals('proj123').toArray()

// Get with multiple conditions
db.tasks
  .where('status')
  .equals('pending')
  .and(task => task.priority === 1)
  .toArray()

// Count
db.tasks.where('completed').equals(false).count()

// Update
db.tasks.update(id, { completed: true })

// Batch operations
db.table('tasks').bulkAdd(tasks)
db.table('tasks').bulkUpdate(updates)
db.table('tasks').bulkDelete(ids)
```

## OAuth Integration

### Supported Providers

```typescript
type OAuthProvider = 'google' | 'microsoft' | 'slack' | 'github'

interface OAuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  scopes: string[]
  provider: OAuthProvider
}
```

### OAuth Flow

```typescript
// 1. Initiate OAuth (user clicks "Connect Google")
const authUrl = buildAuthorizationUrl('google', {
  clientId: 'your-client-id',
  redirectUri: 'https://todone.app/auth/callback',
  scopes: ['calendar', 'gmail']
})
// Opens auth.google.com

// 2. User authorizes and is redirected back
const code = new URLSearchParams(location.search).get('code')

// 3. Exchange code for token
const token = await exchangeCodeForToken('google', code)

// 4. Token automatically refreshed when needed
const validToken = await getValidToken('google')

// 5. Use token for API calls
fetch('https://www.googleapis.com/calendar/v3/calendars', {
  headers: {
    'Authorization': `Bearer ${validToken.accessToken}`
  }
})
```

### Configuration

Add to `.env.production`:

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_OUTLOOK_OAUTH_CLIENT_ID=your-app-id
VITE_SLACK_OAUTH_CLIENT_ID=your-client-id
VITE_GITHUB_OAUTH_CLIENT_ID=your-client-id
```

## Examples

### Creating a Task

```typescript
import { useTaskStore } from '@/store/taskStore'

export const MyComponent = () => {
  const addTask = useTaskStore(state => state.addTask)

  const handleAddTask = () => {
    addTask({
      id: crypto.randomUUID(),
      title: 'Learn React',
      completed: false,
      priority: 2,
      dueDate: new Date('2024-12-25'),
      labels: ['coding', 'learning'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  return <button onClick={handleAddTask}>Add Task</button>
}
```

### Filtering Tasks

```typescript
import { useTaskStore } from '@/store/taskStore'

export const MyComponent = () => {
  const filterTasks = useTaskStore(state => state.filterTasks)

  const workTasks = filterTasks({
    id: 'work-filter',
    name: 'Work Tasks',
    query: 'p:Work status:pending',
    sort: [{ field: 'dueDate', order: 'asc' }]
  })

  return <div>{workTasks.map(task => <div>{task.title}</div>)}</div>
}
```

### Using OAuth

```typescript
import { useOAuth } from '@/hooks/useOAuth'

export const CalendarSync = () => {
  const { token, isAuthenticated, initiateOAuth, logout } = useOAuth('google')

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Connected to Google Calendar</p>
          <button onClick={logout}>Disconnect</button>
        </>
      ) : (
        <button onClick={initiateOAuth}>Connect Google Calendar</button>
      )}
    </div>
  )
}
```

---

For more examples, see the [source code](../src/) and [tests](../src/).
