import React, { useEffect } from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import '../src/styles/themes/nord.css'
import '../src/styles/themes/dracula.css'
import '../src/styles/themes/solarized-light.css'
import '../src/styles/themes/solarized-dark.css'
import '../src/styles/themes/one-dark.css'
import '../src/styles/themes/github-light.css'
import '../src/styles/themes/github-dark.css'
import '../src/styles/themes/high-contrast.css'

const THEMES = [
  { name: 'default', label: 'Default', isDark: false },
  { name: 'default-dark', label: 'Default Dark', isDark: true },
  { name: 'nord', label: 'Nord', isDark: true },
  { name: 'dracula', label: 'Dracula', isDark: true },
  { name: 'solarized-light', label: 'Solarized Light', isDark: false },
  { name: 'solarized-dark', label: 'Solarized Dark', isDark: true },
  { name: 'one-dark', label: 'One Dark', isDark: true },
  { name: 'github-light', label: 'GitHub Light', isDark: false },
  { name: 'github-dark', label: 'GitHub Dark', isDark: true },
  { name: 'high-contrast', label: 'High Contrast', isDark: true },
] as const

type ThemeName = (typeof THEMES)[number]['name']

const ThemeDecorator = ({
  children,
  themeName,
}: {
  children: React.ReactNode
  themeName: ThemeName
}) => {
  useEffect(() => {
    const html = document.documentElement
    const themeConfig = THEMES.find((t) => t.name === themeName)

    // Clear all theme classes
    html.classList.remove(
      'dark',
      'theme-nord',
      'theme-dracula',
      'theme-solarized-light',
      'theme-solarized-dark',
      'theme-one-dark',
      'theme-github-light',
      'theme-github-dark',
      'theme-high-contrast'
    )

    // Apply the selected theme
    if (themeConfig?.isDark) {
      html.classList.add('dark')
    }

    // Apply theme-specific class (except for default)
    if (themeName !== 'default' && themeName !== 'default-dark') {
      html.classList.add(`theme-${themeName}`)
    }
  }, [themeName])

  return <>{children}</>
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'default',
      toolbar: {
        icon: 'paintbrush',
        items: THEMES.map((theme) => ({
          value: theme.name,
          title: theme.label,
          right: theme.isDark ? '🌙' : '☀️',
        })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const themeName = (context.globals.theme || 'default') as ThemeName
      return (
        <ThemeDecorator themeName={themeName}>
          <div className="min-h-screen bg-surface-primary text-content-primary p-4 transition-colors">
            <Story />
          </div>
        </ThemeDecorator>
      )
    },
  ],
}

export default preview
