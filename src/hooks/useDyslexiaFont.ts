import { useEffect, useState } from 'react'
import {
  isDyslexiaFontEnabled,
  enableDyslexiaFont,
  disableDyslexiaFont,
} from '@/utils/dyslexiaFont'

/**
 * Hook to manage dyslexia-friendly font preference
 * @returns Object with enabled status and toggle function
 */
export const useDyslexiaFont = (): {
  enabled: boolean
  toggle: () => void
  enable: () => void
  disable: () => void
} => {
  const [enabled, setEnabled] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    setEnabled(isDyslexiaFontEnabled())

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enableDyslexiaFont') {
        setEnabled(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggle = () => {
    if (enabled) {
      disableDyslexiaFont()
      setEnabled(false)
    } else {
      enableDyslexiaFont()
      setEnabled(true)
    }
  }

  const enable = () => {
    enableDyslexiaFont()
    setEnabled(true)
  }

  const disable = () => {
    disableDyslexiaFont()
    setEnabled(false)
  }

  return { enabled, toggle, enable, disable }
}
