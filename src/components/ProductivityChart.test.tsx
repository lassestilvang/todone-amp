import { describe, it, expect, beforeEach } from 'bun:test'
import { render } from '@testing-library/react'
import { ProductivityChart } from '@/components/ProductivityChart'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'

describe('ProductivityChart', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        karmaPoints: 0,
        karmaLevel: 'beginner',
        settings: {
          dailyGoal: 5,
          weeklyGoal: 25,
          daysOff: [],
          enableKarma: true,
          theme: 'system',
          language: 'en',
          timeFormat: '12h',
          dateFormat: 'MMM d, yyyy',
          startOfWeek: 0,
          defaultView: 'list',
          defaultPriority: null,
          vacationMode: false,
          enableNotifications: true,
        },
      },
      isAuthenticated: true,
      isLoading: false,
    })

    useTaskStore.setState({
      tasks: [],
    })
  })

  it('renders without crashing', () => {
    const { container } = render(<ProductivityChart />)
    expect(container).toBeTruthy()
  })

  it('displays main productivity section', () => {
    const { container } = render(<ProductivityChart />)
    const mainElement = container.firstChild
    expect(mainElement).toBeTruthy()
  })

  it('handles empty task list', () => {
    expect(() => {
      render(<ProductivityChart />)
    }).not.toThrow()
  })
})
