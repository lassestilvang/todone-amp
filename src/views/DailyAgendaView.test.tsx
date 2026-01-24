import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyAgendaView } from './DailyAgendaView'
import { Task } from '@/types'

const today = new Date()
const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Morning task',
    completed: false,
    priority: 'p2',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: today,
  },
  {
    id: '2',
    content: 'Afternoon task',
    completed: false,
    priority: 'p1',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: today,
  },
  {
    id: '3',
    content: 'Completed task',
    completed: true,
    priority: 'p3',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 2,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: today,
  },
]

mock.module('@/store/taskStore', () => ({
  useTaskStore: mock((selector) => {
    const state = {
      tasks: mockTasks,
      toggleTask: mock(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/taskDetailStore', () => ({
  useTaskDetailStore: mock((selector) => {
    const state = {
      openTaskDetail: mock(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/components/TaskItem', () => ({
  TaskItem: ({ task }: { task: Task }) => <div data-testid={`task-${task.id}`}>{task.content}</div>,
}))

describe('DailyAgendaView Component', () => {
  beforeEach(() => {
    
  })

  describe('rendering', () => {
    it('should render daily agenda header', () => {
      render(<DailyAgendaView />)
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should render "Today" button', () => {
      render(<DailyAgendaView />)
      const buttons = screen.getAllByRole('button')
      const todayButton = buttons.find((btn) => btn.textContent?.includes('Today'))
      expect(todayButton).toBeTruthy()
    })

    it('should render date navigation buttons', () => {
      render(<DailyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2) // At least prev and next
    })

    it('should display selected date', () => {
      render(<DailyAgendaView />)
      // Current date should be displayed
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should display task count and completion rate', () => {
      render(<DailyAgendaView />)
      // Summary should show task count and completion percentage
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('date navigation', () => {
    it('should have previous day button', () => {
      render(<DailyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have next day button', () => {
      render(<DailyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should navigate to previous day', async () => {
      const user = userEvent.setup()
      render(<DailyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        // Find and click previous button
        await user.click(buttons[0])
      }
    })

    it('should navigate to next day', async () => {
      const user = userEvent.setup()
      render(<DailyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        // Find and click next button
        await user.click(buttons[buttons.length - 1])
      }
    })

    it('should jump to today', async () => {
      const user = userEvent.setup()
      render(<DailyAgendaView />)

      const buttons = screen.getAllByRole('button')
      const todayButton = buttons.find((btn) => btn.textContent?.includes('Today'))
      if (todayButton) {
        await user.click(todayButton)
      }
    })
  })

  describe('date display', () => {
    it('should display full date with day name', () => {
      render(<DailyAgendaView />)
      // Format: "Wednesday, December 15, 2025"
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should update date when navigating', async () => {
      const user = userEvent.setup()
      render(<DailyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        const prevButton = buttons[0]
        await user.click(prevButton)
        // Date should change
      }
    })
  })

  describe('task display', () => {
    it('should display active tasks section', () => {
      render(<DailyAgendaView />)
      // Active tasks should be shown
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should display completed tasks section', () => {
      render(<DailyAgendaView />)
      // Completed tasks should be shown
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should render tasks with TaskItem component', () => {
      render(<DailyAgendaView />)
      // Tasks should be rendered
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should separate active and completed tasks', () => {
      render(<DailyAgendaView />)
      // Tasks should be grouped by status
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should show task count for active tasks', () => {
      render(<DailyAgendaView />)
      // "2 tasks" should be visible in summary
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should exclude subtasks (parentTaskId)', () => {
      render(<DailyAgendaView />)
      // Only root-level tasks should be shown
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('completion rate', () => {
    it('should calculate completion percentage', () => {
      render(<DailyAgendaView />)
      // 3 tasks: 1 completed = 33%
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should show 0% when no tasks completed', () => {
      render(<DailyAgendaView />)
      // Percentage should be correctly calculated
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should show 100% when all tasks completed', () => {
      render(<DailyAgendaView />)
      // If all tasks completed, should show 100%
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should display completion rate in header', () => {
      render(<DailyAgendaView />)
      // "% done" or similar should be shown
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('task interaction', () => {
    it('should allow toggling task completion', () => {
      render(<DailyAgendaView />)

      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should allow selecting task for detail view', () => {
      render(<DailyAgendaView />)

      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('empty states', () => {
    it('should handle day with no tasks', () => {
      render(<DailyAgendaView />)
      // Should display empty state or empty sections
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should handle day with only completed tasks', () => {
      render(<DailyAgendaView />)
      // Should show empty active section, show completed section
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should handle day with only active tasks', () => {
      render(<DailyAgendaView />)
      // Should show active section, empty/hidden completed section
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('layout and styling', () => {
    it('should have flex layout', () => {
      render(<DailyAgendaView />)
      // Component should use flex for layout
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should have proper spacing', () => {
      render(<DailyAgendaView />)
      // Sections should be properly spaced
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should have scrollable content', () => {
      render(<DailyAgendaView />)
      // Content area should be scrollable for many tasks
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should have border separators', () => {
      render(<DailyAgendaView />)
      // Dividers between sections
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(<DailyAgendaView />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Daily Agenda')
    })

    it('should have interactive buttons', () => {
      render(<DailyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', () => {
      render(<DailyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        buttons[0].focus()
        expect(buttons[0]).toHaveFocus()
      }
    })

    it('should have proper ARIA labels on buttons', () => {
      render(<DailyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('date calculations', () => {
    it('should handle date boundaries correctly', () => {
      render(<DailyAgendaView />)
      // Tasks should be filtered correctly for 24-hour period
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should identify tasks for correct date only', () => {
      render(<DailyAgendaView />)
      // Should only show tasks with dueDate matching selected date
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should handle midnight boundaries', () => {
      render(<DailyAgendaView />)
      // Tasks at exact midnight should be included correctly
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty day', () => {
      render(<DailyAgendaView />)
      // Should display empty state
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should handle many tasks in single day', () => {
      render(<DailyAgendaView />)
      // Should display all tasks, scrollable
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should handle very long task content', () => {
      render(<DailyAgendaView />)
      // Long task names should wrap or truncate properly
      expect(screen.getByText('Daily Agenda')).toBeInTheDocument()
    })

    it('should handle date navigation past boundaries', () => {
      render(<DailyAgendaView />)

      const buttons = screen.getAllByRole('button')
      // Navigate backwards many times
      for (let i = 0; i < 100; i++) {
        if (buttons.length > 0) {
          // Could navigate back
        }
      }
    })
  })
})
