import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({
      mode: 'system',
      theme: 'default',
      resolvedMode: 'light',
    })
    localStorage.clear()
  })

  describe('setMode', () => {
    it('should set mode to light', () => {
      useThemeStore.getState().setMode('light')
      expect(useThemeStore.getState().mode).toBe('light')
      expect(useThemeStore.getState().resolvedMode).toBe('light')
    })

    it('should set mode to dark', () => {
      useThemeStore.getState().setMode('dark')
      expect(useThemeStore.getState().mode).toBe('dark')
      expect(useThemeStore.getState().resolvedMode).toBe('dark')
    })

    it('should set mode to system and resolve based on preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mock((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: mock(() => {}),
          removeListener: mock(() => {}),
          addEventListener: mock(() => {}),
          removeEventListener: mock(() => {}),
          dispatchEvent: mock(() => {}),
        })),
      })

      useThemeStore.getState().setMode('system')
      expect(useThemeStore.getState().mode).toBe('system')
      expect(useThemeStore.getState().resolvedMode).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('should set theme to nord', () => {
      useThemeStore.getState().setTheme('nord')
      expect(useThemeStore.getState().theme).toBe('nord')
    })

    it('should set theme to dracula', () => {
      useThemeStore.getState().setTheme('dracula')
      expect(useThemeStore.getState().theme).toBe('dracula')
    })

    it('should set theme to solarized-light', () => {
      useThemeStore.getState().setTheme('solarized-light')
      expect(useThemeStore.getState().theme).toBe('solarized-light')
    })

    it('should set theme to solarized-dark', () => {
      useThemeStore.getState().setTheme('solarized-dark')
      expect(useThemeStore.getState().theme).toBe('solarized-dark')
    })
  })

  describe('initialize', () => {
    it('should resolve mode on initialize', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mock((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: mock(() => {}),
          removeListener: mock(() => {}),
          addEventListener: mock(() => {}),
          removeEventListener: mock(() => {}),
          dispatchEvent: mock(() => {}),
        })),
      })

      useThemeStore.setState({ mode: 'system' })
      useThemeStore.getState().initialize()
      expect(useThemeStore.getState().resolvedMode).toBe('dark')
    })

    it('should set up media query listener in system mode', () => {
      const addEventListenerMock = mock(() => {})
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mock((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: mock(() => {}),
          removeListener: mock(() => {}),
          addEventListener: addEventListenerMock,
          removeEventListener: mock(() => {}),
          dispatchEvent: mock(() => {}),
        })),
      })

      useThemeStore.setState({ mode: 'system' })
      useThemeStore.getState().initialize()
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('edge cases', () => {
    it('should handle rapid mode changes', () => {
      const store = useThemeStore.getState()
      store.setMode('light')
      store.setMode('dark')
      store.setMode('system')
      store.setMode('light')

      expect(useThemeStore.getState().mode).toBe('light')
      expect(useThemeStore.getState().resolvedMode).toBe('light')
    })

    it('should handle rapid theme changes', () => {
      const store = useThemeStore.getState()
      store.setTheme('nord')
      store.setTheme('dracula')
      store.setTheme('solarized-light')
      store.setTheme('github-dark')

      expect(useThemeStore.getState().theme).toBe('github-dark')
    })

    it('should maintain theme when mode changes', () => {
      useThemeStore.getState().setTheme('dracula')
      useThemeStore.getState().setMode('dark')
      expect(useThemeStore.getState().theme).toBe('dracula')
      expect(useThemeStore.getState().mode).toBe('dark')
    })

    it('should maintain mode when theme changes', () => {
      useThemeStore.getState().setMode('dark')
      useThemeStore.getState().setTheme('nord')
      expect(useThemeStore.getState().mode).toBe('dark')
      expect(useThemeStore.getState().theme).toBe('nord')
    })

    it('should handle setting same mode multiple times', () => {
      useThemeStore.getState().setMode('dark')
      useThemeStore.getState().setMode('dark')
      useThemeStore.getState().setMode('dark')

      expect(useThemeStore.getState().mode).toBe('dark')
      expect(useThemeStore.getState().resolvedMode).toBe('dark')
    })

    it('should handle setting same theme multiple times', () => {
      useThemeStore.getState().setTheme('nord')
      useThemeStore.getState().setTheme('nord')
      useThemeStore.getState().setTheme('nord')

      expect(useThemeStore.getState().theme).toBe('nord')
    })

    it('should resolve light mode when system prefers light', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mock((query: string) => ({
          matches: query === '(prefers-color-scheme: light)',
          media: query,
          onchange: null,
          addListener: mock(() => {}),
          removeListener: mock(() => {}),
          addEventListener: mock(() => {}),
          removeEventListener: mock(() => {}),
          dispatchEvent: mock(() => {}),
        })),
      })

      useThemeStore.getState().setMode('system')
      expect(useThemeStore.getState().resolvedMode).toBe('light')
    })

    it('should preserve resolved mode when switching from system to explicit', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mock((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: mock(() => {}),
          removeListener: mock(() => {}),
          addEventListener: mock(() => {}),
          removeEventListener: mock(() => {}),
          dispatchEvent: mock(() => {}),
        })),
      })

      useThemeStore.getState().setMode('system')
      expect(useThemeStore.getState().resolvedMode).toBe('dark')

      useThemeStore.getState().setMode('light')
      expect(useThemeStore.getState().resolvedMode).toBe('light')
    })
  })

  describe('all themes', () => {
    const themes = [
      'default',
      'nord',
      'dracula',
      'solarized-light',
      'solarized-dark',
      'one-dark',
      'github-light',
      'github-dark',
      'high-contrast',
    ] as const

    themes.forEach((theme) => {
      it(`should set theme to ${theme}`, () => {
        useThemeStore.getState().setTheme(theme)
        expect(useThemeStore.getState().theme).toBe(theme)
      })
    })
  })

  describe('all modes', () => {
    const modes = ['light', 'dark', 'system'] as const

    modes.forEach((mode) => {
      it(`should set mode to ${mode}`, () => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: mock((query: string) => ({
            matches: mode === 'system' ? query === '(prefers-color-scheme: dark)' : false,
            media: query,
            onchange: null,
            addListener: mock(() => {}),
            removeListener: mock(() => {}),
            addEventListener: mock(() => {}),
            removeEventListener: mock(() => {}),
            dispatchEvent: mock(() => {}),
          })),
        })

        useThemeStore.getState().setMode(mode)
        expect(useThemeStore.getState().mode).toBe(mode)
      })
    })
  })
})
