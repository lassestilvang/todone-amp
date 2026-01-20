import { useContext } from 'react'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

/**
 * Hook to access the current theme context.
 *
 * Provides access to the current theme state and methods to change it.
 * Must be used within a component wrapped by `ThemeProvider`.
 *
 * @returns The theme context value containing:
 *   - `mode` - Current theme mode ('light' | 'dark' | 'system')
 *   - `theme` - Current color theme name
 *   - `resolvedMode` - Resolved mode ('light' | 'dark')
 *   - `isDark` - Boolean shortcut for dark mode check
 *   - `setMode` - Function to change theme mode
 *   - `setTheme` - Function to change color theme
 *
 * @throws Error if used outside of a ThemeProvider
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { isDark, setMode } = useTheme()
 *
 *   return (
 *     <button onClick={() => setMode(isDark ? 'light' : 'dark')}>
 *       {isDark ? '☀️' : '🌙'}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ThemeSelector() {
 *   const { theme, setTheme } = useTheme()
 *
 *   return (
 *     <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *       <option value="default">Default</option>
 *       <option value="nord">Nord</option>
 *       <option value="dracula">Dracula</option>
 *     </select>
 *   )
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
