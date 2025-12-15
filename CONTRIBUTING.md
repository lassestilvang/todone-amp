# Contributing to Todone

Thank you for your interest in contributing to Todone! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our [Code of Conduct](./docs/CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- GitHub account

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/todone-amp.git
   cd todone-amp
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/lassestilvang/todone-amp.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Before You Start

1. **Check existing issues** - Make sure your feature/bug hasn't been reported
2. **Discuss major changes** - Open an issue to discuss substantial changes
3. **Read the architecture** - See [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. **Review code standards** - Follow patterns in the codebase

### Making Changes

1. **Make small, focused changes** - One feature or fix per branch
2. **Add tests** - All new functionality must have tests
3. **Update types** - Use strict TypeScript mode (no `any` types)
4. **Write clear commits** - Use descriptive commit messages

### Commit Messages

Follow conventional commits format:

```
type(scope): description

Body (optional)

Footer (optional)
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting (Prettier, ESLint)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding or updating tests
- `chore:` - Build, dependencies, etc.

**Examples:**
```
feat(quick-add): add voice input to quick add modal
fix(calendar): correct month navigation on mobile
docs(readme): update installation instructions
test(task-store): add tests for task filtering
```

### Code Quality Checks

Before committing, ensure all checks pass:

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

All checks must pass with 0 errors/warnings.

## Testing Requirements

### Test Coverage

- **New utilities** - 100% test coverage
- **New components** - Unit tests for key functionality
- **New stores** - Full store method coverage
- **Bug fixes** - Add test that reproduces the bug

### Writing Tests

**Example utility test:**
```typescript
// src/utils/dateUtils.test.ts
import { isToday, isTomorrow } from './dateUtils'

describe('dateUtils', () => {
  it('should return true for today', () => {
    const today = new Date()
    expect(isToday(today)).toBe(true)
  })

  it('should return false for past dates', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday)).toBe(false)
  })
})
```

**Example component test:**
```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vitest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalled()
  })
})
```

**Example store test:**
```typescript
// src/store/taskStore.test.ts
import { useTaskStore } from './taskStore'
import { renderHook, act } from '@testing-library/react'

describe('TaskStore', () => {
  it('should add task', () => {
    const { result } = renderHook(() => useTaskStore())
    
    act(() => {
      result.current.addTask({
        id: '1',
        title: 'Test task',
        completed: false,
        // ... other properties
      })
    })
    
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test task')
  })
})
```

## Code Standards

### TypeScript

- **Strict mode enabled** - All TypeScript must be strict mode compliant
- **No `any` types** - Use proper typing
- **Exported types** - Document public interfaces
- **Comments for complex logic** - Explain the "why"

**Example:**
```typescript
// ✅ Good
interface TaskFilterOptions {
  status?: 'completed' | 'pending'
  priority?: number
  projectId?: string
}

export const filterTasks = (
  tasks: Task[],
  options: TaskFilterOptions
): Task[] => {
  return tasks.filter(task => {
    if (options.status && task.status !== options.status) return false
    if (options.priority && task.priority !== options.priority) return false
    if (options.projectId && task.projectId !== options.projectId) return false
    return true
  })
}

// ❌ Bad
export const filterTasks = (tasks: any[], options: any): any[] => {
  // ...
}
```

### Components

- **Functional components only** - No class components
- **Export components** - Explicit exports for linting
- **Memoize when needed** - Use `memo()` for expensive components
- **Use hooks** - Zustand hooks for state, custom hooks for logic

**Example:**
```typescript
// ✅ Good
interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  isDragging?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  isDragging
}) => {
  return (
    <div className={isDragging ? 'dragging' : ''}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Toggle ${task.title}`}
      />
      <span>{task.title}</span>
    </div>
  )
}

// ❌ Bad - Unnamed export, missing types, no aria labels
export default (props: any) => (
  <input
    type="checkbox"
    onChange={() => props.onToggle()}
  />
)
```

### Styling

- **Use Tailwind CSS** - No inline styles
- **Follow design system** - Use defined colors and spacing
- **Responsive first** - Mobile-first design
- **Dark mode support** - Test in dark mode

**Example:**
```tsx
// ✅ Good
<div className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-slate-900">
  <button className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md transition">
    Click me
  </button>
</div>

// ❌ Bad - Inline styles, no dark mode
<div style={{ display: 'flex', padding: '10px', backgroundColor: '#fff' }}>
  <button style={{ padding: '10px', background: '#00aa00' }}>Click</button>
</div>
```

## Documentation

### Code Comments

Add comments for:
- Complex algorithms
- Non-obvious logic
- Important business rules
- Type explanations

```typescript
// Calculate karma points with diminishing returns
// Formula: base_points * 0.9^(days_since_completion)
const calculateKarmaWithDecay = (points: number, daysPassed: number): number => {
  return Math.round(points * Math.pow(0.9, daysPassed))
}
```

### JSDoc Comments

Document public functions and components:

```typescript
/**
 * Filters tasks by multiple criteria
 * @param tasks - Array of tasks to filter
 * @param options - Filter options (status, priority, projectId)
 * @returns Filtered task array
 * @example
 * const completed = filterTasks(tasks, { status: 'completed' })
 */
export const filterTasks = (
  tasks: Task[],
  options: TaskFilterOptions
): Task[] => {
  // ...
}
```

## Pull Request Process

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request on GitHub**
   - Use descriptive title
   - Reference related issues (#123)
   - Describe what changed and why
   - Add screenshots for UI changes

3. **Fill PR template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test these changes

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

4. **Address review feedback**
   - Make requested changes
   - Push updates (same branch)
   - Resolve conversations

5. **Merge**
   - Maintainer will merge when approved
   - Branch automatically deleted

## Performance Considerations

- **Minimize re-renders** - Use `memo()` and `useCallback()`
- **Debounce user input** - Use `useDebounce()` for search/filter
- **Lazy load components** - Use `React.lazy()` for heavy components
- **Optimize queries** - Use database indices, avoid N+1 queries
- **Bundle size** - Check impact with `npm run build`

## Accessibility

All code must meet WCAG 2.1 AA standards:

- **Keyboard navigation** - All features accessible via keyboard
- **ARIA labels** - Proper labels for screen readers
- **Color contrast** - Minimum 4.5:1 ratio
- **Focus indicators** - Always visible
- **Semantic HTML** - Use proper elements

**Example:**
```tsx
// ✅ Good - accessible
<button
  type="button"
  onClick={handleComplete}
  aria-label={`Mark ${task.title} as complete`}
  className="focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
>
  <CheckIcon aria-hidden="true" />
</button>

// ❌ Bad - not accessible
<div onClick={handleComplete} className="cursor-pointer">
  ✓
</div>
```

## Getting Help

- **Documentation** - See [docs/](./docs/) directory
- **Architecture** - Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Code Examples** - Look at similar existing code
- **GitHub Issues** - Ask questions in relevant issues
- **GitHub Discussions** - Start a discussion for ideas

## Common Issues

### Tests Failing After Changes

```bash
# Regenerate snapshots if you changed UI
npm run test -- -u

# Run tests in watch mode for faster iteration
npm run test -- --watch
```

### Type Errors

```bash
# Check all TypeScript errors
npm run type-check

# VS Code might show errors even if correct - restart IDE
```

### Linting Errors

```bash
# Fix auto-fixable errors
npm run lint -- --fix

# Check specific file
npm run lint -- src/file.ts
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Review Process

### What Reviewers Look For

1. **Code Quality** - Follows standards and patterns
2. **Tests** - Sufficient test coverage
3. **Performance** - No performance regressions
4. **Accessibility** - WCAG compliant
5. **Documentation** - Changes documented
6. **No Warnings** - ESLint/TypeScript pass

### How to Speed Up Review

- Small focused PRs are easier to review
- Explain the "why" in PR description
- Ask questions if requirements unclear
- Follow code standards from the start
- Test thoroughly before submitting

## Release Process

Releases follow semantic versioning:
- **Major (X.0.0)** - Breaking changes
- **Minor (0.X.0)** - New features
- **Patch (0.0.X)** - Bug fixes

Only maintainers create releases.

## Community

- **Be respectful** - Treat everyone with respect
- **Be helpful** - Help others learn and grow
- **Be constructive** - Provide actionable feedback
- **Report issues** - Report bugs or security concerns appropriately
- **Share ideas** - Suggest features and improvements

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Check [FAQ](./docs/FAQ.md) (if exists)
- Open a GitHub Discussion
- Comment on relevant issue
- Reach out to maintainers

---

Thank you for contributing to Todone! We appreciate your time and effort. 🚀
