import { useContext } from 'react'
import { ThemeContext, ThemeContextValue } from '@/contexts/ThemeContext'

/**
 * Hook to access the current theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
