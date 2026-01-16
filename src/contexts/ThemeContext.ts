import { createContext } from 'react'
import type { ThemeMode, ThemeName } from '@/store/themeStore'

export interface ThemeContextValue {
  mode: ThemeMode
  theme: ThemeName
  resolvedMode: 'light' | 'dark'
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  setTheme: (theme: ThemeName) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
