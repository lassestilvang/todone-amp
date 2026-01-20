import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

export function useDynamicFavicon() {
  const { mode } = useThemeStore()

  useEffect(() => {
    const updateFavicon = () => {
      const isDark =
        mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      const faviconPath = isDark ? '/icons/favicon-dark.svg' : '/icons/favicon-light.svg'

      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (link) {
        link.href = faviconPath
      } else {
        link = document.createElement('link')
        link.rel = 'icon'
        link.type = 'image/svg+xml'
        link.href = faviconPath
        document.head.appendChild(link)
      }

      const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (themeColor) {
        themeColor.content = isDark ? '#111827' : '#10b981'
      }
    }

    updateFavicon()

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateFavicon)
      return () => mediaQuery.removeEventListener('change', updateFavicon)
    }
  }, [mode])
}
