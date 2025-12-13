import React from 'react'

/**
 * Skip navigation links for keyboard accessibility
 * Allows users to jump directly to main content, search, or other key sections
 * WCAG 2.1 Level A: 2.4.1 Bypass Blocks
 */
export const SkipNav: React.FC = () => {
  const handleSkipClick = (targetId: string) => {
    const element = document.getElementById(targetId)
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          handleSkipClick('main-content')
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md focus:outline-2 focus:outline-offset-2 focus:outline-brand-400"
      >
        Skip to main content
      </a>

      {/* Skip to sidebar */}
      <a
        href="#sidebar"
        onClick={(e) => {
          e.preventDefault()
          handleSkipClick('sidebar')
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-12 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md focus:outline-2 focus:outline-offset-2 focus:outline-brand-400"
      >
        Skip to sidebar navigation
      </a>

      {/* Skip to search */}
      <a
        href="#search-bar"
        onClick={(e) => {
          e.preventDefault()
          handleSkipClick('search-bar')
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-24 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md focus:outline-2 focus:outline-offset-2 focus:outline-brand-400"
      >
        Skip to search
      </a>
    </>
  )
}
