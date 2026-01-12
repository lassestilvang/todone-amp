import { describe, it, expect, beforeEach, vi } from 'vitest'
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
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
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
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      useThemeStore.setState({ mode: 'system' })
      useThemeStore.getState().initialize()
      expect(useThemeStore.getState().resolvedMode).toBe('dark')
    })
  })
})
