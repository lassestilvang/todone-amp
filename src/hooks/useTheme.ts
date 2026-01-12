import { useEffect } from 'react'
import { useThemeStore, ThemeName } from '@/store/themeStore'

const themeClassMap: Record<ThemeName, string> = {
  default: '',
  nord: 'theme-nord',
  dracula: 'theme-dracula',
  'solarized-light': 'theme-solarized-light',
  'solarized-dark': 'theme-solarized-dark',
}

export function useTheme() {
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

  return {
    mode,
    theme,
    resolvedMode,
    setMode,
    setTheme,
    isDark: resolvedMode === 'dark',
  }
}
