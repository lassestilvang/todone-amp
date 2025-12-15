# Todone Architecture Guide

## Overview

Todone is a modern, single-page application (SPA) built with React 18, TypeScript, and Vite. It follows a component-driven architecture with centralized state management using Zustand and client-side data persistence using Dexie.js (IndexedDB wrapper).

## Architecture Principles

1. **Type Safety First** - Strict TypeScript mode enforced across the codebase
2. **Component Reusability** - Small, focused components that compose together
3. **State Management Simplicity** - Zustand for minimal boilerplate
4. **Local-First Data** - All data stored locally in browser (IndexedDB)
5. **Performance** - Lazy loading, memoization, and virtual scrolling built in
6. **Accessibility** - WCAG 2.1 AA compliance from the ground up
7. **Testing** - Comprehensive test coverage (85+ test files, 1200+ tests)

## Technology Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper
- **date-fns** - Date manipulation
- **@dnd-kit** - Drag and drop
- **TipTap** - Rich text editor

### Development
- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Strict mode enabled

## Project Structure

```
src/
├── components/              # React components
│   ├── views/              # Page-level components
│   │   ├── InboxView.tsx
│   │   ├── TodayView.tsx
│   │   ├── UpcomingView.tsx
│   │   ├── CalendarView.tsx
│   │   ├── BoardView.tsx
│   │   └── ...
│   ├── modals/             # Modal/dialog components
│   │   ├── QuickAddModal.tsx
│   │   ├── CreateProjectModal.tsx
│   │   ├── TaskDetailPanel.tsx
│   │   └── ...
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── TaskItem.tsx
│   ├── Sidebar.tsx
│   ├── App.tsx
│   └── ...
│
├── store/                   # Zustand state stores (30+)
│   ├── taskStore.ts        # Task state and actions
│   ├── projectStore.ts     # Project management
│   ├── authStore.ts        # Authentication and user
│   ├── filterStore.ts      # Filter and search
│   ├── labelStore.ts       # Labels management
│   ├── dragStore.ts        # Drag and drop state
│   ├── viewStore.ts        # View preferences
│   ├── syncStore.ts        # Offline sync queue
│   ├── gamificationStore.ts# Karma and achievements
│   ├── reminderStore.ts    # Reminders
│   ├── commentStore.ts     # Comments and collaboration
│   ├── undoRedoStore.ts    # Undo/redo history
│   ├── integrationStore.ts # Integrations
│   └── ...
│
├── hooks/                   # Custom React hooks
│   ├── useTaskStore.ts     # Task store hook
│   ├── useKeyboardShortcuts.ts
│   ├── useIsMobile.ts
│   ├── useDebounce.ts
│   ├── useDebouncedCallback.ts
│   ├── useOAuth.ts
│   ├── useFeatureDiscovery.ts
│   └── ...
│
├── utils/                   # Utility functions
│   ├── dateUtils.ts        # Date helpers
│   ├── taskUtils.ts        # Task helpers
│   ├── filterParser.ts     # Filter parsing
│   ├── recurrence.ts       # Recurring tasks
│   ├── exportImport.ts     # Data import/export
│   ├── calendarSync.ts     # Calendar sync
│   ├── oauth.ts            # OAuth 2.0
│   ├── notifications.ts    # Notifications
│   ├── cn.ts               # Classname utils
│   └── ...
│
├── types/                   # TypeScript definitions
│   ├── index.ts            # All types exported here
│   └── types.ts            # Core type definitions
│
├── db/                      # Database
│   ├── database.ts         # Dexie setup
│   ├── schema.ts           # Schema definitions
│   └── migrations.ts       # Database migrations
│
├── styles/                  # Global styles
│   ├── globals.css
│   └── animations.css
│
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── vite-env.d.ts           # Vite types
```

## State Management (Zustand)

### Core Stores

#### TaskStore
Manages all task operations and state.

```typescript
interface TaskStoreState {
  tasks: Task[]
  expandedTaskIds: Set<string>
  selectedTaskIds: Set<string>
  
  // Actions
  addTask(task: Task): void
  updateTask(id: string, task: Partial<Task>): void
  deleteTask(id: string): void
  toggleTask(id: string): void
  searchTasks(query: string): Task[]
  filterTasks(filter: Filter): Task[]
  // ... 20+ methods
}
```

**Responsibilities:**
- CRUD operations for tasks
- Task filtering and searching
- Sub-task hierarchy management
- Task completion and recurrence

#### ProjectStore
Manages projects and their organization.

```typescript
interface ProjectStoreState {
  projects: Project[]
  favorites: Set<string>
  expandedProjectIds: Set<string>
  
  // Actions
  createProject(project: Project): void
  updateProject(id: string, updates: Partial<Project>): void
  deleteProject(id: string): void
  moveProject(id: string, parentId: string | null): void
  toggleFavorite(id: string): void
  // ... 15+ methods
}
```

**Responsibilities:**
- Project CRUD operations
- Project hierarchy (parent/child)
- Archive management
- Favorites system

#### AuthStore
Manages authentication and user state.

```typescript
interface AuthStoreState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login(email: string, password: string): Promise<void>
  signup(data: SignupData): Promise<void>
  logout(): void
  updateSettings(settings: Partial<UserSettings>): void
  // ... 10+ methods
}
```

**Responsibilities:**
- User authentication
- User profile and settings
- Preference management
- Persistence to localStorage

### Other Important Stores

- **SyncStore** - Offline sync queue and online status
- **GameficationStore** - Karma, achievements, streaks
- **FilterStore** - Saved filters and filter state
- **LabelStore** - Label CRUD and organization
- **UndoRedoStore** - Undo/redo history
- **ViewStore** - View preferences and layout
- **DragStore** - Drag and drop state
- **IntegrationStore** - OAuth tokens and integration state
- **ReminderStore** - Reminders and notifications
- **CommentStore** - Comments and activity log

## Database Layer (Dexie.js)

### Schema

Todone uses IndexedDB with Dexie.js for schema and query management.

```typescript
export interface DatabaseSchema {
  users: Table<User>
  projects: Table<Project>
  sections: Table<Section>
  tasks: Table<Task>
  labels: Table<Label>
  comments: Table<Comment>
  activities: Table<Activity>
  filters: Table<Filter>
  attachments: Table<Attachment>
  reminders: Table<Reminder>
  integrations: Table<Integration>
  // ... and more
}
```

### Indices

Strategic indices for query performance:

```typescript
db.tasks.orderBy('dueDate')
db.tasks.where('projectId').equals(id)
db.tasks.where('status').equals('completed')
db.comments.where('taskId').equals(id).toArray()
// ... optimized queries
```

### Initialization

Database is initialized on app load with default data:

```typescript
const db = new Dexie('Todone')
db.version(1).stores({
  tasks: 'id, projectId, status, dueDate',
  projects: 'id, parentProjectId, archived',
  // ...
})
```

## Component Architecture

### Component Hierarchy

```
App
├── AuthView (if not authenticated)
│   ├── LoginPage
│   └── SignupPage
└── MainApp (if authenticated)
    ├── Layout
    │   ├── Sidebar
    │   │   ├── Navigation
    │   │   ├── ProjectList
    │   │   └── LabelList
    │   ├── MainContent
    │   │   ├── ViewContainer
    │   │   │   ├── InboxView
    │   │   │   ├── TodayView
    │   │   │   ├── UpcomingView
    │   │   │   ├── CalendarView
    │   │   │   ├── BoardView
    │   │   │   └── ...
    │   │   └── TaskDetailPanel
    │   └── RightPanel (Settings/Info)
    └── Modals
        ├── QuickAddModal
        ├── CreateProjectModal
        ├── SettingsModal
        └── ...
```

### Component Patterns

#### Presentational Components
Pure components that receive props and render UI.

```typescript
interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onClick: (id: string) => void
  isDragging?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onClick,
  isDragging
}) => {
  // Pure UI rendering
}
```

#### Container Components
Components that manage state and pass data down.

```typescript
export const TaskListContainer: React.FC = () => {
  const tasks = useTaskStore(state => state.tasks)
  const toggleTask = useTaskStore(state => state.toggleTask)
  
  return <TaskList tasks={tasks} onToggle={toggleTask} />
}
```

#### Custom Hooks
Encapsulate stateful logic for reuse.

```typescript
export const useTaskStore = create<TaskStoreState>(set => ({
  // Store implementation
}))

export const useDebounce = <T,>(value: T, delay: number): T => {
  // Hook implementation
}
```

## Data Flow

### Create Task Flow

```
User Input (Quick Add Modal)
    ↓
QuickAddModal captures input
    ↓
AITaskParser extracts properties
    ↓
taskStore.addTask() called
    ↓
Task added to IndexedDB
    ↓
Store state updated (subscribers notified)
    ↓
Components re-render with new task
    ↓
Optional: Activity logged in activityStore
```

### Update Task Flow

```
User clicks edit (TaskDetailPanel opens)
    ↓
Form captures changes
    ↓
taskStore.updateTask() called
    ↓
Task updated in IndexedDB
    ↓
UndoRedoStore records action
    ↓
Store state updated
    ↓
Activity logged
    ↓
Components re-render
    ↓
Optional: Sync queued if offline
```

### Sync Flow (Offline Support)

```
User action (online → offline)
    ↓
syncStore.addPendingOperation()
    ↓
Operation queued locally
    ↓
App continues working
    ↓
Connection restored (online)
    ↓
syncStore.syncPendingOperations()
    ↓
Operations sent to server
    ↓
Conflict resolution if needed
    ↓
Local state updated
```

## Key Features Architecture

### Quick Add (Cmd+K)

```
QuickAddModal (UI)
    ↓
AITaskParser (NLP)
    ↓
Extracts: title, dueDate, priority, project, labels
    ↓
taskStore.addTask()
    ↓
Task created with all properties
```

### Drag and Drop

```
DraggableTaskItem (UI with @dnd-kit)
    ↓
DroppableContainer (Drop zone)
    ↓
dragStore tracks drag state
    ↓
On drop: taskStore.reorderTask() or taskStore.moveTask()
    ↓
Database updated
    ↓
UI reflects new order/position
```

### Recurring Tasks

```
RecurrenceSelector (UI)
    ↓
Stores RecurrencePattern on task
    ↓
generateRecurrenceInstances() creates future instances
    ↓
completeRecurringTask() creates next instance
    ↓
Database has multiple task records for recurrence
```

### Filters & Search

```
EnhancedSearchBar (UI)
    ↓
useDebounce() prevents excessive updates
    ↓
filterParser.parseFilter() interprets query
    ↓
filterStore.applyFilter()
    ↓
TaskList filtered and displayed
```

### Undo/Redo

```
Task action (create/update/delete)
    ↓
undoRedoStore.recordAction()
    ↓
Action stored with undo function
    ↓
User presses Cmd+Z
    ↓
undoRedoStore.undo() called
    ↓
Undo function executes
    ↓
Database and UI roll back
```

## Performance Optimizations

### Lazy Loading
Components loaded on-demand using React.lazy:

```typescript
const CalendarView = lazy(() => import('./views/CalendarView'))

<Suspense fallback={<LoadingSpinner />}>
  <CalendarView />
</Suspense>
```

### Virtual Scrolling
For lists with 1000+ items:

```typescript
<VirtualTaskList 
  items={tasks} 
  renderItem={renderTaskItem}
  itemHeight={60}
/>
```

### Memoization
Prevent unnecessary re-renders:

```typescript
const TaskItem = memo(TaskItemComponent, (prev, next) => 
  prev.task.id === next.task.id &&
  prev.task.completed === next.task.completed
)
```

### Debouncing
Reduce event handler calls:

```typescript
const debouncedSearch = useDebouncedCallback(
  (query: string) => searchTasks(query),
  300 // ms delay
)
```

## Keyboard Shortcuts

Centralized keyboard shortcut management:

```typescript
const keyboardStore = create<KeyboardStoreState>(set => ({
  shortcuts: {
    'Cmd+K': 'quickAdd',
    'Cmd+Enter': 'completeTask',
    '1': 'setPriorityUrgent',
    // ... more shortcuts
  },
  
  setShortcut(key: string, action: string): void {
    // Update shortcut
  }
}))

// Hook for using shortcuts
const useKeyboardShortcuts = () => {
  // Register listeners and handle shortcuts
}
```

## Testing Architecture

### Test Structure

```
src/
├── utils/
│   ├── dateUtils.ts
│   └── dateUtils.test.ts    # Unit tests
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx      # Component tests
├── store/
│   ├── taskStore.ts
│   └── taskStore.test.ts    # Store tests
```

### Test Types

1. **Unit Tests** - Test utility functions in isolation
2. **Component Tests** - Test components with mocks
3. **Store Tests** - Test Zustand stores
4. **Integration Tests** - Test component + store interactions

### Example Test

```typescript
describe('TaskStore', () => {
  it('should add task', () => {
    const { result } = renderHook(() => useTaskStore())
    
    const task = createTestTask()
    act(() => result.current.addTask(task))
    
    expect(result.current.tasks).toContain(task)
  })
})
```

## Security

### Data Protection
- **IndexedDB Storage** - Data only stored locally
- **No Server Communication** - No data sent to servers (without integration)
- **OAuth 2.0 with PKCE** - Secure integration authentication
- **Token Storage** - Tokens stored securely per provider

### Browser Security
- **Content Security Policy** - Configured in Vite
- **XSS Prevention** - React's built-in escaping
- **CSRF Protection** - State verification in OAuth

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation:**
- All features accessible without mouse
- Logical tab order
- Visible focus indicators

**Screen Readers:**
- Proper ARIA labels and roles
- Semantic HTML elements
- Skip navigation links

**Visual:**
- Color contrast ratio verification
- Dyslexia-friendly font option
- Reduced motion support

## Deployment

### Build Output

```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-xxxxx.js      # Main app bundle
│   ├── index-xxxxx.css     # Main styles
│   ├── editor-xxxxx.js     # TipTap editor (lazy)
│   └── vendor-xxxxx.js     # Vendor chunks
```

### Size Metrics
- **Main JS** - ~221 kB (53 kB gzipped)
- **CSS** - ~73 kB (10.8 kB gzipped)
- **Editor** - ~356 kB lazy loaded (110 kB gzipped)
- **Total Gzip** - ~175 kB initial load

### Environment Variables

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_id
VITE_OUTLOOK_OAUTH_CLIENT_ID=your_id
VITE_SLACK_OAUTH_CLIENT_ID=your_id
VITE_GITHUB_OAUTH_CLIENT_ID=your_id
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Architecture Considerations

1. **Real-time Sync** - Add WebSocket for live collaboration
2. **Service Worker** - Enhanced offline support with background sync
3. **Module Federation** - Separate editor and extensions as modules
4. **API Layer** - Add optional backend for sync and sharing
5. **GraphQL** - Consider for complex data relationships
6. **E2E Testing** - Playwright/Cypress for full user journeys

---

For detailed information on specific features, see the component or store source code. All code includes TypeScript types and comprehensive comments.
