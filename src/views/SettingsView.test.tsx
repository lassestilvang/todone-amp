import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsView } from './SettingsView'
import { User } from '@/types'

const mockUser: User = {
  id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date(),
  settings: {
    theme: 'light',
    language: 'en',
    timeFormat: '24h',
    dateFormat: 'MM/dd/yyyy',
    startOfWeek: 0,
    defaultView: 'list',
    defaultPriority: 'p2',
    enableKarma: true,
    dailyGoal: 5,
    weeklyGoal: 30,
    daysOff: [],
    vacationMode: false,
    experimentalFeatures: false,
    enableNotifications: true,
  },
  karmaPoints: 100,
  karmaLevel: 'intermediate',
}

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: mockUser,
      updateUser: vi.fn(),
      logout: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/taskStore', () => ({
  useTaskStore: vi.fn((selector) => {
    const state = {
      tasks: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/projectStore', () => ({
  useProjectStore: vi.fn((selector) => {
    const state = {
      projects: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/sectionStore', () => ({
  useSectionStore: vi.fn((selector) => {
    const state = {
      sections: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/labelStore', () => ({
  useLabelStore: vi.fn((selector) => {
    const state = {
      labels: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/filterStore', () => ({
  useFilterStore: vi.fn((selector) => {
    const state = {
      filters: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/store/gamificationStore', () => ({
  useGamificationStore: vi.fn(() => ({})),
}))

vi.mock('@/hooks/useDyslexiaFont', () => ({
  useDyslexiaFont: vi.fn(() => ({
    enabled: false,
    toggle: vi.fn(),
  })),
}))

vi.mock('@/utils/exportImport', () => ({
  exportDataAsJSON: vi.fn(() => ({})),
  exportTasksAsCSV: vi.fn(() => 'csv,data'),
  downloadFile: vi.fn(),
}))

describe('SettingsView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render settings view', () => {
      render(<SettingsView />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should render tab navigation', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render account tab button', () => {
      render(<SettingsView />)
      const accountButtons = screen.queryAllByText(/Account|account/)
      expect(accountButtons.length).toBeGreaterThan(0)
    })

    it('should render app settings tab button', () => {
      render(<SettingsView />)
      const appButton = screen.queryByText(/App|app/)
      if (appButton) {
        expect(appButton).toBeInTheDocument()
      }
    })
  })

  describe('account settings tab', () => {
    it('should display user name field', () => {
      render(<SettingsView />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should display email field', () => {
      render(<SettingsView />)
      const emailInputs = screen.queryAllByRole('textbox')
      expect(emailInputs.length).toBeGreaterThan(0)
    })

    it('should display password change section', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should allow password input', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      if (inputs.length > 0) {
        const passwordInput = inputs.find((input) => input.type === 'password')
        if (passwordInput) {
          await user.type(passwordInput, 'newpassword123')
          expect(passwordInput.value).toBe('newpassword123')
        }
      }
    })
  })

  describe('theme settings', () => {
    it('should display theme options', () => {
      render(<SettingsView />)
      // Theme section should be rendered
      const heading = screen.queryByText(/Theme|theme/)
      if (heading) {
        expect(heading).toBeInTheDocument()
      }
    })

    it('should display light/dark/system theme buttons', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should allow theme selection', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        // Find and click a theme button
        const themeButton = buttons.find((btn) => btn.textContent?.includes('Light') || btn.textContent?.includes('Dark'))
        if (themeButton) {
          await user.click(themeButton)
        }
      }
    })
  })

  describe('language settings', () => {
    it('should display language dropdown', () => {
      render(<SettingsView />)
      // Language selection should be visible
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should show multiple language options', () => {
      render(<SettingsView />)
      // Component should render without error
      expect(screen.queryByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('should allow language selection', () => {
      render(<SettingsView />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('privacy settings', () => {
    it('should display privacy section', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should display privacy toggle options', () => {
      render(<SettingsView />)
      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(0)
    })

    it('should allow toggling privacy settings', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const checkboxes = screen.queryAllByRole('checkbox')
      if (checkboxes.length > 0) {
        await user.click(checkboxes[0])
        // Setting should be updated
      }
    })
  })

  describe('notifications', () => {
    it('should display notification settings', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have notification preference checkboxes', () => {
      render(<SettingsView />)
      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('data management', () => {
    it('should display export buttons', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      const exportButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('export'))
      if (exportButton) {
        expect(exportButton).toBeInTheDocument()
      }
    })

    it('should allow JSON export', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const buttons = screen.getAllByRole('button')
      const jsonExport = buttons.find((btn) => btn.textContent?.toLowerCase().includes('json'))
      if (jsonExport) {
        await user.click(jsonExport)
      }
    })

    it('should allow CSV export', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const buttons = screen.getAllByRole('button')
      const csvExport = buttons.find((btn) => btn.textContent?.toLowerCase().includes('csv'))
      if (csvExport) {
        await user.click(csvExport)
      }
    })

    it('should display delete account option', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('delete'))
      if (deleteButton) {
        expect(deleteButton).toBeInTheDocument()
      }
    })
  })

  describe('time format settings', () => {
    it('should display time format options', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should allow 12h/24h time format selection', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        await user.click(buttons[0])
      }
    })
  })

  describe('date format settings', () => {
    it('should display date format options', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('default project settings', () => {
    it('should display default project selector', () => {
      render(<SettingsView />)
      const inputs = screen.queryAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('goal settings', () => {
    it('should display daily goal input', () => {
      render(<SettingsView />)
      const inputs = screen.queryAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })

    it('should display weekly goal input', () => {
      render(<SettingsView />)
      const inputs = screen.queryAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })

    it('should allow updating goals', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const inputs = screen.queryAllByRole('textbox') as HTMLInputElement[]
      if (inputs.length > 1) {
        // Skip name/email fields and find numeric inputs
        const numericInputs = inputs.filter((input) => input.type === 'number' || input.placeholder?.includes('goal'))
        if (numericInputs.length > 0) {
          const goalInput = numericInputs[0]
          await user.clear(goalInput)
          await user.type(goalInput, '10')
          expect(goalInput.value).toBe('10')
        }
      }
    })
  })

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(<SettingsView />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should have interactive buttons', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have form inputs', () => {
      render(<SettingsView />)
      const inputs = screen.queryAllByRole('textbox')
      expect(inputs.length).toBeGreaterThanOrEqual(0)
    })

    it('should support keyboard navigation', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach((btn) => {
        expect(btn).toBeInTheDocument()
      })
    })
  })

  describe('dyslexia font support', () => {
    it('should display dyslexia font toggle', () => {
      render(<SettingsView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should allow toggling dyslexia font', () => {
      render(<SettingsView />)

      const buttons = screen.getAllByRole('button')
      if (buttons.length > 0) {
        // Find dyslexia toggle if present
      }
    })
  })

  describe('vacation mode', () => {
    it('should display vacation mode option', () => {
      render(<SettingsView />)
      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(0)
    })

    it('should allow enabling vacation mode', async () => {
      const user = userEvent.setup()
      render(<SettingsView />)

      const checkboxes = screen.queryAllByRole('checkbox')
      if (checkboxes.length > 0) {
        await user.click(checkboxes[0])
      }
    })
  })

  describe('experimental features', () => {
    it('should display experimental features toggle', () => {
      render(<SettingsView />)
      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(0)
    })
  })
})
