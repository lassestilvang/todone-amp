import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme mode options for controlling light/dark appearance.
 * - `'light'` - Forces light mode
 * - `'dark'` - Forces dark mode
 * - `'system'` - Follows the operating system's color scheme preference
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Available color theme names.
 * Each theme provides a distinct color palette while maintaining
 * proper contrast ratios for accessibility (WCAG AA compliant).
 *
 * @see docs/THEMING_ARCHITECTURE.md for theme details
 */
export type ThemeName =
  | 'default'
  | 'nord'
  | 'dracula'
  | 'solarized-light'
  | 'solarized-dark'
  | 'one-dark'
  | 'github-light'
  | 'github-dark'
  | 'high-contrast'

/**
 * Theme store state interface.
 * Manages theme mode, color theme selection, and provides
 * methods for theme manipulation.
 */
export interface ThemeState {
  /** Current theme mode setting (light/dark/system) */
  mode: ThemeMode
  /** Current color theme name */
  theme: ThemeName
  /** Resolved mode after applying system preference (always 'light' or 'dark') */
  resolvedMode: 'light' | 'dark'

  /**
   * Sets the theme mode and updates resolvedMode accordingly.
   * @param mode - The theme mode to set
   */
  setMode: (mode: ThemeMode) => void

  /**
   * Sets the color theme.
   * @param theme - The theme name to apply
   */
  setTheme: (theme: ThemeName) => void

  /**
   * Initializes the theme store.
   * Resolves the current mode and sets up system preference listeners.
   * Should be called once on app mount.
   */
  initialize: () => void
}

/**
 * Detects the operating system's color scheme preference.
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 * @internal
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolves a ThemeMode to an explicit light/dark value.
 * @param mode - The theme mode to resolve
 * @returns 'light' or 'dark' based on the mode and system preference
 * @internal
 */
const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

/**
 * Zustand store for managing application theming.
 *
 * Features:
 * - Persists mode and theme to localStorage under 'todone-theme' key
 * - Listens for system color scheme changes when in 'system' mode
 * - Provides resolved mode for components to use directly
 *
 * @example
 * ```tsx
 * const { mode, theme, resolvedMode, setMode, setTheme } = useThemeStore()
 *
 * // Toggle between light and dark
 * setMode(resolvedMode === 'dark' ? 'light' : 'dark')
 *
 * // Switch to Nord theme
 * setTheme('nord')
 * ```
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      theme: 'default',
      resolvedMode: 'light',

      setMode: (mode: ThemeMode) => {
        const resolvedMode = resolveMode(mode)
        set({ mode, resolvedMode })
      },

      setTheme: (theme: ThemeName) => {
        set({ theme })
      },

      initialize: () => {
        const { mode } = get()
        const resolvedMode = resolveMode(mode)
        set({ resolvedMode })

        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          const handleChange = () => {
            const currentMode = get().mode
            if (currentMode === 'system') {
              set({ resolvedMode: getSystemTheme() })
            }
          }
          mediaQuery.addEventListener('change', handleChange)
        }
      },
    }),
    {
      name: 'todone-theme',
      partialize: (state) => ({ mode: state.mode, theme: state.theme }),
    }
  )
)
