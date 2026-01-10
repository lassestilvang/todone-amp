# Todone - Quick Reference Guide

## Project Commands

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build locally

# Quality Assurance
npm run type-check   # TypeScript strict mode check
npm run lint         # ESLint (0 warnings required)
npm run test         # Vitest unit tests
npm run test:ui      # Vitest with UI dashboard
```

## Project Structure

```
src/
├── components/       # Reusable React components
├── db/              # IndexedDB schema and initialization
├── hooks/           # Custom React hooks
├── pages/           # Page-level components (routes)
├── store/           # Zustand state management (30+ stores)
├── test/            # Test utilities and setup
├── types/           # TypeScript interfaces
├── utils/           # Helper functions
├── views/           # Major view components
└── App.tsx          # Root component
```

## Key Stores (Zustand)

### Task Management
- `taskStore`: Create, read, update, delete, toggle tasks + recurrence
- `taskDetailStore`: Task detail panel state
- `bulkActionStore`: Multi-select and bulk operations

### Organization
- `projectStore`: Project CRUD and hierarchy
- `sectionStore`: Section management within projects
- `labelStore`: Label creation and management
- `filterStore`: Filter creation and application

### User & System
- `authStore`: Authentication and user settings
- `viewStore`: Active view and layout preferences
- `gamificationStore`: Karma, streaks, achievements
- `syncStore`: Offline sync queue management
- `notificationStore`: System notifications

### Advanced Features
- `recurrenceStore`: Recurring task patterns
- `reminderStore`: Task reminders
- `searchHistoryStore`: Recent searches (NEW)
- `favoritesStore`: Favorite tasks/projects (NEW)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick add / Command palette |
| `Q` | Quick add task |
| `Escape` | Close modal / Clear selection |
| `Ctrl/Cmd + Enter` | Complete selected task |
| `1-4` | Set priority P1-P4 |
| `T` | Due today |
| `M` | Due tomorrow |
| `W` | Due next week |
| `/` | Focus search |
| `Ctrl/Cmd + D` | Duplicate task |
| `Delete` | Delete task(s) |
| `A` | Toggle select mode |
| `Shift + A` | Select all visible |

## Common Patterns

### Using a Store
```typescript
import { useTaskStore } from '@/store/taskStore'

function MyComponent() {
  const tasks = useTaskStore((state) => state.tasks)
  const createTask = useTaskStore((state) => state.createTask)
  
  // Use tasks and methods...
}
```

### Creating a New Store
```typescript
import { create } from 'zustand'

interface MyState {
  count: number
  increment: () => void
}

export const useMyStore = create<MyState>((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### Database Operations
```typescript
import { db } from '@/db/database'

// All tables available via db object
const tasks = await db.tasks.toArray()
const task = await db.tasks.get(taskId)
await db.tasks.add(newTask)
await db.tasks.update(taskId, updates)
await db.tasks.delete(taskId)
```

### Date Utilities
```typescript
import { format, addDays, startOfDay, isToday } from 'date-fns'
import { formatDueDate, isTaskOverdue } from '@/utils/date'

const dateStr = format(date, 'yyyy-MM-dd')
const tomorrow = addDays(new Date(), 1)
const due = formatDueDate(task.dueDate)
```

## TypeScript Tips

### Task Type
```typescript
import type { Task, Priority } from '@/types'

const newTask: Task = {
  id: 'task-1',
  content: 'Do something',
  priority: 'p1',
  completed: false,
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### Component Pattern
```typescript
import React from 'react'
import { cn } from '@/utils/cn'

interface MyComponentProps {
  title: string
  onClose?: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClose }) => {
  return <div className={cn('class1', 'class2')}>{title}</div>
}
```

## Styling

- **Framework**: Tailwind CSS 3.4
- **Icons**: Lucide React (24px by default)
- **Spacing**: 4px-based scale (4, 8, 12, 16, 20, 24, 32, etc.)
- **Colors**: Semantic with brand-500 as primary
- **Utilities**: Use `cn()` from `@/utils/cn` for conditional classes

```typescript
import { cn } from '@/utils/cn'
import { ChevronRight } from 'lucide-react'

<div className={cn('p-4', isActive && 'bg-blue-50')}>
  <ChevronRight className="w-5 h-5" />
</div>
```

## Common Utilities

### `cn()` - Classname Merging
```typescript
cn('px-4', 'px-2') // Returns: 'px-2' (correctly merges Tailwind conflicts)
```

### Date Grouping
```typescript
import { groupTasksByDate } from '@/utils/date'

const grouped = groupTasksByDate(tasks) // Groups by overdue, today, upcoming, etc.
```

### Natural Language Parsing
```typescript
import { parseDate, parseTime } from '@/utils/date'

const date = parseDate('next Monday')
const time = parseTime('3pm')
```

## Component Library

### Button
```typescript
<Button variant="primary" size="sm" onClick={handleClick}>
  Click me
</Button>
```
Variants: `primary`, `secondary`, `ghost`, `danger`
Sizes: `sm`, `md`, `lg`

### Input
```typescript
<Input
  label="Task name"
  type="text"
  placeholder="Enter task..."
  error="Field is required"
/>
```

### TaskItem
```typescript
<TaskItem
  task={task}
  onToggle={(id) => completeTask(id)}
  onSelect={(id) => openDetail(id)}
  isSelected={selectedId === task.id}
/>
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `TaskItem.tsx`)
- **Stores**: camelCase with "Store" suffix (e.g., `taskStore.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types**: As imported, usually `index.ts`
- **Tests**: Same name + `.test.ts` suffix

## ESLint Rules

- No unused variables/imports
- No `any` types (use proper TypeScript)
- No `console.log` in production code
- Require explicit return types on functions
- React components must be exported

Run `npm run lint` and fix all errors before committing.

## Performance Tips

1. **Use `useMemo`** for expensive computations
2. **Zustand selectors** for granular store subscriptions
3. **Lazy load** components where possible
4. **Debounce** input handlers
5. **Virtual scrolling** for 1000+ items

## Debugging

```typescript
// Check state in Zustand
useTaskStore.getState()

// Log all state changes (development)
const store = useTaskStore.getState()
console.log(store)

// React DevTools for component props/state
// Redux DevTools can be integrated if needed
```

## Contributing

1. **Branch naming**: `feature/name` or `fix/issue-number`
2. **Commit messages**: Clear, present tense ("Add feature" not "Added feature")
3. **PR requirements**:
   - `npm run type-check` passes
   - `npm run lint` passes (0 warnings)
   - `npm run build` successful
   - Unit tests for new functionality
4. **Code review** before merging to main

## Resources

- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [date-fns Docs](https://date-fns.org)
- [Dexie.js](https://dexie.org)

## Quick Debugging Checklist

- [ ] Are imports using the `@/` alias?
- [ ] Is the component exported as `React.FC<Props>`?
- [ ] Are all Zustand hooks typed correctly?
- [ ] Is database operation wrapped in try/catch?
- [ ] Are event handlers preventing propagation where needed?
- [ ] Are Tailwind classes for responsive design using sm:, md:, etc.?
- [ ] Is state update triggering re-render? (Check React DevTools)
