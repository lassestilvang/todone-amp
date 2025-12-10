import { Inbox, Calendar, Clock, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState } from 'react'

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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  currentView === item.id
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-600 hover:bg-gray-50'
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
        <h1 className="text-xl font-bold text-gray-900">Todone</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
