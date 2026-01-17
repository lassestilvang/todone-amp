import { useState, useEffect } from 'react'
import { Calendar, CalendarDays, CalendarRange, Check, AlertCircle } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useTaskStore } from '@/store/taskStore'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'text-priority-p1 border-priority-p1',
  p2: 'text-priority-p2 border-priority-p2',
  p3: 'text-priority-p3 border-priority-p3',
  p4: 'text-content-tertiary border-border',
}

interface OverdueTasksReviewProps {
  onNext: () => void
}

export function OverdueTasksReview({ onNext }: OverdueTasksReviewProps) {
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const tasks = useTaskStore((state) => state.tasks)
  const updateTask = useTaskStore((state) => state.updateTask)
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const { rescheduleTask, markOverdueReviewed } = useDailyReviewStore()

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdueList = tasks.filter((task) => {
      if (task.completed || !task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today
    })

    setOverdueTasks(overdueList)
  }, [tasks])

  const handleReschedule = async (task: Task, option: 'today' | 'tomorrow' | 'next-week') => {
    const now = new Date()
    let newDate: Date

    switch (option) {
      case 'today':
        newDate = now
        break
      case 'tomorrow':
        newDate = new Date(now)
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'next-week':
        newDate = new Date(now)
        newDate.setDate(newDate.getDate() + 7)
        break
    }

    await updateTask(task.id, { dueDate: newDate })
    rescheduleTask(task.id)
    markOverdueReviewed(task.id)
  }

  const handleComplete = async (task: Task) => {
    await toggleTask(task.id)
    markOverdueReviewed(task.id)
  }

  if (overdueTasks.length === 0) {
    return (
      <ReviewStep
        title="No Overdue Tasks"
        description="You're all caught up! No overdue tasks to review."
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-semantic-success-subtle flex items-center justify-center">
            <Check className="w-8 h-8 text-icon-success" />
          </div>
          <p className="text-content-tertiary">
            Great job staying on top of your tasks!
          </p>
        </div>
        <div className="mt-auto pt-4">
          <Button onClick={onNext} variant="primary" className="w-full">
            Continue
          </Button>
        </div>
      </ReviewStep>
    )
  }

  return (
    <ReviewStep
      title="Review Overdue Tasks"
      description={`You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} to review`}
    >
      <div className="space-y-3">
        {overdueTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'p-4 rounded-lg border bg-surface-primary',
              'border-border'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0',
                  PRIORITY_COLORS[task.priority ?? 'p4']
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate">
                  {task.content}
                </p>
                {task.dueDate && (
                  <p className="mt-1 text-xs text-semantic-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReschedule(task, 'today')}
                    className="text-xs"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Today
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReschedule(task, 'tomorrow')}
                    className="text-xs"
                  >
                    <CalendarDays className="w-3 h-3 mr-1" />
                    Tomorrow
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReschedule(task, 'next-week')}
                    className="text-xs"
                  >
                    <CalendarRange className="w-3 h-3 mr-1" />
                    Next Week
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleComplete(task)}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Button onClick={onNext} variant="primary" className="w-full">
          Continue
        </Button>
      </div>
    </ReviewStep>
  )
}
