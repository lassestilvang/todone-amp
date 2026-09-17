import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { ProjectSharing } from './ProjectSharing'
import { useAuthStore } from '@/store/authStore'

describe('ProjectSharing', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        karmaPoints: 0,
        karmaLevel: 'beginner',
        settings: {
          theme: 'system',
          language: 'en',
          timeFormat: '12h',
          dateFormat: 'MMM d, yyyy',
          startOfWeek: 0,
          defaultView: 'list',
          defaultPriority: null,
          enableKarma: true,
          dailyGoal: 5,
          weeklyGoal: 25,
          daysOff: [],
          vacationMode: false,
          enableNotifications: true,
        },
      },
      isAuthenticated: true,
      isLoading: false,
    })
  })

  it('should render project sharing component', () => {
    render(<ProjectSharing projectId="proj1" />)
    expect(screen.getByText(/Project Sharing/i)).toBeInTheDocument()
  })

  it('should show "no collaborators" message when empty', () => {
    render(<ProjectSharing projectId="proj1" />)
    expect(screen.getByText(/No collaborators yet/i)).toBeInTheDocument()
  })

  it('should have invite collaborator button when user is admin', () => {
    // Set user as admin to see the invite button
    // The component checks user.role which is not in the User type
    const adminUser = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      createdAt: new Date(),
      karmaPoints: 0,
      karmaLevel: 'beginner' as const,
      settings: {
        theme: 'system' as const,
        language: 'en',
        timeFormat: '12h' as const,
        dateFormat: 'MMM d, yyyy',
        startOfWeek: 0,
        defaultView: 'list' as const,
        defaultPriority: null,
        enableKarma: true,
        dailyGoal: 5,
        weeklyGoal: 25,
        daysOff: [] as number[],
        vacationMode: false,
        enableNotifications: true,
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStore.setState({ user: adminUser as any, isAuthenticated: true, isLoading: false })
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
    const mockClose = mock()
    render(<ProjectSharing projectId="proj1" onClose={mockClose} />)
    const closeButton = screen.getByText('×')
    expect(closeButton).toBeInTheDocument()
  })

  it('should render proper styling', () => {
    const { container } = render(<ProjectSharing projectId="proj1" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('rounded-lg')
    expect(wrapper).toHaveClass('border')
    expect(wrapper).toHaveClass('bg-surface-primary')
  })
})
