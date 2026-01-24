import { describe, it, expect, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { TeamDashboard } from './TeamDashboard'

// Mock the teamStore
mock.module('@/store/teamStore', () => ({
  useTeamStore: () => ({
    teams: [{ id: 'team1', name: 'Test Team' }],
  }),
}))

describe('TeamDashboard', () => {
  it('should render team dashboard', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Team Dashboard/i)).toBeInTheDocument()
  })

  it('should display team name', () => {
    render(<TeamDashboard />)
    expect(screen.getByText('Test Team')).toBeInTheDocument()
  })

  it('should show total members metric', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Total Members/i)).toBeInTheDocument()
    const metrics = screen.getAllByText(/[0-9]+/)
    expect(metrics.length).toBeGreaterThan(0)
  })

  it('should display Active Today metric', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Active Today/i)).toBeInTheDocument()
  })

  it('should display Tasks Assigned metric', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Tasks Assigned/i)).toBeInTheDocument()
  })

  it('should display Completion Rate metric', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Completion Rate/i)).toBeInTheDocument()
  })

  it('should have quick links section', () => {
    render(<TeamDashboard />)
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('should display team workload section', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Team Workload/i)).toBeInTheDocument()
  })

  it('should show recent activity section', () => {
    render(<TeamDashboard />)
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument()
  })
})
