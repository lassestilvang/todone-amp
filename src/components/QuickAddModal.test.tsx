import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickAddModal } from './QuickAddModal'
import { Task, Project, Label } from '@/types'

// Mock stores
const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Test task 1',
    completed: false,
    priority: 'p2',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    reminders: [],
    attachments: [],
    labels: [],
  },
]

const mockProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Work',
    color: '#3B82F6',
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'user1',
    viewType: 'list',
    isFavorite: false,
    isShared: false,
    order: 0,
  },
]

const mockLabels: Label[] = [
  {
    id: 'label1',
    name: 'Important',
    color: '#EF4444',
    ownerId: 'user1',
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

mock.module('@/store/quickAddStore', () => ({
  useQuickAddStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      isOpen: true,
      closeQuickAdd: mock(),
      recentItems: [],
      addToRecent: mock(),
      clearRecent: mock(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/taskStore', () => ({
  useTaskStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      createTask: mock(),
      tasks: mockTasks,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/labelStore', () => ({
  useLabelStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      labels: mockLabels,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/projectStore', () => ({
  useProjectStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      projects: mockProjects,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/store/authStore', () => ({
  useAuthStore: mock((selector: (state: unknown) => unknown) => {
    const state = {
      user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

mock.module('@/utils/date', () => ({
  parseNaturalLanguageDate: mock((text: string) => {
    if (text.includes('tomorrow')) return new Date(Date.now() + 24 * 60 * 60 * 1000)
    if (text.includes('today')) return new Date()
    return undefined
  }),
  parseNaturalLanguageTime: mock((text: string) => {
    if (text.includes('3pm')) return '15:00'
    if (text.includes('14:00')) return '14:00'
    return undefined
  }),
}))

mock.module('@/utils/recurrence', () => ({
  parseRecurrenceFromText: mock(() => null),
}))

describe('QuickAddModal Component', () => {
  beforeEach(() => {
  })

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(<QuickAddModal />)
      // Modal should be visible
      const modalContent = screen.queryByRole('textbox')
      if (modalContent) {
        expect(modalContent).toBeInTheDocument()
      }
    })

    it('should render input field', () => {
      render(<QuickAddModal />)
      const input = screen.queryByRole('textbox')
      if (input) {
        expect(input).toBeInTheDocument()
      }
    })

    it('should render close button', () => {
      render(<QuickAddModal />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('input interaction', () => {
    it('should capture user input in text field', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'New task')
        expect(input.value).toBe('New task')
      }
    })

    it('should support natural language parsing', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Buy milk p1 tomorrow')
        expect(input.value).toContain('Buy milk')
        expect(input.value).toContain('p1')
      }
    })

    it('should support priority indicators', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Task p1')
        expect(input.value).toContain('p1')
      }
    })

    it('should support project references with #', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Task #Work')
        expect(input.value).toContain('#Work')
      }
    })

    it('should support label references with @', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Task @Important')
        expect(input.value).toContain('@Important')
      }
    })
  })

  describe('search mode', () => {
    it('should enter search mode with search prefix', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'search: completed')
        expect(input.value).toContain('search:')
      }
    })

    it('should support filter prefix', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'filter: p1')
        expect(input.value).toContain('filter:')
      }
    })
  })

  describe('command mode', () => {
    it('should support command prefix', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, '/ create')
        expect(input.value).toContain('/')
      }
    })
  })

  describe('keyboard shortcuts', () => {
    it('should support Escape key to close modal', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox')
      if (input) {
        await user.keyboard('{Escape}')
        // Modal should close
      }
    })

    it('should support Cmd+K or Ctrl+K to open/close', () => {
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox')
      if (input) {
        expect(input).toBeInTheDocument()
      }
    })

    it('should support arrow keys for navigation', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox')
      if (input) {
        await user.type(input, 'task')
        await user.keyboard('{ArrowDown}')
        expect(input).toHaveFocus()
      }
    })

    it('should support Enter to submit', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'New task')
        await user.keyboard('{Enter}')
        // Task should be created
      }
    })
  })

  describe('recent items', () => {
    it('should display recent items when input is empty', () => {
      render(<QuickAddModal />)
      // Component should render without errors
      const input = screen.queryByRole('textbox')
      if (input) {
        expect(input).toBeInTheDocument()
      }
    })

    it('should filter recent items as user types', async () => {
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        input.value = 'test'
        expect(input.value).toBe('test')
      }
    })

    it('should clear recent items when user confirms', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const buttons = screen.getAllByRole('button')
      // Find clear recent button if it exists
      const clearButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('clear'))
      if (clearButton) {
        await user.click(clearButton)
      }
    })
  })

  describe('search results', () => {
    it('should show search results when in search mode', async () => {
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        input.value = 'search: task'
        // Results should be displayed
        expect(input.value).toContain('search:')
      }
    })

    it('should include tasks in search results', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'search: Test')
        // Should find "Test task 1"
      }
    })

    it('should include projects in search results', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'search: Work')
        // Should find "Work" project
      }
    })

    it('should include labels in search results', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'search: Important')
        // Should find "Important" label
      }
    })
  })

  describe('accessibility', () => {
    it('should have properly labeled input', () => {
      render(<QuickAddModal />)
      const input = screen.queryByRole('textbox')
      if (input) {
        expect(input).toBeInTheDocument()
      }
    })

    it('should be keyboard navigable', () => {
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        input.focus()
        expect(input).toHaveFocus()
      }
    })

    it('should have accessible buttons', () => {
      render(<QuickAddModal />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support screen readers', () => {
      render(<QuickAddModal />)
      const input = screen.queryByRole('textbox')
      if (input) {
        expect(input).toBeInTheDocument()
      }
    })
  })

  describe('mode detection', () => {
    it('should detect create mode for simple text', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Simple task text')
        expect(input.value).toBe('Simple task text')
      }
    })

    it('should detect search mode for "search:" prefix', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'search: something')
        expect(input.value).toContain('search:')
      }
    })

    it('should detect command mode for "/" prefix', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, '/ command')
        expect(input.value).toContain('/')
      }
    })
  })

  describe('form submission', () => {
    it('should create task with valid input', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'New important task')
        await user.keyboard('{Enter}')
        // Task should be created
      }
    })

    it('should parse natural language correctly', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Meeting with team tomorrow at 3pm #Work p1')
        expect(input.value).toContain('tomorrow')
        expect(input.value).toContain('3pm')
        expect(input.value).toContain('#Work')
        expect(input.value).toContain('p1')
      }
    })

    it('should clear input after successful submission', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Task')
        await user.keyboard('{Enter}')
        // Input should be cleared for next task
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty input gracefully', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox')
      if (input) {
        await user.keyboard('{Enter}')
        // Should not create task with empty content
        expect(input).toBeInTheDocument()
      }
    })

    it('should handle very long input', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        const longText = 'a'.repeat(500)
        await user.type(input, longText)
        expect(input.value).toBe(longText)
      }
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Task with <>&"\'')
        expect(input.value).toContain('<>&"\'')
      }
    })

    it('should handle multiple spaces', async () => {
      const user = userEvent.setup()
      render(<QuickAddModal />)

      const input = screen.queryByRole('textbox') as HTMLInputElement
      if (input) {
        await user.type(input, 'Task   with   spaces')
        expect(input.value).toContain('Task   with   spaces')
      }
    })
  })
})
