import { useEffect, useRef, ReactNode } from 'react'
import { useThemeStore, ThemeName } from '@/store/themeStore'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

/**
 * Maps theme names to their corresponding CSS class names.
 * The 'default' theme uses no additional class (empty string).
 * @internal
 */
const themeClassMap: Record<ThemeName, string> = {
  default: '',
  nord: 'theme-nord',
  dracula: 'theme-dracula',
  'solarized-light': 'theme-solarized-light',
  'solarized-dark': 'theme-solarized-dark',
  'one-dark': 'theme-one-dark',
  'github-light': 'theme-github-light',
  'github-dark': 'theme-github-dark',
  'high-contrast': 'theme-high-contrast',
}

/**
 * Duration of theme transition animation in milliseconds.
 * Matches the CSS variable `--theme-transition-duration`.
 * @internal
 */
const THEME_TRANSITION_DURATION = 150

/**
 * Props for the ThemeProvider component.
 */
interface ThemeProviderProps {
  /** Child components that will have access to theme context */
  children: ReactNode
}

/**
 * Theme provider component that manages theme state and DOM updates.
 *
 * This component:
 * - Initializes the theme store on mount
 * - Syncs theme state with the DOM (adds/removes CSS classes on `<html>`)
 * - Provides theme context to all child components
 * - Manages smooth theme transition animations
 *
 * Must wrap the application root. Only one ThemeProvider should exist.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@/components/ThemeProvider'
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   )
 * }
 * ```
 *
 * @see useTheme - Hook to access theme context from child components
 * @see ThemeContext - The underlying React context
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, theme, resolvedMode, setMode, setTheme, initialize } = useThemeStore()
  const isInitialMount = useRef(true)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const root = document.documentElement

    // Enable transition animation only after initial mount
    if (!isInitialMount.current) {
      root.classList.add('theme-transition')
    }

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedMode)

    Object.values(themeClassMap).forEach((cls) => {
      if (cls) root.classList.remove(cls)
    })
    const themeClass = themeClassMap[theme]
    if (themeClass) {
      root.classList.add(themeClass)
    }

    // Remove transition class after animation completes to avoid affecting other animations
    if (!isInitialMount.current) {
      const timer = setTimeout(() => {
        root.classList.remove('theme-transition')
      }, THEME_TRANSITION_DURATION)
      return () => clearTimeout(timer)
    }

    isInitialMount.current = false
  }, [resolvedMode, theme])

  const value: ThemeContextValue = {
    mode,
    theme,
    resolvedMode,
    isDark: resolvedMode === 'dark',
    setMode,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
