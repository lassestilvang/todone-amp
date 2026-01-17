import React, { useState } from 'react'
import { Menu, X, Home, Calendar, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'

interface MobileNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
  onOpenSettings?: () => void
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onViewChange,
  onOpenSettings,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  const mainViews = [
    { id: 'inbox', label: 'Inbox', icon: Home },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: TrendingUp },
  ]

  const handleViewChange = (viewId: string) => {
    onViewChange(viewId)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface-primary border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="font-bold text-content-primary">Todone</span>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden fixed top-16 left-0 right-0 bg-surface-primary border-b border-border z-30',
          'transition-transform duration-200',
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {mainViews.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleViewChange(id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                currentView === id
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-content-secondary hover:bg-surface-tertiary'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}

          <hr className="my-2" />

          {user && (
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-content-secondary hover:bg-surface-tertiary transition-colors"
            >
              <Settings className="w-5 h-5" />
              Profile
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Navigation Bar (for mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-primary border-t border-border flex justify-around z-40">
        {mainViews.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleViewChange(id)}
            className={cn(
              'flex-1 flex items-center justify-center py-3 transition-colors',
              currentView === id
                ? 'text-brand-600 border-t-2 border-brand-600'
                : 'text-content-secondary hover:text-content-primary'
            )}
            aria-label={`Navigate to ${id}`}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Add padding to main content for mobile */}
      <div className="md:hidden h-16" />
    </>
  )
}
