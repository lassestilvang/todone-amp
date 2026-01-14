import React from 'react'
import { CheckCircle2, PartyPopper, Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

interface CompletedThisWeekProps {
  tasks: Task[]
}

export const CompletedThisWeek: React.FC<CompletedThisWeekProps> = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { p1: 0, p2: 1, p3: 2, p4: 3, null: 4 }
    return (
      (priorityOrder[a.priority ?? 'null'] ?? 4) - (priorityOrder[b.priority ?? 'null'] ?? 4)
    )
  })

  const highPriorityCount = tasks.filter((t) => t.priority === 'p1' || t.priority === 'p2').length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Completed This Week
          </h3>
        </div>
        {highPriorityCount > 0 && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{highPriorityCount} high priority</span>
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No tasks completed this week yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Complete some tasks to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedTasks.slice(0, 10).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 line-through flex-1 truncate">
                {task.content}
              </span>
              {task.priority && (
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    task.priority === 'p1' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    task.priority === 'p2' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                    task.priority === 'p3' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    task.priority === 'p4' && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {tasks.length > 10 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
              +{tasks.length - 10} more tasks
            </p>
          )}
        </div>
      )}
    </div>
  )
}
