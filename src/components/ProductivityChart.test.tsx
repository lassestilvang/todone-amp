import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render } from '@testing-library/react'
import { ProductivityChart } from '@/components/ProductivityChart'

const mockUseAuthStore = mock(() => ({
  userId: 'test-user',
  user: {
    settings: {
      dailyGoal: 5,
      weeklyGoal: 25,
      daysOff: [],
      enableKarma: true,
    },
  },
}))

const mockUseTaskStore = mock(() => ({
  tasks: [],
}))

mock.module('@/store/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}))

mock.module('@/store/taskStore', () => ({
  useTaskStore: mockUseTaskStore,
}))

describe('ProductivityChart', () => {
  beforeEach(() => {
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
