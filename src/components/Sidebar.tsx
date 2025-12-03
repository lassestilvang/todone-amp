import React from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import { Plus, Star, Inbox, Calendar, TrendingUp } from 'lucide-react'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const projects = useProjectStore((state) => state.projects)
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId)
  const selectProject = useProjectStore((state) => state.selectProject)
  const user = useAuthStore((state) => state.user)

  const mainViews = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: TrendingUp },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            T
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Todone</h1>
            <p className="text-xs text-gray-500">From to-do to todone</p>
          </div>
        </div>
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
                currentView === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Projects */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Projects</h3>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Plus className="w-4 h-4 text-gray-400" />
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
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 truncate">{project.name}</span>
                {project.isFavorite && <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
