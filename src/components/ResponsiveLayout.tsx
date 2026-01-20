import React from 'react'
import { cn } from '@/utils/cn'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  mobileNav?: React.ReactNode
  className?: string
}

/**
 * Responsive layout wrapper that handles desktop and mobile layouts
 * - Desktop: Sidebar + Main content
 * - Mobile: Full-width content with mobile navigation
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  mobileNav,
  className,
}) => {
  return (
    <div className={cn('flex h-screen bg-surface-primary bg-pattern-dots', className)}>
      {/* Desktop Sidebar - isolated layout for performance */}
      {sidebar && <aside className="hidden md:block contain-layout">{sidebar}</aside>}

      {/* Mobile Navigation - no contain on parent since children use fixed positioning */}
      {mobileNav && <>{mobileNav}</>}

      {/* Main Content - paint containment for scroll performance */}
      <main className={cn('flex-1 flex flex-col overflow-hidden md:contain-paint', 'pt-16 pb-16 md:pt-0 md:pb-0')}>
        {children}
      </main>
    </div>
  )
}
