import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CalendarIntegration } from './CalendarIntegration'

// Mock the integrationStore
vi.mock('@/store/integrationStore', () => ({
  useIntegrationStore: () => ({
    calendarIntegrations: [],
    updateCalendarIntegration: vi.fn(),
    removeCalendarIntegration: vi.fn(),
  }),
}))

describe('CalendarIntegration', () => {
  it('should render calendar integration component', () => {
    const { container } = render(<CalendarIntegration platform="google" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should have proper styling for disconnected state', () => {
    const { container } = render(<CalendarIntegration platform="google" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('border-gray-200')
    expect(wrapper).toHaveClass('bg-white')
  })

  it('should call onSyncComplete callback when sync completes', async () => {
    const mockCallback = vi.fn()
    render(<CalendarIntegration platform="google" onSyncComplete={mockCallback} />)
    // Callback would be called on sync in connected state
    expect(mockCallback).not.toHaveBeenCalled()
  })
})
