import { Inbox, Calendar, Clock, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'

interface MobileNavProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
  ]

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-primary border-t border-border z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors min-h-[48px]',
                currentView === item.id
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30'
                  : 'text-content-secondary hover:bg-surface-tertiary active:bg-surface-tertiary'
              )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-4 left-4 right-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-content-primary">Todone</h1>
        <div className="flex items-center gap-2">
          <ThemeSwitcher variant="icon" size="sm" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-tertiary active:bg-surface-tertiary rounded-lg transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
