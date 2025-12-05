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
    <div className={cn('flex h-screen bg-white', className)}>
      {/* Desktop Sidebar */}
      {sidebar && <div className="hidden md:block">{sidebar}</div>}

      {/* Mobile Navigation */}
      {mobileNav && <div>{mobileNav}</div>}

      {/* Main Content */}
      <main className={cn('flex-1 flex flex-col overflow-hidden', 'pb-16 md:pb-0')}>
        {children}
      </main>
    </div>
  )
}
