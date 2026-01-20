/**
 * Lazy theme loader utilities for optimized theme stylesheet loading.
 *
 * This module provides functions to preload and track loaded theme stylesheets,
 * improving performance by only loading theme CSS when needed.
 *
 * @module lazyThemeLoader
 */

import type { ThemeName } from '@/store/themeStore'

/**
 * Set tracking which themes have been loaded.
 * The 'default' theme is always considered loaded as it's bundled with the app.
 * @internal
 */
const loadedThemes = new Set<ThemeName>(['default'])

/**
 * Maps theme names to their stylesheet file names.
 * @internal
 */
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

/**
 * Checks if a theme's stylesheet has been loaded.
 *
 * @param theme - The theme name to check
 * @returns `true` if the theme is loaded, `false` otherwise
 *
 * @example
 * ```ts
 * if (!isThemeLoaded('nord')) {
 *   preloadTheme('nord')
 * }
 * ```
 */
export function isThemeLoaded(theme: ThemeName): boolean {
  return loadedThemes.has(theme)
}

/**
 * Preloads a theme's stylesheet by adding a prefetch link to the document head.
 *
 * This allows the browser to fetch the stylesheet in the background before
 * it's needed, reducing the delay when the user switches themes.
 *
 * Does nothing if:
 * - The theme is 'default' (bundled with app)
 * - The theme is already loaded
 * - The theme name is invalid
 *
 * @param theme - The theme name to preload
 *
 * @example
 * ```ts
 * // Preload themes the user might switch to
 * preloadTheme('nord')
 * preloadTheme('dracula')
 * ```
 */
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

/**
 * Marks a theme as loaded in the tracking set.
 *
 * Call this after a theme's stylesheet has been applied to prevent
 * redundant preload attempts.
 *
 * @param theme - The theme name to mark as loaded
 *
 * @example
 * ```ts
 * // After theme stylesheet is applied
 * markThemeAsLoaded('nord')
 * ```
 */
export function markThemeAsLoaded(theme: ThemeName): void {
  loadedThemes.add(theme)
}

/**
 * Returns an array of all currently loaded theme names.
 *
 * @returns Array of loaded theme names
 *
 * @example
 * ```ts
 * const loaded = getLoadedThemes()
 * console.log(loaded) // ['default', 'nord']
 * ```
 */
export function getLoadedThemes(): ThemeName[] {
  return Array.from(loadedThemes)
}
