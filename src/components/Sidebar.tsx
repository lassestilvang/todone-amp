import React, { useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { useLabelStore } from '@/store/labelStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { StreakBadge } from './StreakDisplay'
import { CreateProjectModal } from './CreateProjectModal'
import { cn } from '@/utils/cn'
import { Plus, Star, Inbox, Calendar, TrendingUp, Tag, Sliders, ChevronLeft, ChevronRight, Grid3X3, CalendarRange } from 'lucide-react'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isTablet } = useIsMobile()
  const projects = useProjectStore((state) => state.projects)
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId)
  const selectProject = useProjectStore((state) => state.selectProject)
  const labels = useLabelStore((state) => state.labels)
  const user = useAuthStore((state) => state.user)

  const mainViews = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: TrendingUp },
    { id: 'eisenhower', label: 'Eisenhower', icon: Grid3X3 },
    { id: 'weekly-review', label: 'Weekly Review', icon: CalendarRange },
  ]

  // Auto-collapse on tablet if not explicitly expanded
  const shouldShowCollapsed = isTablet && isCollapsed
  const sidebarWidth = shouldShowCollapsed ? 'w-16' : 'w-64'

  return (
    <div className={cn('bg-surface-primary border-r border-border flex flex-col h-screen transition-all duration-300', sidebarWidth)}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        {!shouldShowCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <h1 className="font-bold text-content-primary">Todone</h1>
              <p className="text-xs text-content-tertiary">From to-do to todone</p>
            </div>
          </div>
        )}
        {isTablet && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-surface-tertiary rounded transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Main Views */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-1 mb-6">
          {mainViews.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                shouldShowCollapsed && 'justify-center px-2',
                currentView === id
                  ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  : 'text-content-secondary hover:bg-surface-tertiary'
              )}
              title={shouldShowCollapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!shouldShowCollapsed && (
                <>
                  {label}
                  {id === 'today' && <StreakBadge inline />}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Projects */}
        {!shouldShowCollapsed && (
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <h3 className="text-xs font-semibold text-content-secondary uppercase">Projects</h3>
              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                title="Create new project"
              >
                <Plus className="w-4 h-4 text-content-tertiary" />
              </button>
            </div>

            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    selectProject(project.id)
                    onViewChange(`project-${project.id}`)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
                    selectedProjectId === project.id
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                      : 'text-content-secondary hover:bg-surface-tertiary'
                  )}
                  title={selectedProjectId === project.id ? project.name : undefined}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  {project.isFavorite && <Star className="w-4 h-4 text-icon-yellow" fill="currentColor" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        {!shouldShowCollapsed && labels.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <Tag className="w-3 h-3 text-content-tertiary" />
              <h3 className="text-xs font-semibold text-content-secondary uppercase">Labels</h3>
            </div>

            <div className="space-y-1">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => onViewChange(`label-${label.id}`)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
                    currentView === `label-${label.id}`
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                      : 'text-content-secondary hover:bg-surface-tertiary'
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 truncate">{label.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        {!shouldShowCollapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <Sliders className="w-3 h-3 text-content-tertiary" />
              <h3 className="text-xs font-semibold text-content-secondary uppercase">Filters</h3>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => onViewChange('filter-completed')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
                  currentView === 'filter-completed'
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                    : 'text-content-secondary hover:bg-surface-tertiary'
                )}
              >
                ✓ Completed
              </button>
              <button
                onClick={() => onViewChange('filter-overdue')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
                  currentView === 'filter-overdue'
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                    : 'text-content-secondary hover:bg-surface-tertiary'
                )}
              >
                ⚠ Overdue
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="px-4 py-4 border-t border-border">
          <div className={cn('flex items-center gap-2 p-2 rounded-md hover:bg-surface-tertiary cursor-pointer', shouldShowCollapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!shouldShowCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate">{user.name}</p>
                <p className="text-xs text-content-tertiary truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
      />
    </div>
  )
}
