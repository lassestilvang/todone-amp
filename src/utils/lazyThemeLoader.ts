import type { ThemeName } from '@/store/themeStore'

const loadedThemes = new Set<ThemeName>(['default'])

const themeStylesheets: Record<Exclude<ThemeName, 'default'>, string> = {
  nord: 'nord',
  dracula: 'dracula',
  'solarized-light': 'solarized-light',
  'solarized-dark': 'solarized-dark',
  'one-dark': 'one-dark',
  'github-light': 'github-light',
  'github-dark': 'github-dark',
  'high-contrast': 'high-contrast',
}

export function isThemeLoaded(theme: ThemeName): boolean {
  return loadedThemes.has(theme)
}

export function preloadTheme(theme: ThemeName): void {
  if (theme === 'default' || loadedThemes.has(theme)) return

  const stylesheetName = themeStylesheets[theme]
  if (!stylesheetName) return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'style'
  link.href = `/src/styles/themes/${stylesheetName}.css`
  document.head.appendChild(link)
}

export function markThemeAsLoaded(theme: ThemeName): void {
  loadedThemes.add(theme)
}

export function getLoadedThemes(): ThemeName[] {
  return Array.from(loadedThemes)
}
