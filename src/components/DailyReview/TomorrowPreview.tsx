import { useState, useEffect } from 'react'
import { Sunrise, Circle } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'text-priority-p1',
  p2: 'text-priority-p2',
  p3: 'text-priority-p3',
  p4: 'text-content-tertiary',
}

const PRIORITY_BG: Record<string, string> = {
  p1: 'bg-priority-p1-subtle border-priority-p1-border',
  p2: 'bg-priority-p2-subtle border-priority-p2-border',
  p3: 'bg-priority-p3-subtle border-priority-p3-border',
  p4: 'bg-surface-secondary border-border',
}

interface TomorrowPreviewProps {
  onNext: () => void
}

export function TomorrowPreview({ onNext }: TomorrowPreviewProps) {
  const [tomorrowTasks, setTomorrowTasks] = useState<Task[]>([])
  const tasks = useTaskStore((state) => state.tasks)

  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const tomorrowList = tasks
      .filter((task) => {
        if (task.completed || !task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate >= tomorrow && dueDate < dayAfter
      })
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { p1: 1, p2: 2, p3: 3, p4: 4 }
        return (priorityOrder[a.priority ?? 'p4'] ?? 4) - (priorityOrder[b.priority ?? 'p4'] ?? 4)
      })

    setTomorrowTasks(tomorrowList)
  }, [tasks])

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <ReviewStep
      title="Tomorrow's Preview"
      description={`Here's what's coming up on ${tomorrowFormatted}`}
    >
      {tomorrowTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-priority-p2-subtle flex items-center justify-center">
            <Sunrise className="w-8 h-8 text-icon-orange" />
          </div>
          <p className="text-content-tertiary">
            No tasks scheduled for tomorrow yet.
          </p>
          <p className="text-sm text-content-tertiary mt-2">
            A clear calendar can be a fresh start!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 rounded-lg bg-priority-p2-subtle border border-priority-p2-border">
            <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
              <Sunrise className="w-4 h-4" />
              <span>{tomorrowTasks.length} task{tomorrowTasks.length !== 1 ? 's' : ''} scheduled</span>
            </div>
          </div>
          <div className="space-y-2">
            {tomorrowTasks.map((task) => (
              <div
                key={task.id}
                className={cn('p-3 rounded-lg border', PRIORITY_BG[task.priority ?? 'p4'])}
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
