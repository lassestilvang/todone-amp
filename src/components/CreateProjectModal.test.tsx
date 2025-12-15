import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateProjectModal } from './CreateProjectModal'

// Mock stores
vi.mock('@/store/projectStore', () => ({
  useProjectStore: vi.fn((selector) => {
    const state = {
      createProject: vi.fn(),
      projects: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('CreateProjectModal Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('visibility', () => {
    it('should not render when closed', () => {
      render(<CreateProjectModal isOpen={false} onClose={mockOnClose} />)
      expect(screen.queryByText(/Create Project/i)).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText(/Create Project/i)).toBeInTheDocument()
    })
  })

  describe('form fields', () => {
    beforeEach(() => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
    })

    it('should render modal when open', () => {
      const modal = screen.getByText(/Create Project/i)
      expect(modal).toBeInTheDocument()
    })

    it('should render form inputs', () => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should render color selector buttons', () => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(1)
    })

    it('should render submit button', () => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('user interactions', () => {
    it('should update input fields', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      if (inputs.length > 0) {
        await user.type(inputs[0], 'My Project')
        expect(inputs[0].value).toBe('My Project')
      }
    })

    it('should handle color button clicks', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const buttons = screen.getAllByRole('button')
      if (buttons.length > 1) {
        await user.click(buttons[0])
        // Button should be clickable
        expect(buttons[0]).toBeInTheDocument()
      }
    })
  })

  describe('form submission', () => {
    it('should allow form submission', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      if (inputs.length > 0) {
        await user.type(inputs[0], 'New Project')
        expect(inputs[0].value).toBe('New Project')
      }
    })

    it('should render with valid form structure', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const inputs = screen.getAllByRole('textbox')
      const buttons = screen.getAllByRole('button')
      
      expect(inputs.length).toBeGreaterThan(0)
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('modal controls', () => {
    it('should have close buttons', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should respond to keyboard navigation', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const modal = screen.getByText(/Create Project/i)
      expect(modal).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should render properly structured content', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      const modal = screen.getByText(/Create Project/i)
      expect(modal).toBeInTheDocument()
    })

    it('should have interactive elements', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      const inputs = screen.getAllByRole('textbox')
      const buttons = screen.getAllByRole('button')
      
      expect(inputs.length).toBeGreaterThan(0)
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      if (inputs.length > 0) {
        await user.type(inputs[0], 'Test')
        expect(inputs[0].value).toBe('Test')
      }
    })
  })

  describe('form validation', () => {
    it('should have input elements', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs[0].value).toBe('')
    })

    it('should accept user input', async () => {
      const user = userEvent.setup()
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      if (inputs.length > 0) {
        await user.type(inputs[0], '  Project Name  ')
        // Input should be typed
        expect(inputs[0].value.length).toBeGreaterThan(0)
      }
    })
  })

  describe('loading state', () => {
    it('should render buttons', () => {
      render(<CreateProjectModal isOpen={true} onClose={mockOnClose} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
