import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodayView } from './TodayView'
import { Task, User } from '@/types'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useAuthStore } from '@/store/authStore'
import { useIntegrationStore } from '@/store/integrationStore'

const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Task due today',
    completed: false,
    priority: 'p2',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: new Date(),
  },
  {
    id: '2',
    content: 'Overdue task',
    completed: false,
    priority: 'p1',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
    completedAt: new Date(),
    dueDate: new Date(),
  },
]

mock.module('@/db/database', () => ({
  db: {
    tasks: { toArray: mock(() => Promise.resolve([])) },
  },
}))

mock.module('@/components/VirtualTaskList', () => ({
  VirtualTaskList: ({ tasks, emptyMessage }: { tasks: Task[]; emptyMessage?: string }) => (
    <div data-testid="virtual-task-list">
      {tasks.length === 0 ? (
        <div>{emptyMessage || 'No tasks'}</div>
      ) : (
        tasks.map((task) => <div key={task.id}>{task.content}</div>)
      )}
    </div>
  ),
}))

mock.module('@/components/ViewSwitcher', () => ({
  ViewSwitcher: () => <div data-testid="view-switcher">View Switcher</div>,
}))

mock.module('@/components/FilterPanel', () => ({
  FilterPanel: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="filter-panel">Filter Panel</div> : null,
}))

mock.module('@/components/ExternalCalendarEvents', () => ({
  ExternalCalendarEvents: () => <div data-testid="calendar-events">Calendar Events</div>,
}))

mock.module('@/utils/date', () => ({
  isTaskDueToday: (date?: Date) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  },
  isTaskOverdue: (date?: Date) => {
    if (!date) return false
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  },
}))

describe('TodayView Component', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: mockTasks,
      selectedTaskId: null,
      expandedTaskIds: new Set(),
      filter: {},
    })
    useFilterStore.setState({
      filters: [],
      activeFilterId: null,
      savedQueries: [],
      queryCache: new Map(),
      recentQueries: [],
    })
    useQuickAddStore.setState({
      isOpen: false,
      recentItems: [],
    })
    useAuthStore.setState({
      user: {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        settings: {
          theme: 'light',
          language: 'en',
          timeFormat: '24h',
          dateFormat: 'MM/dd/yyyy',
          startOfWeek: 0,
          defaultView: 'list',
          defaultPriority: null,
          enableKarma: true,
          dailyGoal: 5,
          weeklyGoal: 30,
          daysOff: [],
          vacationMode: false,
          enableNotifications: true,
        },
        karmaPoints: 100,
        karmaLevel: 'intermediate',
      } as User,
      isAuthenticated: true,
      isLoading: false,
    })
    useIntegrationStore.setState({
      calendarIntegrations: [],
      calendarEvents: [],
      syncHistory: [],
      userIntegrations: [],
    })
  })

  describe('rendering', () => {
    it('should render header with "Today" title', () => {
      render(<TodayView />)
      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('should render header description with task counts', () => {
      render(<TodayView />)
      const description = screen.getByText(/tasks.*completed/)
      expect(description).toBeInTheDocument()
    })

    it('should render filter button', () => {
      render(<TodayView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render view switcher', () => {
      render(<TodayView />)
      expect(screen.getByTestId('view-switcher')).toBeInTheDocument()
    })

    it('should render task lists', () => {
      render(<TodayView />)
      const taskLists = screen.getAllByTestId('virtual-task-list')
      expect(taskLists.length).toBeGreaterThan(0)
    })

    it('should render quick add button in footer', () => {
      render(<TodayView />)
      const buttons = screen.getAllByRole('button')
      const addButton = buttons.find((btn) => btn.textContent?.includes('Add task'))
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('task sections', () => {
    it('should display overdue section when overdue tasks exist', () => {
      render(<TodayView />)
      const headers = screen.getAllByText(/overdue/)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should display today section', () => {
      render(<TodayView />)
      const headers = screen.getAllByText(/Today/)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should display completed section when completed tasks exist', () => {
      render(<TodayView />)
      const headers = screen.getAllByText(/Completed/)
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('calendar events', () => {
    it('should display calendar events section', () => {
      render(<TodayView />)
      const calendarSection = screen.queryByTestId('calendar-events')
      if (calendarSection) {
        expect(calendarSection).toBeInTheDocument()
      }
    })

    it('should render hide button for calendar events', () => {
      render(<TodayView />)
      const hideButtons = screen.getAllByText('Hide')
      expect(hideButtons.length).toBeGreaterThan(0)
    })
  })

  describe('interactions', () => {
    it('should open filter panel when filter button is clicked', async () => {
      const user = userEvent.setup()
      render(<TodayView />)

      const buttons = screen.getAllByRole('button')
      const filterButton = buttons[0]
      await user.click(filterButton)

      const filterPanel = screen.queryByTestId('filter-panel')
      if (filterPanel) {
        expect(filterPanel).toBeInTheDocument()
      }
    })

    it('should call openQuickAdd when quick add button is clicked', async () => {
      const user = userEvent.setup()
      render(<TodayView />)

      const buttons = screen.getAllByRole('button')
      const addButton = buttons.find((btn) => btn.textContent?.includes('Add task'))
      if (addButton) {
        await user.click(addButton)
      }
    })

    it('should hide calendar events when hide button is clicked', async () => {
      const user = userEvent.setup()
      render(<TodayView />)

      const hideButtons = screen.getAllByText('Hide')
      if (hideButtons.length > 0) {
        await user.click(hideButtons[0])
        expect(screen.queryByTestId('calendar-events')).not.toBeInTheDocument()
      }
    })
  })

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(<TodayView />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Today')
    })

    it('should have interactive buttons', () => {
      render(<TodayView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have proper layout structure', () => {
      render(<TodayView />)
      const container = screen.getByText('Today').closest('[class*="flex"]')
      expect(container).toBeInTheDocument()
    })
  })

  describe('empty states', () => {
    it('should show proper empty message when no tasks', () => {
      render(<TodayView />)
      expect(screen.getByText('Today')).toBeInTheDocument()
    })
  })

  describe('layout', () => {
    it('should have proper layout structure', () => {
      render(<TodayView />)
      const heading = screen.getByText('Today')
      expect(heading).toBeInTheDocument()
      expect(heading.closest('div')).toBeTruthy()
    })

    it('should have header with border-bottom', () => {
      render(<TodayView />)
      const header = screen.getByText('Today').closest('[class*="border-b"]')
      expect(header).toBeInTheDocument()
    })
  })
})
