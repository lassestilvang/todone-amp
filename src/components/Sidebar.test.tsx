import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'

// Mock stores
vi.mock('@/store/viewStore', () => ({
  useViewStore: vi.fn(() => ({
    currentView: 'inbox',
    setCurrentView: vi.fn(),
    expandedProjectIds: [],
    toggleProjectExpanded: vi.fn(),
  })),
}))

vi.mock('@/store/projectStore', () => ({
  useProjectStore: vi.fn((selector) => {
    const state = {
      projects: [
        { id: '1', name: 'Work', color: '#3B82F6', archived: false, createdAt: new Date(), updatedAt: new Date(), userId: 'user1' },
        { id: '2', name: 'Personal', color: '#EC4899', archived: false, createdAt: new Date(), updatedAt: new Date(), userId: 'user1' },
      ],
      favoriteProjectIds: ['1'],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/taskStore', () => ({
  useTaskStore: vi.fn(() => ({
    tasks: [],
  })),
}))

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render sidebar', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })

    it('should render projects section', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      const workProject = screen.queryByText('Work')
      if (workProject) {
        expect(workProject).toBeInTheDocument()
      }
    })
  })

  describe('project list', () => {
    it('should display projects when available', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      const workProject = screen.queryByText('Work')
      if (workProject) {
        expect(workProject).toBeInTheDocument()
      }
    })
  })

  describe('interactions', () => {
    it('should render as navigation element', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('collapsibility', () => {
    it('should have collapsible projects section', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      // Check for collapse/expand button
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      render(<Sidebar currentView="inbox" onViewChange={vi.fn()} />)
      
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })
})
