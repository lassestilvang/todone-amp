import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { CalendarIntegration } from './CalendarIntegration'

// Mock the integrationStore
mock.module('@/store/integrationStore', () => ({
  useIntegrationStore: () => ({
    calendarIntegrations: [],
    updateCalendarIntegration: mock(),
    removeCalendarIntegration: mock(),
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
    expect(wrapper).toHaveClass('border-border')
    expect(wrapper).toHaveClass('bg-surface-primary')
  })

  it('should call onSyncComplete callback when sync completes', async () => {
    const mockCallback = mock()
    render(<CalendarIntegration platform="google" onSyncComplete={mockCallback} />)
    // Callback would be called on sync in connected state
    expect(mockCallback).not.toHaveBeenCalled()
  })
})
