import { Plus, Inbox, Calendar, Filter, Tag, Sparkles } from 'lucide-react'
import { Button } from '@/components/Button'

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-20 h-20 mb-4 rounded-full bg-surface-tertiary flex items-center justify-center text-content-tertiary">
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
      icon={<Inbox className="w-16 h-16" />}
      title="Your inbox is empty"
      description="All tasks are organized into projects or completed. Start fresh with a quick add!"
      action={{ label: 'Add a task', onClick: onQuickAdd }}
    />
  )
}

export function EmptyProjectState({ projectName }: { projectName?: string }) {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16" />}
      title={`No tasks in ${projectName || 'this project'}`}
      description="Create your first task in this project to get started."
      action={{ label: 'Create a task', onClick: () => {} }}
    />
  )
}

export function EmptySearchState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Filter className="w-16 h-16" />}
      title="No results found"
      description={`We couldn't find any tasks matching "${query}". Try adjusting your search.`}
    />
  )
}

export function EmptyFilterState({ filterName }: { filterName?: string }) {
  return (
    <EmptyState
      icon={<Filter className="w-16 h-16" />}
      title={`No tasks in ${filterName || 'this filter'}`}
      description="Try creating a new filter or adjusting your current filter criteria."
    />
  )
}

export function EmptyLabelsState() {
  return (
    <EmptyState
      icon={<Tag className="w-16 h-16" />}
      title="No labels yet"
      description="Create labels to organize and categorize your tasks."
      action={{ label: 'Create a label', onClick: () => {} }}
    />
  )
}

export function EmptyTodayState({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-16 h-16" />}
      title="You're all caught up!"
      description="No tasks due today. Add one to get started or work on upcoming tasks."
      action={{ label: 'Add a task', onClick: onQuickAdd }}
    />
  )
}

export function EmptyTemplatesState() {
  return (
    <EmptyState
      icon={<Sparkles className="w-16 h-16" />}
      title="No templates yet"
      description="Templates help you quickly create projects with pre-configured sections and tasks."
      action={{ label: 'Browse templates', onClick: () => {} }}
    />
  )
}

export function EmptyFavoritesState() {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16" />}
      title="No favorites yet"
      description="Mark tasks, projects, or labels as favorites for quick access."
    />
  )
}

export function EmptyNotificationsState() {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16" />}
      title="You're all caught up!"
      description="No new notifications. You'll see updates from projects and collaborators here."
    />
  )
}

export function FirstTimeUserState({ onStartTour }: { onStartTour: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-16 h-16" />}
      title="Welcome to Todone"
      description="Let's get you set up! Take a quick tour to learn the basics or start adding your first tasks."
      action={{ label: 'Take a tour', onClick: onStartTour }}
    />
  )
}
