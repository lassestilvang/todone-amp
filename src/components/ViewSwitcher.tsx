import { List, LayoutGrid, Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useViewStore } from '@/store/viewStore'
import type { ViewType } from '@/store/viewStore'

interface ViewSwitcherProps {
  variant?: 'inline' | 'buttons'
}

export function ViewSwitcher({ variant = 'buttons' }: ViewSwitcherProps) {
  const { selectedView, setSelectedView } = useViewStore()

  const views: Array<{ type: ViewType; icon: React.ReactNode; label: string }> = [
    { type: 'list', icon: <List size={18} />, label: 'List' },
    { type: 'board', icon: <LayoutGrid size={18} />, label: 'Board' },
    { type: 'calendar', icon: <Calendar size={18} />, label: 'Calendar' },
  ]

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1 p-1 bg-surface-tertiary rounded-lg">
        {views.map((view) => (
          <button
            key={view.type}
            onClick={() => setSelectedView(view.type)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              selectedView === view.type
                ? 'bg-surface-primary text-brand-600 shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            )}
            title={view.label}
          >
            {view.icon}
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        ))}
      </div>
    )
  }

  // buttons variant
  return (
    <div className="flex items-center gap-2">
      {views.map((view) => (
        <button
          key={view.type}
          onClick={() => setSelectedView(view.type)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all',
            selectedView === view.type
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-interactive-secondary text-content-secondary hover:bg-surface-tertiary'
          )}
          title={view.label}
        >
          {view.icon}
          {view.label}
        </button>
      ))}
    </div>
  )
}
