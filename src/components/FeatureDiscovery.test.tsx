import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeatureDiscovery, type FeatureNudge } from './FeatureDiscovery'

describe('FeatureDiscovery', () => {
  let mockNudges: FeatureNudge[]

  beforeEach(() => {
    localStorage.clear()
    mockNudges = [
      {
        id: 'nudge-1',
        title: 'Quick Add Shortcut',
        description: 'Press Ctrl+K to quickly add new tasks',
        action: {
          label: 'Learn more',
          onClick: vi.fn(),
        },
      },
      {
        id: 'nudge-2',
        title: 'Keyboard Shortcuts',
        description: 'Master keyboard shortcuts to work faster',
        dismissible: true,
      },
      {
        id: 'nudge-3',
        title: 'Board View',
        description: 'Switch to board view for a Kanban experience',
      },
    ]
  })

  describe('rendering', () => {
    it('should render feature nudges', () => {
      render(<FeatureDiscovery nudges={mockNudges} />)
      expect(screen.getByText('Quick Add Shortcut')).toBeInTheDocument()
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    })

    it('should respect maxVisible limit', () => {
      render(<FeatureDiscovery nudges={mockNudges} maxVisible={2} />)
      expect(screen.getByText('Quick Add Shortcut')).toBeInTheDocument()
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
      expect(screen.queryByText('Board View')).not.toBeInTheDocument()
    })

    it('should show all nudges if maxVisible is higher', () => {
      render(<FeatureDiscovery nudges={mockNudges} maxVisible={5} />)
      expect(screen.getByText('Quick Add Shortcut')).toBeInTheDocument()
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
      expect(screen.getByText('Board View')).toBeInTheDocument()
    })

    it('should render dismiss button for dismissible nudges', () => {
      render(<FeatureDiscovery nudges={mockNudges} />)
      const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i })
      expect(dismissButtons.length).toBeGreaterThan(0)
    })

    it('should render action button if provided', () => {
      render(<FeatureDiscovery nudges={mockNudges} />)
      expect(screen.getByText('Learn more')).toBeInTheDocument()
    })
  })

  describe('dismiss functionality', () => {
    it('should render dismiss buttons', () => {
      render(<FeatureDiscovery nudges={mockNudges} />)
      const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i })
      expect(dismissButtons.length).toBeGreaterThan(0)
    })

    it('should not show dismissed nudges from localStorage', () => {
      localStorage.setItem('dismissed-feature-nudges', JSON.stringify(['nudge-1']))

      render(<FeatureDiscovery nudges={mockNudges} />)
      expect(screen.queryByText('Quick Add Shortcut')).not.toBeInTheDocument()
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    })

    it('should handle empty nudges array', () => {
      const { container } = render(<FeatureDiscovery nudges={[]} />)
      expect(container.firstChild?.childNodes.length).toBe(0)
    })

    it('should handle all nudges dismissed', () => {
      localStorage.setItem('dismissed-feature-nudges', JSON.stringify(['nudge-1', 'nudge-2', 'nudge-3']))

      const { container } = render(<FeatureDiscovery nudges={mockNudges} />)
      expect(container.firstChild?.childNodes.length).toBe(0)
    })
  })

  describe('action handling', () => {
    it('should call action onClick when button clicked', () => {
      const onAction = vi.fn()
      const nudgesWithAction = [
        {
          id: 'test-1',
          title: 'Test',
          description: 'Test nudge',
          action: {
            label: 'Try it',
            onClick: onAction,
          },
        },
      ]

      render(<FeatureDiscovery nudges={nudgesWithAction} />)
      const actionButton = screen.getByText('Try it')
      fireEvent.click(actionButton)

      expect(onAction).toHaveBeenCalled()
    })
  })

  describe('localStorage persistence', () => {
    it('should respect localStorage on mount', () => {
      localStorage.setItem('dismissed-feature-nudges', JSON.stringify(['nudge-1']))

      const updatedNudges: FeatureNudge[] = [
        {
          id: 'nudge-1',
          title: 'Should be hidden',
          description: 'Test',
        },
        {
          id: 'nudge-2',
          title: 'Should be visible',
          description: 'Test',
        },
      ]

      render(<FeatureDiscovery nudges={updatedNudges} />)
      expect(screen.queryByText('Should be hidden')).not.toBeInTheDocument()
      expect(screen.getByText('Should be visible')).toBeInTheDocument()
    })
  })
})
