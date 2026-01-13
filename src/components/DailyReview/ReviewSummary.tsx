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
            isMorning ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'
          )}
        >
          {isMorning ? (
            <Sun className="w-10 h-10 text-yellow-500" />
          ) : (
            <Moon className="w-10 h-10 text-indigo-500" />
          )}
        </div>

        <div className="w-full space-y-3 mb-6">
          {isMorning && intention && (
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Today's Intention
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{intention}</p>
                </div>
              </div>
            </div>
          )}

          {!isMorning && reflection && (
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Your Reflection
                  </p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 whitespace-pre-wrap">
                    {reflection}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {isMorning && reviewedOverdueTaskIds.length > 0 && (
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reviewedOverdueTaskIds.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overdue Reviewed</p>
              </div>
            )}

            {rescheduledTaskIds.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {rescheduledTaskIds.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rescheduled</p>
              </div>
            )}

            {!isMorning && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed Today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onComplete} variant="primary" className="w-full">
          {isMorning ? 'Start My Day' : 'Finish Review'}
        </Button>
      </div>
    </ReviewStep>
  )
}
