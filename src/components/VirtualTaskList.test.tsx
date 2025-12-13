import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VirtualTaskList } from './VirtualTaskList'
import type { Task } from '@/types'

// Mock TaskItem component
vi.mock('./TaskItem', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TaskItem: ({ task, onToggle, onSelect }: any) => (
    <div data-testid={`task-${task.id}`} onClick={() => onSelect?.(task.id)}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle?.(task.id)}
        data-testid={`toggle-${task.id}`}
      />
      {task.content}
    </div>
  ),
}))

const mockTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
  id: `task-${i}`,
  content: `Task ${i}`,
  description: '',
  completed: false,
  priority: 'p3' as const,
  dueDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: undefined,
  sectionId: undefined,
  labels: [],
  parentTaskId: undefined,
  order: i,
  attachments: [],
  reminders: [],
  completedAt: undefined,
}))

describe('VirtualTaskList', () => {
  it('renders empty message when no tasks', () => {
    const { container } = render(
      <VirtualTaskList
        tasks={[]}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        emptyMessage="No tasks available"
      />
    )
    expect(screen.getByText('No tasks available')).toBeDefined()
    expect(container.querySelectorAll('[data-testid^="task-"]')).toHaveLength(0)
  })

  it('renders visible tasks only', () => {
    const { container } = render(
      <VirtualTaskList
        tasks={mockTasks}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        itemHeight={56}
        containerHeight={600}
      />
    )
    // Should only render visible items + buffer
    const renderedTasks = container.querySelectorAll('[data-testid^="task-"]')
    expect(renderedTasks.length).toBeLessThan(mockTasks.length)
    expect(renderedTasks.length).toBeGreaterThan(0)
  })

  it('calls onToggle when task checkbox is clicked', async () => {
    const onToggle = vi.fn()
    const { container } = render(
      <VirtualTaskList
        tasks={mockTasks.slice(0, 10)}
        onToggle={onToggle}
        onSelect={vi.fn()}
        itemHeight={56}
        containerHeight={400}
      />
    )
    const toggleButton = container.querySelector('[data-testid="toggle-task-0"]') as HTMLInputElement
    expect(toggleButton).toBeDefined()
    toggleButton?.click()
    expect(onToggle).toHaveBeenCalledWith('task-0')
  })

  it('calls onSelect when task is clicked', async () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VirtualTaskList
        tasks={mockTasks.slice(0, 10)}
        onToggle={vi.fn()}
        onSelect={onSelect}
        itemHeight={56}
        containerHeight={400}
      />
    )
    const taskElement = container.querySelector('[data-testid="task-task-0"]') as HTMLDivElement
    expect(taskElement).toBeDefined()
    taskElement?.click()
    expect(onSelect).toHaveBeenCalledWith('task-0')
  })

  it('highlights selected task', () => {
    const { container } = render(
      <VirtualTaskList
        tasks={mockTasks.slice(0, 10)}
        selectedTaskId="task-0"
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        itemHeight={56}
        containerHeight={400}
      />
    )
    const taskElement = container.querySelector('[data-testid="task-task-0"]')
    expect(taskElement).toBeDefined()
  })

  it('has correct role and aria labels', () => {
    const { container } = render(
      <VirtualTaskList
        tasks={mockTasks.slice(0, 20)}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        itemHeight={56}
        containerHeight={400}
      />
    )
    const scrollContainer = container.querySelector('[role="list"]') as HTMLDivElement
    expect(scrollContainer).toBeDefined()
    expect(scrollContainer?.getAttribute('aria-label')).toBe('Tasks')
  })

  it('handles custom empty message', () => {
    const customMessage = 'Custom empty message'
    render(
      <VirtualTaskList
        tasks={[]}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        emptyMessage={customMessage}
      />
    )
    expect(screen.getByText(customMessage)).toBeDefined()
  })

  it('respects selected task ID', () => {
    const { container, rerender } = render(
      <VirtualTaskList
        tasks={mockTasks.slice(0, 10)}
        selectedTaskId="task-0"
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    )

    let taskElement = container.querySelector('[data-testid="task-task-0"]')
    expect(taskElement).toBeDefined()

    rerender(
      <VirtualTaskList
        tasks={mockTasks.slice(0, 10)}
        selectedTaskId="task-5"
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    )

    taskElement = container.querySelector('[data-testid="task-task-5"]')
    expect(taskElement).toBeDefined()
  })
})
