import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectSharing } from './ProjectSharing'

// Mock the stores
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user1', role: 'admin' },
  }),
}))

describe('ProjectSharing', () => {
  it('should render project sharing component', () => {
    render(<ProjectSharing projectId="proj1" />)
    expect(screen.getByText(/Project Sharing/i)).toBeInTheDocument()
  })

  it('should show "no collaborators" message when empty', () => {
    render(<ProjectSharing projectId="proj1" />)
    expect(screen.getByText(/No collaborators yet/i)).toBeInTheDocument()
  })

  it('should have invite collaborator button', () => {
    render(<ProjectSharing projectId="proj1" />)
    expect(screen.getByText(/Invite collaborator/i)).toBeInTheDocument()
  })

  it('should display roles and permissions info', () => {
    render(<ProjectSharing projectId="proj1" />)
    expect(screen.getByText(/Roles & Permissions/i)).toBeInTheDocument()
    expect(screen.getByText(/Viewer: View only/i)).toBeInTheDocument()
    expect(screen.getByText(/Member: View & edit tasks/i)).toBeInTheDocument()
    expect(screen.getByText(/Admin: Manage project & members/i)).toBeInTheDocument()
  })

  it('should have close button when onClose prop provided', () => {
    const mockClose = vi.fn()
    render(<ProjectSharing projectId="proj1" onClose={mockClose} />)
    const closeButton = screen.getByText('×')
    expect(closeButton).toBeInTheDocument()
  })

  it('should render proper styling', () => {
    const { container } = render(<ProjectSharing projectId="proj1" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('rounded-lg')
    expect(wrapper).toHaveClass('border')
    expect(wrapper).toHaveClass('bg-white')
  })
})
