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
    <div className="bg-surface-primary rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-semantic-warning" />
          <h3 className="text-lg font-semibold text-content-primary">Slipped Tasks</h3>
        </div>
        <span className="text-sm text-content-tertiary">{tasks.length} tasks</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-semantic-success-light rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-semantic-success" />
          </div>
          <p className="text-content-tertiary">No slipped tasks this week</p>
          <p className="text-sm text-content-tertiary mt-1">Great job staying on track!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-semantic-warning-light border border-semantic-warning/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-content-primary font-medium truncate">{task.content}</p>
                {task.dueDate && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-semantic-warning" />
                    <span className="text-xs text-semantic-warning">
                      Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
              </div>
              {task.priority && (
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded flex-shrink-0',
                    task.priority === 'p1' && 'bg-priority-p1 text-priority-p1',
                    task.priority === 'p2' && 'bg-priority-p2 text-priority-p2',
                    task.priority === 'p3' && 'bg-priority-p3 text-priority-p3',
                    task.priority === 'p4' && 'bg-priority-none text-priority-none'
                  )}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-content-tertiary flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
