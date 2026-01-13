import { useState, useEffect } from 'react'
import { CalendarDays, CalendarRange, Check, Clock } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useTaskStore } from '@/store/taskStore'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'text-red-500 border-red-500',
  p2: 'text-orange-500 border-orange-500',
  p3: 'text-blue-500 border-blue-500',
  p4: 'text-gray-400 border-gray-400',
}

interface IncompleteTasksReviewProps {
  onNext: () => void
}

export function IncompleteTasksReview({ onNext }: IncompleteTasksReviewProps) {
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([])
  const tasks = useTaskStore((state) => state.tasks)
  const updateTask = useTaskStore((state) => state.updateTask)
  const toggleTask = useTaskStore((state) => state.toggleTask)
  const { rescheduleTask } = useDailyReviewStore()

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const incompleteList = tasks.filter((task) => {
      if (task.completed || !task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate >= today && dueDate < tomorrow
    })

    setIncompleteTasks(incompleteList)
  }, [tasks])

  const handleReschedule = async (task: Task, option: 'tomorrow' | 'next-week') => {
    const now = new Date()
    let newDate: Date

    switch (option) {
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
  }

  const handleComplete = async (task: Task) => {
    await toggleTask(task.id)
  }

  if (incompleteTasks.length === 0) {
    return (
      <ReviewStep
        title="All Tasks Complete!"
        description="You completed everything scheduled for today."
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Amazing work clearing your task list!
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
      title="Incomplete Tasks"
      description={`${incompleteTasks.length} task${incompleteTasks.length > 1 ? 's' : ''} still pending from today`}
    >
      <div className="space-y-3">
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'p-4 rounded-lg border bg-white dark:bg-gray-800',
              'border-gray-200 dark:border-gray-700'
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
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {task.content}
                </p>
                {task.dueTime && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.dueTime}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
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
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onNext} variant="primary" className="w-full">
          Continue
        </Button>
      </div>
    </ReviewStep>
  )
}
