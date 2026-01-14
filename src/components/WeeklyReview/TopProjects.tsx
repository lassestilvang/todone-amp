import React from 'react'
import { FolderKanban, Hash } from 'lucide-react'
import type { Project } from '@/types'

interface TopProjectsProps {
  projects: Array<{ project: Project; tasksCompleted: number }>
}

export const TopProjects: React.FC<TopProjectsProps> = ({ projects }) => {
  const maxTasks = Math.max(...projects.map((p) => p.tasksCompleted), 1)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <FolderKanban className="w-5 h-5 text-brand-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Projects</h3>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <Hash className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No project activity this week</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(({ project, tasksCompleted }, index) => (
            <div key={project.id} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {tasksCompleted} tasks
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(tasksCompleted / maxTasks) * 100}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-6 text-right">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
