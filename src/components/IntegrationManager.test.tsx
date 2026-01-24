import { describe, it, expect, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { IntegrationManager } from './IntegrationManager'

// Mock the integrationStore
mock.module('@/store/integrationStore', () => ({
  useIntegrationStore: () => ({
    userIntegrations: [],
    calendarIntegrations: [],
  }),
}))

describe('IntegrationManager', () => {
  it('should render integration manager component', () => {
    const { container } = render(<IntegrationManager />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display API & Webhooks section', () => {
    render(<IntegrationManager />)
    expect(screen.getByText(/API & Webhooks/i)).toBeInTheDocument()
    expect(screen.getByText(/API Key/i)).toBeInTheDocument()
    expect(screen.getByText(/Webhook URL/i)).toBeInTheDocument()
  })

  it('should show Coming Soon section', () => {
    render(<IntegrationManager />)
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument()
    expect(screen.getByText('Slack Integration')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Teams')).toBeInTheDocument()
    expect(screen.getByText('Linear Integration')).toBeInTheDocument()
  })

  it('should have connect buttons for integrations', () => {
    render(<IntegrationManager />)
    const connectButtons = screen.getAllByText(/Connect/)
    expect(connectButtons.length).toBeGreaterThan(0)
  })

  it('should have copy buttons for API keys', () => {
    render(<IntegrationManager />)
    const copyButtons = screen.getAllByText('Copy')
    expect(copyButtons.length).toBeGreaterThan(0)
  })

  it('should link to API docs', () => {
    render(<IntegrationManager />)
    const apiDocLink = screen.getByText(/View API docs/)
    expect(apiDocLink).toBeInTheDocument()
    expect(apiDocLink.getAttribute('href')).toBe('#')
  })
})
