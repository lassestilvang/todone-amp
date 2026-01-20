import { Plus, Inbox, Calendar, Filter, Tag, Sparkles, Star, Bell } from 'lucide-react'
import { Button } from '@/components/Button'

type AccentColor = 'brand' | 'purple' | 'indigo' | 'teal'

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  accent?: AccentColor
}

const accentStyles: Record<AccentColor, { bg: string; icon: string; ring: string }> = {
  brand: {
    bg: 'bg-brand-100 dark:bg-brand-900/30',
    icon: 'text-brand-500 dark:text-brand-400',
    ring: 'ring-brand-200 dark:ring-brand-800',
  },
  purple: {
    bg: 'bg-accent-purple-subtle',
    icon: 'text-accent-purple',
    ring: 'ring-accent-purple-subtle',
  },
  indigo: {
    bg: 'bg-accent-indigo-subtle',
    icon: 'text-accent-indigo',
    ring: 'ring-accent-indigo-subtle',
  },
  teal: {
    bg: 'bg-accent-teal-subtle',
    icon: 'text-accent-teal',
    ring: 'ring-accent-teal-subtle',
  },
}

function DecorativeRings({ accent }: { accent: AccentColor }) {
  const style = accentStyles[accent]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className={`absolute -top-4 -left-4 w-32 h-32 rounded-full ${style.bg} opacity-30 blur-xl`}
      />
      <div
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${style.bg} opacity-20 blur-lg`}
      />
    </div>
  )
}

function FloatingDots({ accent }: { accent: AccentColor }) {
  const style = accentStyles[accent]
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className={`absolute top-8 left-12 w-2 h-2 rounded-full ${style.bg} opacity-60 animate-pulse`}
      />
      <div
        className={`absolute top-16 right-8 w-1.5 h-1.5 rounded-full ${style.bg} opacity-40 animate-pulse`}
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className={`absolute bottom-12 left-8 w-1 h-1 rounded-full ${style.bg} opacity-50 animate-pulse`}
        style={{ animationDelay: '1s' }}
      />
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  accent = 'brand',
}: EmptyStateProps) {
  const style = accentStyles[accent]

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-8">
      <DecorativeRings accent={accent} />
      <FloatingDots accent={accent} />
      <div
        className={`relative w-20 h-20 mb-4 rounded-full ${style.bg} ring-4 ${style.ring} flex items-center justify-center ${style.icon} transition-all duration-300 hover:scale-105`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-content-primary mb-2">{title}</h3>
      <p className="text-content-tertiary text-center mb-6 max-w-sm">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function EmptyInboxState({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-10 h-10" />}
      title="Your inbox is empty"
      description="All tasks are organized into projects or completed. Start fresh with a quick add!"
      action={{ label: 'Add a task', onClick: onQuickAdd }}
      accent="brand"
    />
  )
}

export function EmptyProjectState({ projectName }: { projectName?: string }) {
  return (
    <EmptyState
      icon={<Inbox className="w-10 h-10" />}
      title={`No tasks in ${projectName || 'this project'}`}
      description="Create your first task in this project to get started."
      action={{ label: 'Create a task', onClick: () => {} }}
      accent="indigo"
    />
  )
}

export function EmptySearchState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Filter className="w-10 h-10" />}
      title="No results found"
      description={`We couldn't find any tasks matching "${query}". Try adjusting your search.`}
      accent="purple"
    />
  )
}

export function EmptyFilterState({ filterName }: { filterName?: string }) {
  return (
    <EmptyState
      icon={<Filter className="w-10 h-10" />}
      title={`No tasks in ${filterName || 'this filter'}`}
      description="Try creating a new filter or adjusting your current filter criteria."
      accent="purple"
    />
  )
}

export function EmptyLabelsState() {
  return (
    <EmptyState
      icon={<Tag className="w-10 h-10" />}
      title="No labels yet"
      description="Create labels to organize and categorize your tasks."
      action={{ label: 'Create a label', onClick: () => {} }}
      accent="teal"
    />
  )
}

export function EmptyTodayState({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-10 h-10" />}
      title="You're all caught up!"
      description="No tasks due today. Add one to get started or work on upcoming tasks."
      action={{ label: 'Add a task', onClick: onQuickAdd }}
      accent="brand"
    />
  )
}

export function EmptyTemplatesState() {
  return (
    <EmptyState
      icon={<Sparkles className="w-10 h-10" />}
      title="No templates yet"
      description="Templates help you quickly create projects with pre-configured sections and tasks."
      action={{ label: 'Browse templates', onClick: () => {} }}
      accent="purple"
    />
  )
}

export function EmptyFavoritesState() {
  return (
    <EmptyState
      icon={<Star className="w-10 h-10" />}
      title="No favorites yet"
      description="Mark tasks, projects, or labels as favorites for quick access."
      accent="teal"
    />
  )
}

export function EmptyNotificationsState() {
  return (
    <EmptyState
      icon={<Bell className="w-10 h-10" />}
      title="You're all caught up!"
      description="No new notifications. You'll see updates from projects and collaborators here."
      accent="indigo"
    />
  )
}

export function FirstTimeUserState({ onStartTour }: { onStartTour: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-10 h-10" />}
      title="Welcome to Todone"
      description="Let's get you set up! Take a quick tour to learn the basics or start adding your first tasks."
      action={{ label: 'Take a tour', onClick: onStartTour }}
      accent="brand"
    />
  )
}
