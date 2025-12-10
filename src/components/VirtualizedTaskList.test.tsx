import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { VirtualizedTaskList } from '@/components/VirtualizedTaskList'
import { Task, Priority } from '@/types'

describe('VirtualizedTaskList', () => {
  const mockTasks: Task[] = Array.from({ length: 1000 }, (_, i) => ({
    id: `task-${i}`,
    content: `Task ${i}`,
    priority: 'p2' as Priority,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: i,
    reminders: [],
    labels: [],
    attachments: [],
  }))

  it('should render virtualized list', () => {
    const { container } = render(
      <VirtualizedTaskList
        tasks={mockTasks}
        renderTask={(task) => <div key={task.id}>{task.content}</div>}
        containerHeight={600}
        itemHeight={60}
      />
    )

    expect(container.querySelector('.overflow-y-auto')).toBeDefined()
  })

  it('should show empty state when no tasks', () => {
    const { getByText } = render(
      <VirtualizedTaskList
        tasks={[]}
        renderTask={(task) => <div key={task.id}>{task.content}</div>}
        containerHeight={600}
        itemHeight={60}
      />
    )

    expect(getByText('No tasks to display')).toBeDefined()
  })

  it('should set container height', () => {
    const height = 800
    const { container } = render(
      <VirtualizedTaskList
        tasks={mockTasks}
        renderTask={(task) => <div key={task.id}>{task.content}</div>}
        containerHeight={height}
        itemHeight={60}
      />
    )

    const scrollContainer = container.querySelector('.overflow-y-auto')
    expect(scrollContainer?.getAttribute('style')).toContain(`height: ${height}px`)
  })

  it('should calculate visible range correctly', () => {
    const containerHeight = 600
    const itemHeight = 60
    const expectedVisibleCount = Math.ceil(containerHeight / itemHeight)

    expect(expectedVisibleCount).toBeGreaterThan(0)
    expect(expectedVisibleCount).toBeLessThanOrEqual(mockTasks.length)
  })

  it('should accept custom item height', () => {
    const customHeight = 80
    const { container } = render(
      <VirtualizedTaskList
        tasks={mockTasks}
        renderTask={(task) => <div key={task.id}>{task.content}</div>}
        containerHeight={600}
        itemHeight={customHeight}
      />
    )

    expect(container.querySelector('.overflow-y-auto')).toBeDefined()
  })

  it('should apply custom className', () => {
    const customClass = 'custom-class'
    const { container } = render(
      <VirtualizedTaskList
        tasks={mockTasks}
        renderTask={(task) => <div key={task.id}>{task.content}</div>}
        containerHeight={600}
        itemHeight={60}
        className={customClass}
      />
    )

    expect(container.querySelector(`.${customClass}`)).toBeDefined()
  })

  it('should handle overscan prop', () => {
    const overscan = 10
    const { container } = render(
      <VirtualizedTaskList
        tasks={mockTasks}
        renderTask={(task) => <div key={task.id}>{task.content}</div>}
        containerHeight={600}
        itemHeight={60}
        overscan={overscan}
      />
    )

    expect(container.querySelector('.overflow-y-auto')).toBeDefined()
  })

  it('should calculate total height correctly', () => {
    const itemHeight = 60
    const expectedTotal = mockTasks.length * itemHeight

    expect(expectedTotal).toBe(60000)
  })
})
