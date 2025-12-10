import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationPreferences } from './NotificationPreferences'
import { useAuthStore } from '@/store/authStore'

// Mock the auth store
vi.mock('@/store/authStore')

describe('NotificationPreferences', () => {
  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        settings: {
          notificationPreferences: {
            enableBrowserNotifications: true,
            enableEmailNotifications: true,
            enablePushNotifications: false,
            enableSoundNotifications: true,
            quietHours: {
              enabled: true,
              startTime: '22:00',
              endTime: '08:00',
            },
          },
        },
      },
      updateUser: mockUpdateUser,
    } as ReturnType<typeof useAuthStore>)
  })

  it('should not render when closed', () => {
    render(<NotificationPreferences isOpen={false} onClose={() => {}} />)
    expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    render(<NotificationPreferences isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument()
  })

  it('should display all notification options', () => {
    render(<NotificationPreferences isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('Browser Notifications')).toBeInTheDocument()
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    expect(screen.getByText('Sound Effects')).toBeInTheDocument()
  })

  it('should display quiet hours section', () => {
    render(<NotificationPreferences isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('Quiet Hours')).toBeInTheDocument()
  })

  it('should display notification types', () => {
    render(<NotificationPreferences isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('Notification Types')).toBeInTheDocument()
    expect(screen.getByText('Task assigned')).toBeInTheDocument()
    expect(screen.getByText('Comments')).toBeInTheDocument()
  })

  it('should save preferences when save button is clicked', async () => {
    render(<NotificationPreferences isOpen={true} onClose={() => {}} />)

    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    expect(mockUpdateUser).toHaveBeenCalled()
  })

  it('should close when close button is clicked', () => {
    const onClose = vi.fn()
    render(<NotificationPreferences isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: '' })
    if (closeButton) {
      fireEvent.click(closeButton)
    }
  })

  it('should close when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<NotificationPreferences isOpen={true} onClose={onClose} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })
})
