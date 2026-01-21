import React from 'react'
import { CalendarDays, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

interface NextWeekPreviewProps {
  tasks: Task[]
}

export const NextWeekPreview: React.FC<NextWeekPreviewProps> = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const highPriorityCount = tasks.filter((t) => t.priority === 'p1' || t.priority === 'p2').length

  return (
    <div className="bg-surface-primary rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-icon-info" />
          <h3 className="text-lg font-semibold text-content-primary">Next Week Preview</h3>
        </div>
        <span className="text-sm text-content-tertiary">{tasks.length} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays className="w-12 h-12 text-content-tertiary mx-auto mb-3" />
          <p className="text-content-tertiary">No tasks scheduled for next week</p>
          <p className="text-sm text-content-tertiary mt-1">Plan ahead by scheduling some tasks</p>
        </div>
      ) : (
        <>
          {highPriorityCount > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-semantic-warning-light rounded-lg border border-semantic-warning/30">
              <AlertCircle className="w-4 h-4 text-semantic-warning" />
              <span className="text-sm text-semantic-warning">
                {highPriorityCount} high priority task{highPriorityCount > 1 ? 's' : ''} next week
              </span>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedTasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-tertiary"
              >
                <Circle
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    task.priority === 'p1' && 'text-priority-p1',
                    task.priority === 'p2' && 'text-priority-p2',
                    task.priority === 'p3' && 'text-priority-p3',
                    (!task.priority || task.priority === 'p4') && 'text-content-tertiary'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-content-secondary truncate">{task.content}</p>
                  {task.dueDate && (
                    <p className="text-xs text-content-tertiary">{formatDate(task.dueDate)}</p>
                  )}
                </div>
              </div>
            ))}
            {tasks.length > 8 && (
              <p className="text-sm text-content-tertiary text-center pt-2">
                +{tasks.length - 8} more tasks
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
