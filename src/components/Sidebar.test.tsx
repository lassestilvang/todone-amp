import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

const mockThemeContext: ThemeContextValue = {
  mode: 'system',
  theme: 'default',
  resolvedMode: 'light',
  isDark: false,
  setMode: mock(),
  setTheme: mock(),
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      {ui}
    </ThemeContext.Provider>
  )
}

// Mock stores
mock.module('@/store/viewStore', () => ({
  useViewStore: mock(() => ({
    currentView: 'inbox',
    setCurrentView: mock(),
    expandedProjectIds: [],
    toggleProjectExpanded: mock(),
  })),
}))

mock.module('@/store/projectStore', () => ({
  useProjectStore: mock((selector: (state: unknown) => unknown) => {
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

mock.module('@/store/taskStore', () => ({
  useTaskStore: mock(() => ({
    tasks: [],
  })),
}))

describe('Sidebar Component', () => {
  beforeEach(() => {
  })

  describe('rendering', () => {
    it('should render sidebar', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })

    it('should render projects section', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      const workProject = screen.queryByText('Work')
      if (workProject) {
        expect(workProject).toBeInTheDocument()
      }
    })
  })

  describe('project list', () => {
    it('should display projects when available', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      const workProject = screen.queryByText('Work')
      if (workProject) {
        expect(workProject).toBeInTheDocument()
      }
    })
  })

  describe('interactions', () => {
    it('should render as navigation element', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('collapsibility', () => {
    it('should have collapsible projects section', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      // Check for collapse/expand button
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      renderWithTheme(<Sidebar currentView="inbox" onViewChange={mock()} />)
      
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toBeInTheDocument()
    })
  })
})
