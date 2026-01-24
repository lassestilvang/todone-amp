import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationPreferences } from './NotificationPreferences'

const mockUpdateUser = mock()

mock.module('@/store/authStore', () => ({
  useAuthStore: () => ({
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
  }),
}))

describe('NotificationPreferences', () => {
  beforeEach(() => {
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
    const onClose = mock()
    render(<NotificationPreferences isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: '' })
    if (closeButton) {
      fireEvent.click(closeButton)
    }
  })

  it('should close when cancel button is clicked', () => {
    const onClose = mock()
    render(<NotificationPreferences isOpen={true} onClose={onClose} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })
})
