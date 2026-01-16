import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useRecurrenceStore } from '@/store/recurrenceStore'
import { addMonths, startOfMonth, endOfMonth } from 'date-fns'
import type { Task } from '@/types'

export interface RecurrenceInstancesListProps {
  task: Task
  className?: string
}

export function RecurrenceInstancesList({ task, className }: RecurrenceInstancesListProps) {
  const { loadTaskInstances, getInstancesByDateRange, markInstanceCompleted, deleteInstance } =
    useRecurrenceStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded) {
      loadTaskInstances(task.id).then(() => setHasLoaded(true))
    }
  }, [task.id, hasLoaded, loadTaskInstances])

  if (!task.recurrence) {
    return null
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const instances = getInstancesByDateRange(task.id, monthStart, monthEnd)

  const handleToggleComplete = async (instanceId: string, completed: boolean) => {
    await markInstanceCompleted(instanceId, !completed)
  }

  const handleDeleteInstance = async (instanceId: string) => {
    if (window.confirm('Delete this instance?')) {
      await deleteInstance(instanceId)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-content-primary">Instances</h3>
        <div className="text-sm text-content-tertiary">
          {instances.length} in {currentMonth.toLocaleDateString('en-US', { month: 'long' })}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-surface-secondary p-3 rounded-lg">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="px-3 py-1 text-sm text-content-secondary hover:bg-interactive-secondary rounded transition-colors"
        >
          ← Previous
        </button>
        <div className="text-sm font-medium text-content-primary">
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-3 py-1 text-sm text-content-secondary hover:bg-interactive-secondary rounded transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Instances List */}
      {instances.length === 0 ? (
        <div className="py-6 text-center text-content-tertiary">
          <Calendar size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No instances this month</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                instance.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-surface-primary border-border hover:bg-surface-tertiary',
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleComplete(instance.id, instance.completed)}
                className="flex-shrink-0 text-content-tertiary hover:text-content-secondary transition-colors"
                aria-label={instance.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {instance.completed ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <Circle size={20} />
                )}
              </button>

              {/* Date and Status */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    instance.completed ? 'text-content-tertiary line-through' : 'text-content-primary',
                  )}
                >
                  {instance.dueDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                {instance.isException && (
                  <p className="text-xs text-orange-600 capitalize">
                    {instance.exceptionReason}
                  </p>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteInstance(instance.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded transition-colors hover:bg-red-50"
                aria-label="Delete instance"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {instances.length > 0 && (
        <div className="pt-3 border-t border-border text-xs text-content-tertiary space-y-1">
          <p>
            Completed: {instances.filter((i) => i.completed).length} of {instances.length}
          </p>
          <p>
            Exceptions: {instances.filter((i) => i.isException).length}
          </p>
        </div>
      )}
    </div>
  )
}
