import React from 'react'
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

interface SlippedTasksProps {
  tasks: Task[]
}

export const SlippedTasks: React.FC<SlippedTasksProps> = ({ tasks }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slipped Tasks</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No slipped tasks this week</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Great job staying on track!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-medium truncate">{task.content}</p>
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
              </div>
              {task.priority && (
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded flex-shrink-0',
                    task.priority === 'p1' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    task.priority === 'p2' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                    task.priority === 'p3' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    task.priority === 'p4' && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
