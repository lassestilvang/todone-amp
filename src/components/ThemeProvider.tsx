import { useEffect, ReactNode } from 'react'
import { useThemeStore, ThemeName } from '@/store/themeStore'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

const themeClassMap: Record<ThemeName, string> = {
  default: '',
  nord: 'theme-nord',
  dracula: 'theme-dracula',
  'solarized-light': 'theme-solarized-light',
  'solarized-dark': 'theme-solarized-dark',
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, theme, resolvedMode, setMode, setTheme, initialize } = useThemeStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedMode)

    Object.values(themeClassMap).forEach((cls) => {
      if (cls) root.classList.remove(cls)
    })
    const themeClass = themeClassMap[theme]
    if (themeClass) {
      root.classList.add(themeClass)
    }
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
