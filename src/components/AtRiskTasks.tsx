import React, { useEffect } from 'react'
import { AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface AtRiskTasksProps {
  className?: string
}

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'bg-red-50 border-red-200 text-red-700',
  p2: 'bg-orange-50 border-orange-200 text-orange-700',
  p3: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  p4: 'bg-blue-50 border-blue-200 text-blue-700',
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
          'flex items-center justify-center rounded-lg border border-gray-200 p-6',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!atRiskTasks || atRiskTasks.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 p-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-lg bg-green-50 p-3">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="mt-3 font-medium text-gray-900">All tasks on track</p>
        <p className="mt-1 text-sm text-gray-600">No overdue or at-risk tasks</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="font-medium text-gray-900">At-Risk Tasks ({atRiskTasks.length})</h3>
      </div>

      <div className="space-y-2">
        {atRiskTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'rounded-lg border p-3',
              task.daysOverdue > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{task.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block rounded px-2 py-1 text-xs font-medium',
                      PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.p3
                    )}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600">
                    {task.daysOverdue > 0
                      ? `${task.daysOverdue} days overdue`
                      : `Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  task.daysOverdue > 0 ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
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
