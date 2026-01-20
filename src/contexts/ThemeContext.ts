import { createContext } from 'react'
import type { ThemeMode, ThemeName } from '@/store/themeStore'

/**
 * Context value interface for theme state and actions.
 * Provides both the current theme state and methods to modify it.
 */
export interface ThemeContextValue {
  /**
   * Current theme mode setting.
   * Can be 'light', 'dark', or 'system'.
   */
  mode: ThemeMode

  /**
   * Current color theme name (e.g., 'default', 'nord', 'dracula').
   */
  theme: ThemeName

  /**
   * The resolved light/dark mode after applying system preference.
   * Always either 'light' or 'dark', never 'system'.
   */
  resolvedMode: 'light' | 'dark'

  /**
   * Convenience boolean indicating if dark mode is active.
   * Equivalent to `resolvedMode === 'dark'`.
   */
  isDark: boolean

  /**
   * Sets the theme mode.
   * @param mode - The mode to set ('light', 'dark', or 'system')
   */
  setMode: (mode: ThemeMode) => void

  /**
   * Sets the color theme.
   * @param theme - The theme name to apply
   */
  setTheme: (theme: ThemeName) => void
}

/**
 * React context for theme state and actions.
 * Use the `useTheme` hook to access this context.
 *
 * @example
 * ```tsx
 * import { useTheme } from '@/hooks/useTheme'
 *
 * function MyComponent() {
 *   const { isDark, setMode } = useTheme()
 *   return (
 *     <button onClick={() => setMode(isDark ? 'light' : 'dark')}>
 *       Toggle Theme
 *     </button>
 *   )
 * }
 * ```
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
