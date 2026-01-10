# Developer Quick Reference - Todone Phase 4

**Last Updated**: December 26, 2025  
**Phase 4 Status**: 98.3% Complete (59/60 features)  
**Ready for Production**: Yes ✅

---

## Project Overview

**Todone** is a task management app with gamification, mobile responsiveness, and offline support. Phase 4 adds achievements, notifications, mobile views, and PWA features.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **UI**: Tailwind CSS + Lucide icons
- **Testing**: Vitest
- **Build**: Vite + esbuild

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build           # Production build
npm run type-check      # TypeScript validation
npm run lint            # ESLint validation
npm run test            # Run tests (slow)

# Code Quality
npm run lint -- --fix   # Auto-fix lint issues
npm run format          # Format with Prettier
npm run type-check      # Check TypeScript
```

---

## Key Architecture

### State Management (Zustand)
```typescript
// src/store/
├── taskStore.ts           // Main tasks
├── gamificationStore.ts    // Karma, achievements, streaks
├── aiStore.ts             // NLP parsing
├── syncStore.ts           // Offline queue
└── authStore.ts           // User auth
```

### Components Structure
```typescript
// src/components/
├── layout/                // Layout components
│   ├── Sidebar.tsx
│   ├── MobileNavigation.tsx
│   ├── ResponsiveLayout.tsx
│   └── BottomSheet.tsx
├── tasks/                 // Task components
│   ├── TaskItem.tsx
│   ├── TaskList.tsx
│   └── TaskForm.tsx
├── gamification/          // Gamification
│   ├── KarmaWidget.tsx
│   ├── StreakDisplay.tsx
│   ├── AchievementsShowcase.tsx
│   ├── AchievementNotificationCenter.tsx
│   ├── AchievementDetailModal.tsx
│   ├── BadgesDisplay.tsx
│   ├── KarmaHistoryChart.tsx
│   └── Leaderboard.tsx
├── mobile/                // Mobile views
│   ├── MobileInboxView.tsx
│   ├── MobileQuickAddModal.tsx
│   ├── MobileTaskDetail.tsx
│   └── ContextMenu.tsx
└── pwa/                   // PWA features
    ├── InstallPrompt.tsx
    └── OfflineIndicator.tsx
```

### Hooks (Custom)
```typescript
// src/hooks/
├── useTaskStore.ts        // Task store access
├── useGamificationStore.ts // Gamification access
├── useTouchGestures.ts    // Swipe, long-press
├── usePWA.ts              // Service worker, install
└── useAchievementNotifier.ts // Achievement notifications
```

### Utilities
```typescript
// src/utils/
├── achievementTriggers.ts // Achievement unlock logic
├── badges.ts              // Badge utilities
├── recurrence.ts          // Recurrence calculation
├── dateFormatter.ts       // Date formatting
└── cn.ts                  // Tailwind className merge
```

---

## Common Tasks

### Adding a New Component

1. **Create file** in appropriate folder
2. **Type props interface**:
   ```typescript
   interface MyComponentProps {
     title: string
     onClick?: () => void
   }
   ```
3. **Export as functional component**:
   ```typescript
   export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
     return <div>{title}</div>
   }
   ```
4. **Add to index** if barrel export needed
5. **Test** for TypeScript and styling

### Adding a Store Action

1. **Update state interface**:
   ```typescript
   interface State {
     items: Item[]
     // ...
   }
   ```
2. **Update actions interface**:
   ```typescript
   interface Actions {
     addItem: (item: Item) => Promise<void>
   }
   ```
3. **Implement in store**:
   ```typescript
   addItem: async (item: Item) => {
     // Implementation
     set({ items: [...get().items, item] })
   }
   ```
4. **Call from components**:
   ```typescript
   const { addItem } = useTaskStore()
   await addItem(newItem)
   ```

### Adding an Achievement

1. **Define in gamificationStore.ts**:
   ```typescript
   {
     id: 'new-achievement',
     name: 'Display Name',
     description: 'What user did',
     icon: '🎯',
     points: 100,
   }
   ```
2. **Add trigger in achievementTriggers.ts**:
   ```typescript
   'new-achievement': (stats: UserStats): boolean => {
     return stats.someMetric >= threshold
   }
   ```
3. **Test unlock**:
   ```bash
   npm run test -- achievementTriggers.test.ts
   ```

---

## Code Patterns

### TypeScript Best Practices
✅ Always use type annotations  
✅ No `any` types (use `unknown` if needed)  
✅ Union types for variants  
✅ Interfaces for props  
✅ Enums for constants  

```typescript
// ✅ Good
interface TaskProps {
  id: string
  status: 'active' | 'completed' | 'archived'
  priority: Priority
}

// ❌ Bad
interface TaskProps {
  id: any
  status: string
  priority: any
}
```

### Component Patterns
✅ Functional components only  
✅ Use hooks for state  
✅ Props interface required  
✅ Export component directly  
✅ JSDoc for public APIs  

```typescript
/**
 * MyComponent - Does something useful
 * @param title - The component title
 * @returns Rendered component
 */
export const MyComponent: React.FC<{ title: string }> = ({ title }) => {
  return <div>{title}</div>
}
```

### Store Patterns
✅ Zustand create() pattern  
✅ Typed state and actions  
✅ Async operations return Promises  
✅ Error handling with try/catch  
✅ Loading states when appropriate  

```typescript
export const useMyStore = create<State & Actions>((set, get) => ({
  // State
  items: [],
  loading: false,
  error: null,

  // Actions
  loadItems: async () => {
    set({ loading: true })
    try {
      const items = await fetchItems()
      set({ items, error: null })
    } catch (error) {
      set({ error: 'Failed to load' })
    } finally {
      set({ loading: false })
    }
  },
}))
```

### Responsive Design Pattern
✅ Mobile-first approach  
✅ Use Tailwind breakpoints (sm, md, lg, xl)  
✅ Touch targets 48px minimum  
✅ Dark mode support  

```typescript
// ✅ Mobile-first
<div className="px-4 sm:px-6 md:px-8">
  <button className="w-12 h-12 sm:w-10 sm:h-10">
    Click me
  </button>
</div>

// Style for dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

---

## Game System Architecture

### Achievement Flow
```
1. User completes task
   ↓
2. taskStore.toggleTask() called
   ↓
3. Award karma with priority multiplier
   ↓
4. gamificationStore.updateStreak() called
   ↓
5. checkAchievementsToUnlock() checks conditions
   ↓
6. For each eligible achievement:
   - gamificationStore.unlockAchievement()
   - Emit notification via window global
   - AchievementNotificationCenter displays toast
   ↓
7. Auto-dismiss after 5 seconds
```

### Karma Multipliers
```
P1 = 3x   (High priority)
P2 = 2x   (Medium priority)
P3 = 1.5x (Low priority)
P4 = 1x   (Very low)
null = 0.5x (No priority)
```

### Karma Levels
```
0-99         → Beginner
100-299      → Novice
300-699      → Intermediate
700-1299     → Advanced
1300-1999    → Professional
2000-2999    → Expert
3000-4499    → Master
4500-5999    → Grandmaster
6000+        → Enlightened
```

### Achievement Unlock Detection
```typescript
achievementTriggers = {
  'first-task': totalCompleted >= 1 (NEW)
  'streak-7': currentStreak >= 7 (NEW)
  'streak-30': currentStreak >= 30 (NEW)
  'tasks-50': totalCompleted >= 50 (NEW)
  'tasks-100': totalCompleted >= 100 (NEW)
  'priority-10': (needs P1 tracking) (PLACEHOLDER)
  'team-5': (needs team tracking) (PLACEHOLDER)
  'daily-login': (needs login tracking) (PLACEHOLDER)
}
```

---

## Testing Guide

### Running Tests
```bash
# All tests
npm run test

# Single file
npm run test -- path/to/test.ts

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

### Test Structure
```typescript
describe('MyComponent', () => {
  it('should render', () => {
    const { getByText } = render(<MyComponent title="Test" />)
    expect(getByText('Test')).toBeInTheDocument()
  })

  it('should handle click', () => {
    const onClick = vi.fn()
    const { getByRole } = render(<MyComponent onClick={onClick} />)
    fireEvent.click(getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Store Testing
```typescript
describe('gamificationStore', () => {
  it('should add karma', async () => {
    const store = useGamificationStore.getState()
    await store.initializeStats('user-1')
    await store.addKarma('user-1', 10, 'p1')
    expect(store.userStats?.karma).toBe(30) // 10 * 3x multiplier
  })
})
```

---

## Debugging Tips

### Console Logging
```typescript
// Check store state
console.log(useTaskStore.getState())
console.log(useGamificationStore.getState())

// Check component props
console.log({ title, onClick })
```

### React DevTools
- Install React DevTools browser extension
- Inspect component tree
- Check props and state
- Monitor re-renders

### Vite DevTools
- HMR (Hot Module Replacement) works automatically
- Check browser console for build errors
- Network tab for API calls

### TypeScript Errors
```bash
npm run type-check  # See all type errors
npm run lint        # See all lint errors
```

---

## Performance Tips

### Code Splitting
- Use `React.lazy()` for route-based splitting
- Lazy import heavy components
- Use `Suspense` for loading states

### Memoization
```typescript
// For expensive renders
const MyComponent = React.memo(({ data }: Props) => {
  // ...
})

// For expensive computations
const value = useMemo(() => expensiveCalc(data), [data])
```

### Virtual Scrolling
- For lists with 1000+ items
- Use `react-window` library
- Only render visible items

### Bundle Size
- Current: 476.18 kB (139.40 kB gzip)
- Good target: < 150 kB gzip
- Analyze: `npm run build -- --analyze`

---

## Common Issues & Solutions

### TypeScript Error: "Property X does not exist"
**Solution**: Check that the property is defined in the interface
```typescript
// ❌ Missing interface
export const MyComponent: React.FC = ({ title }) => {}

// ✅ With interface
interface Props {
  title: string
}
export const MyComponent: React.FC<Props> = ({ title }) => {}
```

### ESLint Error: "Component should be exported"
**Solution**: Components must be exported as React.FC
```typescript
// ❌ Function declaration
function MyComponent() {}

// ✅ Exported function component
export const MyComponent: React.FC = () => {}
```

### State Not Updating
**Solution**: Zustand requires `set()` to update
```typescript
// ❌ Direct mutation
this.state.items.push(item)

// ✅ Using set
set({ items: [...get().items, item] })
```

### Mobile Layout Breaking
**Solution**: Check Tailwind breakpoints
```bash
# Test at: 375px (mobile), 640px (tablet), 1024px (desktop)
# Use: sm:, md:, lg: prefixes for responsive
```

---

## File Organization

### When Adding New Features

1. **Create component files**
   ```
   src/components/NewFeature.tsx  # Component
   src/components/NewFeature.test.ts # Tests (optional)
   ```

2. **Add to store if needed**
   ```
   src/store/newFeatureStore.ts
   src/store/newFeatureStore.test.ts
   ```

3. **Add utilities if needed**
   ```
   src/utils/newFeatureUtil.ts
   src/utils/newFeatureUtil.test.ts
   ```

4. **Add types if needed**
   ```
   src/types/newFeature.ts
   ```

5. **Update index.ts** if using barrel exports

### Naming Conventions
- **Components**: PascalCase (TaskItem.tsx)
- **Functions/variables**: camelCase (getTasksbyUser)
- **Types/interfaces**: PascalCase (TaskProps)
- **Constants**: UPPER_SNAKE_CASE (MAX_RETRIES)
- **Files**: PascalCase for components, camelCase for utils

---

## Git Workflow

### Commit Style
```bash
# Feature
git commit -m "feat: add achievement notifications"

# Bug fix
git commit -m "fix: correct karma multiplier calculation"

# Documentation
git commit -m "docs: update achievement system docs"

# Refactor
git commit -m "refactor: simplify gamification store"

# Style/Format
git commit -m "style: format code with prettier"

# Tests
git commit -m "test: add achievement trigger tests"
```

### Branch Naming
```bash
git checkout -b feature/achievement-system
git checkout -b fix/karma-calculation
git checkout -b docs/update-readme
```

---

## Production Deployment

### Pre-Deployment
```bash
npm run type-check    # Check types
npm run lint          # Check lint
npm run build         # Build production
npm run test          # Run tests (optional)
```

### Build Output
```
dist/
├── index.html         # Entry point
├── assets/
│   ├── index-*.css    # Styles (9.07 kB gzip)
│   └── index-*.js     # JavaScript (139.40 kB gzip)
└── service-worker.js  # PWA service worker
```

### Environment Variables
```bash
# .env.production
VITE_API_URL=https://api.todone.app
VITE_AUTH_TOKEN_KEY=todone_auth
```

### Deployment Commands
```bash
# Build
npm run build

# Deploy to hosting (provider-specific)
# Example: Vercel
npm i -g vercel
vercel --prod

# Example: GitHub Pages
npm run build
git add dist
git commit -m "build: deploy production"
git push
```

---

## Resources

### Documentation Files
- **AGENTS.md** - Development standards
- **PHASE_4_README.md** - Phase 4 overview
- **PHASE_4_CHECKLIST.md** - All features
- **PRODUCTION_LAUNCH_GUIDE.md** - Deployment guide
- **OPTIONAL_ENHANCEMENTS_ROADMAP.md** - Future features

### Key Component Files
- `src/store/gamificationStore.ts` - Gamification logic
- `src/utils/achievementTriggers.ts` - Achievement conditions
- `src/components/AchievementNotificationCenter.tsx` - Notifications
- `src/components/MobileInboxView.tsx` - Mobile task view

### Configuration Files
- `tsconfig.json` - TypeScript settings
- `.eslintrc.cjs` - Lint rules
- `.prettierrc` - Code formatting
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Tailwind themes

---

## Need Help?

1. Check **this file** for quick answers
2. Review **../AGENTS.md** for standards
3. Look at **existing components** for patterns
4. Check **test files** for examples
5. Review **git history** for similar changes

---

**Last Updated**: December 26, 2025  
**Phase Status**: 98.3% Complete ✅  
**Next**: Production Launch & User Feedback Cycle

Good luck coding! 🚀
