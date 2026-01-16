import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'text-red-500',
  p2: 'text-orange-500',
  p3: 'text-blue-500',
  p4: 'text-gray-400',
}

const PRIORITY_BG: Record<string, string> = {
  p1: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  p2: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  p3: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  p4: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
}

interface TodayTasksPreviewProps {
  onNext: () => void
}

export function TodayTasksPreview({ onNext }: TodayTasksPreviewProps) {
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const tasks = useTaskStore((state) => state.tasks)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayList = tasks
      .filter((task) => {
        if (task.completed || !task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate >= today && dueDate < tomorrow
      })
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { p1: 1, p2: 2, p3: 3, p4: 4 }
        return (priorityOrder[a.priority ?? 'p4'] ?? 4) - (priorityOrder[b.priority ?? 'p4'] ?? 4)
      })

    setTodayTasks(todayList)
  }, [tasks])

  const completedCount = tasks.filter((t) => {
    if (!t.completedAt) return false
    const completedDate = new Date(t.completedAt)
    const today = new Date()
    return (
      completedDate.getFullYear() === today.getFullYear() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getDate() === today.getDate()
    )
  }).length

  return (
    <ReviewStep
      title="Today's Tasks"
      description={`${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} scheduled for today`}
    >
      {todayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-content-tertiary">
            No tasks scheduled for today. Time to add some!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 rounded-lg bg-surface-tertiary">
            <div className="flex justify-between text-sm">
              <span className="text-content-tertiary">Completed today</span>
              <span className="font-medium text-content-primary">{completedCount}</span>
            </div>
          </div>
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'p-3 rounded-lg border',
                  PRIORITY_BG[task.priority ?? 'p4']
                )}
              >
                <div className="flex items-center gap-3">
                  <Circle
                    className={cn('w-4 h-4 flex-shrink-0', PRIORITY_COLORS[task.priority ?? 'p4'])}
                  />
                  <span className="text-sm text-content-primary truncate">
                    {task.content}
                  </span>
                  {task.dueTime && (
                    <span className="ml-auto text-xs text-content-tertiary flex-shrink-0">
                      {task.dueTime}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="mt-6 pt-4 border-t border-border">
        <Button onClick={onNext} variant="primary" className="w-full">
          Continue
        </Button>
      </div>
    </ReviewStep>
  )
}
