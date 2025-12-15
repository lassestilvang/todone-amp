import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { ProductivityChart } from '@/components/ProductivityChart'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'

vi.mock('@/store/authStore')
vi.mock('@/store/taskStore')

describe('ProductivityChart', () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      userId: 'test-user',
      user: {
        settings: {
          dailyGoal: 5,
          weeklyGoal: 25,
          daysOff: [],
          enableKarma: true,
        },
      },
    } as unknown as ReturnType<typeof useAuthStore>)

    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [],
    } as unknown as ReturnType<typeof useTaskStore>)
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
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [],
    } as unknown as ReturnType<typeof useTaskStore>)

    expect(() => {
      render(<ProductivityChart />)
    }).not.toThrow()
  })
})
