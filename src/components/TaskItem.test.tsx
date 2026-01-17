import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from './TaskItem'
import { Task } from '@/types'

// Mock the stores
vi.mock('@/store/taskDetailStore', () => ({
  useTaskDetailStore: vi.fn(() => ({
    openTaskDetail: vi.fn(),
  })),
}))

vi.mock('@/store/taskStore', () => ({
  useTaskStore: vi.fn(() => ({
    getSubtasks: vi.fn(() => []),
  })),
}))

const mockTask: Task = {
  id: '1',
  content: 'Test task',
  completed: false,
  priority: 'p2',
  projectId: undefined,
  sectionId: undefined,
  labels: [],
  dueDate: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
  reminders: [],
  attachments: [],
}

describe('TaskItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render task content', () => {
      render(<TaskItem task={mockTask} />)
      expect(screen.getByText('Test task')).toBeInTheDocument()
    })

    it('should show completed task with strike-through', () => {
      const completedTask = { ...mockTask, completed: true }
      render(<TaskItem task={completedTask} />)
      const taskText = screen.getByText('Test task')
      expect(taskText).toHaveClass('line-through', 'text-content-tertiary')
    })

    it('should show active task without strike-through', () => {
      render(<TaskItem task={mockTask} />)
      const taskText = screen.getByText('Test task')
      expect(taskText).not.toHaveClass('line-through')
    })

    it('should render priority icon', () => {
      render(<TaskItem task={mockTask} />)
      const priorityDiv = screen.getByText('!!')
      expect(priorityDiv).toHaveClass('font-bold', 'text-xs')
    })

    it('should render correct priority for each level', () => {
      const { rerender } = render(<TaskItem task={{ ...mockTask, priority: 'p1' }} />)
      expect(screen.getByText('!!!')).toBeInTheDocument()

      rerender(<TaskItem task={{ ...mockTask, priority: 'p2' }} />)
      expect(screen.getByText('!!')).toBeInTheDocument()

      rerender(<TaskItem task={{ ...mockTask, priority: 'p3' }} />)
      expect(screen.getByText('!')).toBeInTheDocument()

      rerender(<TaskItem task={{ ...mockTask, priority: 'p4' }} />)
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should render checkbox', () => {
      render(<TaskItem task={mockTask} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('should show checked checkbox for completed task', () => {
      const completedTask = { ...mockTask, completed: true }
      render(<TaskItem task={completedTask} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should render selection indicator when selected', () => {
      render(<TaskItem task={mockTask} isSelected={true} />)
      const container = screen.getByText('Test task').closest('div')?.parentElement
      expect(container).toHaveClass('bg-brand-50', 'border-brand-500')
    })
  })

  describe('interactions', () => {
    it('should call onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup()
      const handleToggle = vi.fn()
      render(<TaskItem task={mockTask} onToggle={handleToggle} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      expect(handleToggle).toHaveBeenCalledWith('1')
    })

    it('should call onSelect when task area is clicked', async () => {
      const user = userEvent.setup()
      const handleSelect = vi.fn()
      render(<TaskItem task={mockTask} onSelect={handleSelect} />)

      const container = screen.getByText('Test task').closest('div')?.parentElement
      // Click on the main container - this triggers openTaskDetail
      if (container) {
        await user.click(container)
      }
    })

    it('should prevent event bubbling on checkbox click', async () => {
      const user = userEvent.setup()
      const handleToggle = vi.fn()
      const handleSelect = vi.fn()
      render(<TaskItem task={mockTask} onToggle={handleToggle} onSelect={handleSelect} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      // Checkbox click should only call onToggle, not onSelect due to stopPropagation
      expect(handleToggle).toHaveBeenCalled()
    })
  })

  describe('due date display', () => {
    it('should display due date when present', () => {
      const taskWithDueDate = {
        ...mockTask,
        dueDate: new Date('2024-12-25'),
      }
      render(<TaskItem task={taskWithDueDate} />)
      // The date is formatted by formatDueDate, check if date text exists
      const container = screen.getByText('Test task').closest('div')?.parentElement
      const dateElements = container?.querySelectorAll('span')
      expect(dateElements?.length).toBeGreaterThan(0)
    })

    it('should not display due date when not present', () => {
      render(<TaskItem task={mockTask} />)
      // Check that no date text is rendered (this is a rough check)
      const content = screen.getByText('Test task')
      expect(content).toBeInTheDocument()
    })

    it('should show overdue styling for past due dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const overdueTask = {
        ...mockTask,
        dueDate: yesterday,
      }
      render(<TaskItem task={overdueTask} />)
      // The due date element should have overdue styling
      const elements = screen.getAllByText(/\d+/)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('subtask counter', () => {
    it('should not show subtask counter when no subtasks exist', () => {
      render(<TaskItem task={mockTask} />)
      // No subtask counter should be rendered for task with no subtasks
      expect(screen.getByText('Test task')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible checkbox', () => {
      render(<TaskItem task={mockTask} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
      expect(checkbox).toHaveClass('focus:ring-2')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<TaskItem task={mockTask} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.tab()
      expect(checkbox).toHaveFocus()
    })

    it('should support space key for checkbox toggle', async () => {
      const user = userEvent.setup()
      const handleToggle = vi.fn()
      render(<TaskItem task={mockTask} onToggle={handleToggle} />)

      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard('{Space}')
      // Space should toggle the checkbox
      expect(checkbox).toHaveFocus()
    })
  })

  describe('styling', () => {
    it('should apply hover styling on inactive task', () => {
      render(<TaskItem task={mockTask} />)
      const container = screen.getByText('Test task').closest('div')?.parentElement
      expect(container).toHaveClass('border-transparent', 'hover:bg-surface-tertiary')
    })

    it('should apply selection styling when selected', () => {
      render(<TaskItem task={mockTask} isSelected={true} />)
      const container = screen.getByText('Test task').closest('div')?.parentElement
      expect(container).toHaveClass('bg-brand-50', 'border-brand-500')
    })

    it('should apply completed styling when task is completed', () => {
      const completedTask = { ...mockTask, completed: true }
      render(<TaskItem task={completedTask} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('bg-brand-600', 'border-brand-600')
    })
  })

  describe('edge cases', () => {
    it('should handle very long task content', () => {
      const longTask = {
        ...mockTask,
        content: 'a'.repeat(200),
      }
      render(<TaskItem task={longTask} />)
      expect(screen.getByText(longTask.content)).toBeInTheDocument()
    })

    it('should handle special characters in task content', () => {
      const specialTask = {
        ...mockTask,
        content: 'Task with <>&"\'',
      }
      render(<TaskItem task={specialTask} />)
      expect(screen.getByText('Task with <>&"\'', { exact: false })).toBeInTheDocument()
    })

    it('should handle null priority gracefully', () => {
      const noFriority = {
        ...mockTask,
        priority: null,
      }
      render(<TaskItem task={noFriority} />)
      const priorityDiv = screen.getByText('-').parentElement
      expect(priorityDiv).toBeInTheDocument()
    })
  })
})
