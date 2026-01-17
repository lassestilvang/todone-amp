import { useEffect, useRef, ReactNode } from 'react'
import { useThemeStore, ThemeName } from '@/store/themeStore'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

const themeClassMap: Record<ThemeName, string> = {
  default: '',
  nord: 'theme-nord',
  dracula: 'theme-dracula',
  'solarized-light': 'theme-solarized-light',
  'solarized-dark': 'theme-solarized-dark',
}

const THEME_TRANSITION_DURATION = 150

interface ThemeProviderProps {
  children: ReactNode
}

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
