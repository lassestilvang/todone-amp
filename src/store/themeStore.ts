import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
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

export interface ThemeState {
  mode: ThemeMode
  theme: ThemeName
  resolvedMode: 'light' | 'dark'

  setMode: (mode: ThemeMode) => void
  setTheme: (theme: ThemeName) => void
  initialize: () => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

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
