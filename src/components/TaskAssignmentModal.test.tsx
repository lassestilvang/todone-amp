import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskAssignmentModal } from '@/components/TaskAssignmentModal'
import * as authStore from '@/store/authStore'
import * as projectStore from '@/store/projectStore'
import * as taskStore from '@/store/taskStore'
import type { Task, User } from '@/types'

// Mock the stores
mock.module('@/store/authStore', () => authStore)
mock.module('@/store/projectStore', () => projectStore)
mock.module('@/store/taskStore', () => taskStore)

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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-extra-semi
    ;(authStore.useAuthStore as any).mockReturnValue({
      user: mockUser,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(projectStore.useProjectStore as any).mockReturnValue({
      projects: [
        {
          id: 'project1',
          name: 'Test Project',
          sharedWith: [],
        },
      ],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(taskStore.useTaskStore as any).mockReturnValue({
      updateTask: mock(),
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
    const updateTaskMock = mock()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(taskStore.useTaskStore as any).mockReturnValue({
      updateTask: updateTaskMock,
    })

    render(
      <TaskAssignmentModal
        task={mockTask}
        projectId="project1"
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByText('Test User'))
    expect(updateTaskMock).toHaveBeenCalledWith('task1', {
      assigneeIds: ['user1'],
    })
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
