import { useState, useEffect } from 'react'
import { CheckCircle, Sun, Moon, Target, BookOpen, RefreshCw } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'

interface ReviewSummaryProps {
  onComplete: () => void
  type: 'morning' | 'evening'
}

export function ReviewSummary({ onComplete, type }: ReviewSummaryProps) {
  const [completedCount, setCompletedCount] = useState(0)
  const { intention, reflection, rescheduledTaskIds, reviewedOverdueTaskIds } = useDailyReviewStore()
  const tasks = useTaskStore((state) => state.tasks)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const count = tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false
      const completedDate = new Date(task.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    }).length

    setCompletedCount(count)
  }, [tasks])

  const isMorning = type === 'morning'

  return (
    <ReviewStep
      title={isMorning ? 'Ready to Start Your Day!' : 'Day Complete!'}
      description={isMorning ? "You're all set for a productive day" : 'Great job wrapping up today'}
    >
      <div className="flex flex-col items-center py-6">
        <div
          className={cn(
            'w-20 h-20 mb-6 rounded-full flex items-center justify-center',
            isMorning ? 'bg-accent-yellow-subtle' : 'bg-accent-indigo-subtle'
          )}
        >
          {isMorning ? (
            <Sun className="w-10 h-10 text-icon-yellow" />
          ) : (
            <Moon className="w-10 h-10 text-icon-indigo" />
          )}
        </div>

        <div className="w-full space-y-3 mb-6">
          {isMorning && intention && (
            <div className="p-4 rounded-lg bg-accent-purple-subtle border border-accent-purple">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-icon-purple flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-accent-purple">Today's Intention</p>
                  <p className="text-sm text-accent-purple mt-1">{intention}</p>
                </div>
              </div>
            </div>
          )}

          {!isMorning && reflection && (
            <div className="p-4 rounded-lg bg-accent-indigo-subtle border border-accent-indigo">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-icon-indigo flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-accent-indigo">Your Reflection</p>
                  <p className="text-sm text-accent-indigo mt-1 whitespace-pre-wrap">{reflection}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {isMorning && reviewedOverdueTaskIds.length > 0 && (
              <div className="p-3 rounded-lg bg-surface-tertiary text-center">
                <p className="text-2xl font-bold text-content-primary">
                  {reviewedOverdueTaskIds.length}
                </p>
                <p className="text-xs text-content-tertiary">Overdue Reviewed</p>
              </div>
            )}

            {rescheduledTaskIds.length > 0 && (
              <div className="p-3 rounded-lg bg-semantic-info-light text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <RefreshCw className="w-4 h-4 text-icon-info" />
                </div>
                <p className="text-2xl font-bold text-semantic-info">{rescheduledTaskIds.length}</p>
                <p className="text-xs text-content-tertiary">Rescheduled</p>
              </div>
            )}

            {!isMorning && (
              <div className="p-3 rounded-lg bg-semantic-success-light text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-icon-success" />
                </div>
                <p className="text-2xl font-bold text-semantic-success">{completedCount}</p>
                <p className="text-xs text-content-tertiary">Completed Today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <Button onClick={onComplete} variant="primary" className="w-full">
          {isMorning ? 'Start My Day' : 'Finish Review'}
        </Button>
      </div>
    </ReviewStep>
  )
}
