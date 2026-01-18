import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

const createMockThemeContext = (overrides: Partial<ThemeContextValue> = {}): ThemeContextValue => ({
  mode: 'system',
  theme: 'default',
  resolvedMode: 'light',
  isDark: false,
  setMode: vi.fn(),
  setTheme: vi.fn(),
  ...overrides,
})

const renderWithTheme = (ui: React.ReactElement, contextValue?: Partial<ThemeContextValue>) => {
  const value = createMockThemeContext(contextValue)
  return {
    ...render(<ThemeContext.Provider value={value}>{ui}</ThemeContext.Provider>),
    mockContext: value,
  }
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('icon variant', () => {
    it('renders icon button', () => {
      renderWithTheme(<ThemeSwitcher variant="icon" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('cycles through modes on click', () => {
      const { mockContext } = renderWithTheme(<ThemeSwitcher variant="icon" />, { mode: 'system' })
      fireEvent.click(screen.getByRole('button'))
      expect(mockContext.setMode).toHaveBeenCalledWith('light')
    })

    it('cycles from light to dark', () => {
      const { mockContext } = renderWithTheme(<ThemeSwitcher variant="icon" />, { mode: 'light' })
      fireEvent.click(screen.getByRole('button'))
      expect(mockContext.setMode).toHaveBeenCalledWith('dark')
    })

    it('cycles from dark to system', () => {
      const { mockContext } = renderWithTheme(<ThemeSwitcher variant="icon" />, { mode: 'dark' })
      fireEvent.click(screen.getByRole('button'))
      expect(mockContext.setMode).toHaveBeenCalledWith('system')
    })

    it('shows label when showLabel is true', () => {
      renderWithTheme(<ThemeSwitcher variant="icon" showLabel />, { mode: 'light' })
      expect(screen.getByText('Light')).toBeInTheDocument()
    })

    it('does not show label by default', () => {
      renderWithTheme(<ThemeSwitcher variant="icon" />, { mode: 'light' })
      expect(screen.queryByText('Light')).not.toBeInTheDocument()
    })
  })

  describe('dropdown variant', () => {
    it('renders dropdown trigger', () => {
      renderWithTheme(<ThemeSwitcher variant="dropdown" />)
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
    })

    it('opens dropdown on click', () => {
      renderWithTheme(<ThemeSwitcher variant="dropdown" />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('shows all theme options in dropdown', () => {
      renderWithTheme(<ThemeSwitcher variant="dropdown" />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('option', { name: /Light/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Dark/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /System/i })).toBeInTheDocument()
    })

    it('selects theme on option click', () => {
      const { mockContext } = renderWithTheme(<ThemeSwitcher variant="dropdown" />)
      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('option', { name: /Dark/i }))
      expect(mockContext.setMode).toHaveBeenCalledWith('dark')
    })

    it('closes dropdown after selection', () => {
      renderWithTheme(<ThemeSwitcher variant="dropdown" />)
      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('option', { name: /Dark/i }))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes dropdown on Escape', () => {
      renderWithTheme(<ThemeSwitcher variant="dropdown" />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('marks current theme as selected', () => {
      renderWithTheme(<ThemeSwitcher variant="dropdown" />, { mode: 'dark' })
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('option', { name: /Dark/i })).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('segmented variant', () => {
    it('renders radiogroup', () => {
      renderWithTheme(<ThemeSwitcher variant="segmented" />)
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('shows all options', () => {
      renderWithTheme(<ThemeSwitcher variant="segmented" />)
      expect(screen.getAllByRole('radio')).toHaveLength(3)
    })

    it('selects theme on click', () => {
      const { mockContext } = renderWithTheme(<ThemeSwitcher variant="segmented" />)
      const darkButton = screen.getAllByRole('radio')[1]
      fireEvent.click(darkButton)
      expect(mockContext.setMode).toHaveBeenCalledWith('dark')
    })

    it('marks current theme as checked', () => {
      renderWithTheme(<ThemeSwitcher variant="segmented" />, { mode: 'light' })
      const lightButton = screen.getAllByRole('radio')[0]
      expect(lightButton).toHaveAttribute('aria-checked', 'true')
    })

    it('shows labels when showLabel is true', () => {
      renderWithTheme(<ThemeSwitcher variant="segmented" showLabel />)
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('applies sm size classes', () => {
      const { container } = renderWithTheme(<ThemeSwitcher size="sm" />)
      expect(container.querySelector('button')).toHaveClass('p-1.5')
    })

    it('applies md size classes by default', () => {
      const { container } = renderWithTheme(<ThemeSwitcher />)
      expect(container.querySelector('button')).toHaveClass('p-2')
    })

    it('applies lg size classes', () => {
      const { container } = renderWithTheme(<ThemeSwitcher size="lg" />)
      expect(container.querySelector('button')).toHaveClass('p-2.5')
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = renderWithTheme(<ThemeSwitcher className="custom-class" />)
      expect(container.querySelector('button')).toHaveClass('custom-class')
    })
  })
})
