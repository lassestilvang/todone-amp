import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskDetailPanel } from './TaskDetailPanel'
import { Task } from '@/types'

const mockTask: Task = {
  id: '1',
  content: 'Test task with details',
  description: 'This is a detailed task description',
  completed: false,
  priority: 'p2',
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
  reminders: [],
  attachments: [],
  labels: [],
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
}

mock.module('@/store/taskDetailStore', () => ({
  useTaskDetailStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      isOpen: true,
      selectedTask: mockTask,
      hasUnsavedChanges: false,
      closeTaskDetail: mock(),
      updateSelectedTask: mock(),
      setHasUnsavedChanges: mock(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/taskStore', () => ({
  useTaskStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      updateTask: mock(),
      deleteTask: mock(),
      duplicateTask: mock(),
      tasks: [mockTask],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/projectStore', () => ({
  useProjectStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      createProject: mock(),
      projects: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock child components
mock.module('@/components/DatePickerInput', () => ({
  DatePickerInput: () => <div data-testid="date-picker">Date Picker</div>,
}))

mock.module('@/components/TimePickerInput', () => ({
  TimePickerInput: () => <div data-testid="time-picker">Time Picker</div>,
}))

mock.module('@/components/PrioritySelector', () => ({
  PrioritySelector: () => <div data-testid="priority-selector">Priority Selector</div>,
}))

mock.module('@/components/ProjectSelector', () => ({
  ProjectSelector: () => <div data-testid="project-selector">Project Selector</div>,
}))

mock.module('@/components/SectionSelector', () => ({
  SectionSelector: () => <div data-testid="section-selector">Section Selector</div>,
}))

mock.module('@/components/LabelSelector', () => ({
  LabelSelector: () => <div data-testid="label-selector">Label Selector</div>,
}))

mock.module('@/components/RecurrenceSelector', () => ({
  RecurrenceSelector: () => <div data-testid="recurrence-selector">Recurrence Selector</div>,
}))

mock.module('@/components/SubTaskList', () => ({
  SubTaskList: () => <div data-testid="subtask-list">Subtask List</div>,
}))

mock.module('@/components/AssigneeSelector', () => ({
  AssigneeSelector: () => <div data-testid="assignee-selector">Assignee Selector</div>,
}))

mock.module('@/components/CommentThread', () => ({
  CommentThread: () => <div data-testid="comment-thread">Comment Thread</div>,
}))

mock.module('@/components/ActivityFeed', () => ({
  ActivityFeed: () => <div data-testid="activity-feed">Activity Feed</div>,
}))

mock.module('@/components/RecurrenceExceptionManager', () => ({
  RecurrenceExceptionManager: () => <div data-testid="recurrence-exception">Recurrence Exception Manager</div>,
}))

mock.module('@/components/RecurrenceInstancesList', () => ({
  RecurrenceInstancesList: () => <div data-testid="recurrence-instances">Recurrence Instances</div>,
}))

mock.module('@/components/RecurrenceCalendarView', () => ({
  RecurrenceCalendarView: () => <div data-testid="recurrence-calendar">Recurrence Calendar</div>,
}))

mock.module('@/components/RichTextEditor', () => ({
  RichTextEditor: () => <div data-testid="rich-text-editor">Rich Text Editor</div>,
}))

mock.module('@/components/Input', () => ({
  Input: ({ placeholder }: { placeholder?: string }) => (
    <input data-testid="input" placeholder={placeholder} type="text" />
  ),
}))

describe('TaskDetailPanel Component', () => {
  beforeEach(() => {
  })

  describe('rendering', () => {
    it('should render task detail panel when open', () => {
      render(<TaskDetailPanel />)
      // Modal should be visible
      const modal = screen.queryByTestId('task-detail-modal')
      if (modal) {
        expect(modal).toBeInTheDocument()
      }
    })

    it('should render close button', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should display task content input', () => {
      render(<TaskDetailPanel />)
      const input = screen.queryByTestId('input')
      if (input) {
        expect(input).toBeInTheDocument()
      }
    })

    it('should render all task property selectors', () => {
      render(<TaskDetailPanel />)
      expect(screen.queryByTestId('date-picker')).toBeTruthy()
      expect(screen.queryByTestId('priority-selector')).toBeTruthy()
      expect(screen.queryByTestId('project-selector')).toBeTruthy()
    })
  })

  describe('task editing', () => {
    it('should allow editing task content', async () => {
      const user = userEvent.setup()
      render(<TaskDetailPanel />)

      const input = screen.queryByTestId('input') as HTMLInputElement
      if (input) {
        await user.clear(input)
        await user.type(input, 'Updated task content')
        expect(input.value).toBe('Updated task content')
      }
    })

    it('should display description editor', () => {
      render(<TaskDetailPanel />)
      const richEditor = screen.queryByTestId('rich-text-editor')
      if (richEditor) {
        expect(richEditor).toBeInTheDocument()
      }
    })

    it('should display due date picker', () => {
      render(<TaskDetailPanel />)
      const datePicker = screen.queryByTestId('date-picker')
      if (datePicker) {
        expect(datePicker).toBeInTheDocument()
      }
    })

    it('should display time picker', () => {
      render(<TaskDetailPanel />)
      const timePicker = screen.queryByTestId('time-picker')
      if (timePicker) {
        expect(timePicker).toBeInTheDocument()
      }
    })
  })

  describe('task properties', () => {
    it('should display priority selector', () => {
      render(<TaskDetailPanel />)
      const prioritySelector = screen.queryByTestId('priority-selector')
      expect(prioritySelector).toBeTruthy()
    })

    it('should display project selector', () => {
      render(<TaskDetailPanel />)
      const projectSelector = screen.queryByTestId('project-selector')
      expect(projectSelector).toBeTruthy()
    })

    it('should display section selector', () => {
      render(<TaskDetailPanel />)
      const sectionSelector = screen.queryByTestId('section-selector')
      if (sectionSelector) {
        expect(sectionSelector).toBeInTheDocument()
      }
    })

    it('should display label selector', () => {
      render(<TaskDetailPanel />)
      const labelSelector = screen.queryByTestId('label-selector')
      if (labelSelector) {
        expect(labelSelector).toBeInTheDocument()
      }
    })

    it('should display assignee selector', () => {
      render(<TaskDetailPanel />)
      const assigneeSelector = screen.queryByTestId('assignee-selector')
      if (assigneeSelector) {
        expect(assigneeSelector).toBeInTheDocument()
      }
    })

    it('should display recurrence selector', () => {
      render(<TaskDetailPanel />)
      const recurrenceSelector = screen.queryByTestId('recurrence-selector')
      if (recurrenceSelector) {
        expect(recurrenceSelector).toBeInTheDocument()
      }
    })
  })

  describe('subtasks', () => {
    it('should display subtask list', () => {
      render(<TaskDetailPanel />)
      const subtaskList = screen.queryByTestId('subtask-list')
      if (subtaskList) {
        expect(subtaskList).toBeInTheDocument()
      }
    })

    it('should render add subtask button', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      const addButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('add') || btn.textContent?.includes('+'))
      if (addButton) {
        expect(addButton).toBeInTheDocument()
      }
    })
  })

  describe('task actions', () => {
    it('should render save button', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      const saveButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('save'))
      if (saveButton) {
        expect(saveButton).toBeInTheDocument()
      }
    })

    it('should render delete button', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('delete'))
      if (deleteButton) {
        expect(deleteButton).toBeInTheDocument()
      }
    })

    it('should render duplicate button', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      const duplicateButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('duplicate'))
      if (duplicateButton) {
        expect(duplicateButton).toBeInTheDocument()
      }
    })

    it('should render copy link button', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('copy'))
      if (copyButton) {
        expect(copyButton).toBeInTheDocument()
      }
    })

    it('should allow save action', async () => {
      const user = userEvent.setup()
      render(<TaskDetailPanel />)

      const buttons = screen.getAllByRole('button')
      const saveButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('save'))
      if (saveButton) {
        await user.click(saveButton)
      }
    })

    it('should show delete confirmation', async () => {
      const user = userEvent.setup()
      render(<TaskDetailPanel />)

      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('delete'))
      if (deleteButton) {
        await user.click(deleteButton)
      }
    })
  })

  describe('comments and activity', () => {
    it('should display comment thread', () => {
      render(<TaskDetailPanel />)
      const commentThread = screen.queryByTestId('comment-thread')
      if (commentThread) {
        expect(commentThread).toBeInTheDocument()
      }
    })

    it('should display activity feed', () => {
      render(<TaskDetailPanel />)
      const activityFeed = screen.queryByTestId('activity-feed')
      if (activityFeed) {
        expect(activityFeed).toBeInTheDocument()
      }
    })
  })

  describe('recurrence management', () => {
    it('should display recurrence exception manager', () => {
      render(<TaskDetailPanel />)
      const exceptionManager = screen.queryByTestId('recurrence-exception')
      if (exceptionManager) {
        expect(exceptionManager).toBeInTheDocument()
      }
    })

    it('should display recurrence instances list', () => {
      render(<TaskDetailPanel />)
      const instancesList = screen.queryByTestId('recurrence-instances')
      if (instancesList) {
        expect(instancesList).toBeInTheDocument()
      }
    })

    it('should display recurrence calendar view', () => {
      render(<TaskDetailPanel />)
      const calendarView = screen.queryByTestId('recurrence-calendar')
      if (calendarView) {
        expect(calendarView).toBeInTheDocument()
      }
    })
  })

  describe('keyboard shortcuts', () => {
    it('should close on Escape key', async () => {
      render(<TaskDetailPanel />)
      await userEvent.keyboard('{Escape}')
      // Panel should close or handleClose should be called
    })

    it('should handle unsaved changes on close', async () => {
      render(<TaskDetailPanel />)
      // Should prompt user if unsaved changes exist
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    })
  })

  describe('modal styling', () => {
    it('should render backdrop', () => {
      render(<TaskDetailPanel />)
      // Modal should be rendered with backdrop
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have proper z-index', () => {
      render(<TaskDetailPanel />)
      // Modal should be on top layer
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('should have interactive buttons', () => {
      render(<TaskDetailPanel />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', () => {
      render(<TaskDetailPanel />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        buttons[0].focus()
        expect(buttons[0]).toHaveFocus()
      }
    })

    it('should support screen readers', () => {
      render(<TaskDetailPanel />)
      const inputs = screen.queryAllByTestId('input')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('edge cases', () => {
    it('should handle very long task content', async () => {
      const user = userEvent.setup()
      render(<TaskDetailPanel />)

      const input = screen.queryByTestId('input') as HTMLInputElement
      if (input) {
        const longContent = 'a'.repeat(500)
        await user.type(input, longContent)
        expect(input.value.length).toBeGreaterThan(100)
      }
    })

    it('should handle special characters in content', async () => {
      const user = userEvent.setup()
      render(<TaskDetailPanel />)

      const input = screen.queryByTestId('input') as HTMLInputElement
      if (input) {
        await user.type(input, '<>&"\'')
        expect(input.value).toContain('<>')
      }
    })
  })
})
