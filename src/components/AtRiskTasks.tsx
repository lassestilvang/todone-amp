import React, { useEffect } from 'react'
import { AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface AtRiskTasksProps {
  className?: string
}

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'bg-priority-p1-bg border-priority-p1 text-priority-p1',
  p2: 'bg-priority-p2-bg border-priority-p2 text-priority-p2',
  p3: 'bg-priority-p3-bg border-priority-p3 text-priority-p3',
  p4: 'bg-priority-p4-bg border-priority-p4 text-priority-p4',
}

export const AtRiskTasks: React.FC<AtRiskTasksProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user)
  const { atRiskTasks, getAtRiskTasks, isLoading } = useAnalyticsStore()

  useEffect(() => {
    if (user?.id) {
      getAtRiskTasks(user.id)
    }
  }, [user?.id, getAtRiskTasks])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-border p-6',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-content-tertiary" />
      </div>
    )
  }

  if (!atRiskTasks || atRiskTasks.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border p-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-lg bg-semantic-success-light p-3">
            <Clock className="h-6 w-6 text-icon-success" />
          </div>
        </div>
        <p className="mt-3 font-medium text-content-primary">All tasks on track</p>
        <p className="mt-1 text-sm text-content-secondary">No overdue or at-risk tasks</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-icon-error" />
        <h3 className="font-medium text-content-primary">At-Risk Tasks ({atRiskTasks.length})</h3>
      </div>

      <div className="space-y-2">
        {atRiskTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'rounded-lg border p-3',
              task.daysOverdue > 0
                ? 'border-semantic-error bg-semantic-error-light'
                : 'border-semantic-warning bg-semantic-warning-light'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-content-primary">{task.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block rounded px-2 py-1 text-xs font-medium',
                      PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.p3
                    )}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-content-secondary">
                    {task.daysOverdue > 0
                      ? `${task.daysOverdue} days overdue`
                      : `Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  task.daysOverdue > 0
                    ? 'bg-semantic-error-light text-semantic-error'
                    : 'bg-semantic-warning-light text-semantic-warning'
                )}
              >
                {task.daysOverdue > 0 ? '🚨 Overdue' : '⚠️ Soon'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
