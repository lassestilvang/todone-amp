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
    <div className="bg-surface-primary rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-content-primary">Completed This Week</h3>
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
          <CheckCircle2 className="w-12 h-12 text-content-tertiary mx-auto mb-3" />
          <p className="text-content-tertiary">No tasks completed this week yet</p>
          <p className="text-sm text-content-tertiary mt-1">Complete some tasks to see them here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedTasks.slice(0, 10).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-tertiary"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-content-secondary line-through flex-1 truncate">
                {task.content}
              </span>
              {task.priority && (
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    task.priority === 'p1' && 'bg-priority-p1 text-priority-p1',
                    task.priority === 'p2' && 'bg-priority-p2 text-priority-p2',
                    task.priority === 'p3' && 'bg-priority-p3 text-priority-p3',
                    task.priority === 'p4' && 'bg-priority-none text-priority-none'
                  )}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {tasks.length > 10 && (
            <p className="text-sm text-content-tertiary text-center pt-2">
              +{tasks.length - 10} more tasks
            </p>
          )}
        </div>
      )}
    </div>
  )
}
