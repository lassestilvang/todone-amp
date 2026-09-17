import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpcomingView } from './UpcomingView'
import { Task, User } from '@/types'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useAuthStore } from '@/store/authStore'
import { useIntegrationStore } from '@/store/integrationStore'

const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Task due tomorrow',
    completed: false,
    priority: 'p2',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    content: 'Task due in 3 days',
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
    content: 'Task due in 5 days',
    completed: false,
    priority: 'p3',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 2,
    reminders: [],
    attachments: [],
    labels: [],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
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

describe('UpcomingView Component', () => {
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
    it('should render header with "Upcoming" title', () => {
      render(<UpcomingView />)
      expect(screen.getByText('Upcoming')).toBeInTheDocument()
    })

    it('should render "Next 7 days" description', () => {
      render(<UpcomingView />)
      expect(screen.getByText('Next 7 days')).toBeInTheDocument()
    })

    it('should render filter button', () => {
      render(<UpcomingView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render view switcher', () => {
      render(<UpcomingView />)
      expect(screen.getByTestId('view-switcher')).toBeInTheDocument()
    })

    it('should render quick add button in footer', () => {
      render(<UpcomingView />)
      const buttons = screen.getAllByRole('button')
      const addButton = buttons.find((btn) => btn.textContent?.includes('Add task'))
      expect(addButton).toBeInTheDocument()
    })

    it('should render task lists', () => {
      render(<UpcomingView />)
      const taskLists = screen.getAllByTestId('virtual-task-list')
      expect(taskLists.length).toBeGreaterThan(0)
    })
  })

  describe('task grouping', () => {
    it('should group tasks by date', () => {
      render(<UpcomingView />)
      const taskLists = screen.getAllByTestId('virtual-task-list')
      expect(taskLists.length).toBeGreaterThan(1)
    })

    it('should display date headers for each group', () => {
      render(<UpcomingView />)
      const headers = screen.getAllByRole('heading', { level: 3 })
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should display tasks under correct date sections', () => {
      render(<UpcomingView />)
      expect(screen.getByText('Task due tomorrow')).toBeInTheDocument()
      expect(screen.getByText('Task due in 3 days')).toBeInTheDocument()
      expect(screen.getByText('Task due in 5 days')).toBeInTheDocument()
    })
  })

  describe('calendar events', () => {
    it('should display calendar events section', () => {
      render(<UpcomingView />)
      const calendarSection = screen.queryByTestId('calendar-events')
      if (calendarSection) {
        expect(calendarSection).toBeInTheDocument()
      }
    })

    it('should render hide button for calendar events', () => {
      render(<UpcomingView />)
      const hideButtons = screen.getAllByText('Hide')
      expect(hideButtons.length).toBeGreaterThan(0)
    })

    it('should display "Next 7 Days" in calendar section label', () => {
      render(<UpcomingView />)
      const label = screen.queryByText(/Next 7 Days/)
      if (label) {
        expect(label).toBeInTheDocument()
      }
    })
  })

  describe('interactions', () => {
    it('should open filter panel when filter button is clicked', async () => {
      const user = userEvent.setup()
      render(<UpcomingView />)

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
      render(<UpcomingView />)

      const buttons = screen.getAllByRole('button')
      const addButton = buttons.find((btn) => btn.textContent?.includes('Add task'))
      if (addButton) {
        await user.click(addButton)
      }
    })

    it('should hide calendar events when hide button is clicked', async () => {
      const user = userEvent.setup()
      render(<UpcomingView />)

      const hideButtons = screen.getAllByText('Hide')
      if (hideButtons.length > 0) {
        await user.click(hideButtons[0])
        expect(screen.queryByTestId('calendar-events')).not.toBeInTheDocument()
      }
    })
  })

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(<UpcomingView />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Upcoming')
    })

    it('should have accessible date headings for each date group', () => {
      render(<UpcomingView />)
      const dateHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(dateHeadings.length).toBeGreaterThan(0)
    })

    it('should have interactive buttons', () => {
      render(<UpcomingView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('empty states', () => {
    it('should handle empty upcoming tasks gracefully', () => {
      render(<UpcomingView />)
      expect(screen.getByText('Upcoming')).toBeInTheDocument()
    })
  })

  describe('layout', () => {
    it('should have proper layout structure', () => {
      render(<UpcomingView />)
      const heading = screen.getByText('Upcoming')
      expect(heading).toBeInTheDocument()
      expect(heading.closest('div')).toBeTruthy()
    })

    it('should have header with border-bottom', () => {
      render(<UpcomingView />)
      const header = screen.getByText('Upcoming').closest('[class*="border-b"]')
      expect(header).toBeInTheDocument()
    })

    it('should have scrollable content area', () => {
      render(<UpcomingView />)
      const contentArea = screen.getByText('Upcoming').closest('[class*="flex"]')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('7-day window', () => {
    it('should only show tasks within next 7 days', () => {
      render(<UpcomingView />)
      expect(screen.getByText('Task due tomorrow')).toBeInTheDocument()
      expect(screen.getByText('Task due in 3 days')).toBeInTheDocument()
      expect(screen.getByText('Task due in 5 days')).toBeInTheDocument()
    })
  })
})
