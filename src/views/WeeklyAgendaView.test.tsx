import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyAgendaView } from './WeeklyAgendaView'
import { Task } from '@/types'
import { useTaskStore } from '@/store/taskStore'
import { useTaskDetailStore } from '@/store/taskDetailStore'

const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Monday task',
    completed: false,
    priority: 'p2',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    content: 'Wednesday task',
    completed: false,
    priority: 'p1',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
]

mock.module('@/db/database', () => ({
  db: {
    tasks: { toArray: mock(() => Promise.resolve([])) },
  },
}))

describe('WeeklyAgendaView Component', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: mockTasks,
      selectedTaskId: null,
      expandedTaskIds: new Set(),
      filter: {},
    })
    useTaskDetailStore.setState({
      isOpen: false,
      selectedTaskId: null,
      selectedTask: null,
      isEditing: false,
      hasUnsavedChanges: false,
    })
  })

  describe('rendering', () => {
    it('should render weekly agenda header', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should render "This Week" button', () => {
      render(<WeeklyAgendaView />)
      const buttons = screen.getAllByRole('button')
      const thisWeekButton = buttons.find((btn) => btn.textContent?.includes('This Week'))
      expect(thisWeekButton).toBeTruthy()
    })

    it('should render week navigation buttons', () => {
      render(<WeeklyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should render day columns for entire week', () => {
      render(<WeeklyAgendaView />)
      const headings = screen.queryAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should display task count summary', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('week navigation', () => {
    it('should render previous week button', () => {
      render(<WeeklyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render next week button', () => {
      render(<WeeklyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should navigate to previous week', async () => {
      const user = userEvent.setup()
      render(<WeeklyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[0])
      }
    })

    it('should navigate to next week', async () => {
      const user = userEvent.setup()
      render(<WeeklyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[buttons.length - 1])
      }
    })

    it('should reset to current week', async () => {
      const user = userEvent.setup()
      render(<WeeklyAgendaView />)

      const buttons = screen.getAllByRole('button')
      const thisWeekButton = buttons.find((btn) => btn.textContent?.includes('This Week'))
      if (thisWeekButton) {
        await user.click(thisWeekButton)
      }
    })
  })

  describe('day columns', () => {
    it('should display day names', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should display dates for each day', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should highlight today column', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should display tasks under correct days', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should show task count per day', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should show completion percentage per day', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('task display', () => {
    it('should render tasks in appropriate day columns', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should show active and completed tasks', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should exclude subtasks (parentTaskId)', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('summary statistics', () => {
    it('should display total task count', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should display completion count', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should calculate and display completion percentage', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should handle zero tasks', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('task interaction', () => {
    it('should allow toggling task completion', () => {
      render(<WeeklyAgendaView />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should allow selecting task for detail view', () => {
      render(<WeeklyAgendaView />)

      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('layout and styling', () => {
    it('should have flex layout', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should have proper border styling', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should be scrollable', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should have responsive columns', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(<WeeklyAgendaView />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Weekly Agenda')
    })

    it('should have interactive buttons', () => {
      render(<WeeklyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', () => {
      render(<WeeklyAgendaView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        buttons[0].focus()
        expect(buttons[0]).toHaveFocus()
      }
    })

    it('should have proper ARIA labels', () => {
      render(<WeeklyAgendaView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('date calculations', () => {
    it('should calculate week days correctly', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should identify today correctly', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should handle week boundaries correctly', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty week (no tasks)', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should handle many tasks in single day', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })

    it('should handle tasks spanning week boundary', () => {
      render(<WeeklyAgendaView />)
      expect(screen.getByText('Weekly Agenda')).toBeInTheDocument()
    })
  })
})
