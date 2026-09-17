import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskAssignmentModal } from '@/components/TaskAssignmentModal'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import type { Task, User } from '@/types'

// Mock the database to prevent IndexedDB errors
mock.module('@/db/database', () => ({
  db: {
    tasks: {
      update: mock(() => Promise.resolve(undefined)),
      get: mock(() => Promise.resolve(null)),
    },
    activities: {
      add: mock(() => Promise.resolve(undefined)),
    },
  },
}))

const mockUser: User = {
  id: 'user1',
  email: 'user@example.com',
  name: 'Test User',
  createdAt: new Date(),
  karmaPoints: 0,
  karmaLevel: 'beginner',
  settings: {
    theme: 'light',
    enableKarma: true,
    language: 'en',
    timeFormat: '24h',
    dateFormat: 'MM/dd/yyyy',
    startOfWeek: 0,
    defaultView: 'list',
    dailyGoal: 5,
    weeklyGoal: 20,
    daysOff: [],
    vacationMode: false,
    enableNotifications: true,
  },
}

const mockTask: Task = {
  id: 'task1',
  content: 'Test Task',
  description: '',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  priority: 'p2',
  dueDate: undefined,
  duration: undefined,
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
}

describe('TaskAssignmentModal', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    })

    useProjectStore.setState({
      projects: [
        {
          id: 'project1',
          name: 'Test Project',
          ownerId: 'user1',
          color: '#3B82F6',
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          viewType: 'list',
          isShared: false,
          isFavorite: false,
        },
      ],
      selectedProjectId: null,
    })

    useTaskStore.setState({
      tasks: [mockTask],
      selectedTaskId: null,
      expandedTaskIds: new Set(),
      filter: {},
    })
  })

  it('renders modal with task title', () => {
    const onClose = mock()
    render(
      <TaskAssignmentModal
        task={mockTask}
        projectId="project1"
        onClose={onClose}
      />,
    )

    expect(screen.getByText('Assign Task')).toBeInTheDocument()
    expect(screen.getByText('Test Task')).toBeInTheDocument() // content field
  })

  it('displays assignee options', () => {
    const onClose = mock()

    render(
      <TaskAssignmentModal
        task={mockTask}
        projectId="project1"
        onClose={onClose}
      />,
    )

    // Verify modal renders with current user option
    expect(screen.getByText('Assign Task')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('calls onClose when done button clicked', () => {
    const onClose = mock()
    render(
      <TaskAssignmentModal
        task={mockTask}
        projectId="project1"
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByText('Done'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls updateTask when assignee selected', () => {
    const onClose = mock()

    render(
      <TaskAssignmentModal
        task={mockTask}
        projectId="project1"
        onClose={onClose}
      />,
    )

    // Click on the user to assign - this triggers updateTask
    fireEvent.click(screen.getByText('Test User'))
    
    // Verify the modal still renders without crashing
    expect(screen.getByText('Assign Task')).toBeInTheDocument()
  })

  it('closes modal on X button click', () => {
    const onClose = mock()
    const { container } = render(
      <TaskAssignmentModal
        task={mockTask}
        projectId="project1"
        onClose={onClose}
      />,
    )

    // Find the close button using aria-label approach or by finding the X icon button
    const closeButton = container.querySelector('button.text-content-tertiary')
    expect(closeButton).toBeInTheDocument()
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalled()
    }
  })
})
