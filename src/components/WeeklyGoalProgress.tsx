import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'
import { CheckCircle2, Calendar } from 'lucide-react'
import { startOfWeek, startOfDay } from 'date-fns'

interface DayProgress {
  day: string
  completed: number
  date: Date
}

interface WeeklyGoalProgressProps {
  className?: string
  compact?: boolean
}

export const WeeklyGoalProgress: React.FC<WeeklyGoalProgressProps> = ({ className, compact = false }) => {
  const user = useAuthStore((state) => state.user)
  const { tasks } = useTaskStore()
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>([])
  const [totalCompleted, setTotalCompleted] = useState(0)

  useEffect(() => {
    if (!tasks) return

    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: user?.settings?.startOfWeek ?? 0 })
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const progress: DayProgress[] = []
    let weekTotal = 0

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart)
      dayDate.setDate(dayDate.getDate() + i)
      const dayStart = startOfDay(dayDate)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayCompleted = tasks.filter((task) => {
        if (!task.completed || !task.completedAt) return false
        const completedTime = new Date(task.completedAt).getTime()
        return completedTime >= dayStart.getTime() && completedTime < dayEnd.getTime()
      }).length

      weekTotal += dayCompleted
      progress.push({
        day: dayLabels[dayDate.getDay()],
        completed: dayCompleted,
        date: dayDate,
      })
    }

    setWeeklyProgress(progress)
    setTotalCompleted(weekTotal)
  }, [tasks, user?.settings?.startOfWeek])

  if (!user?.settings) {
    return null
  }

  const weeklyGoal = user.settings.weeklyGoal || 0
  const progressPercentage = weeklyGoal > 0 ? (totalCompleted / weeklyGoal) * 100 : 0
  const isGoalMet = totalCompleted >= weeklyGoal && weeklyGoal > 0

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Calendar className="h-4 w-4 text-purple-500" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-content-secondary">Weekly Goal</span>
            <span className="text-xs text-content-tertiary">
              {totalCompleted}/{weeklyGoal}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-interactive-secondary overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isGoalMet ? 'bg-purple-500' : 'bg-indigo-500'
              )}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
        {isGoalMet && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 rounded-lg border border-border bg-surface-primary p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-content-primary">Weekly Goal</h3>
        </div>
        {isGoalMet && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      </div>

      {/* Goal Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-content-secondary">Tasks completed this week</span>
          <span className="text-lg font-bold text-content-primary">
            {totalCompleted}/{weeklyGoal}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-4 rounded-full bg-interactive-secondary overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isGoalMet
                  ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                  : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
              )}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-content-tertiary">
            <span>0</span>
            <span>50%</span>
            <span>{weeklyGoal}</span>
          </div>
        </div>
      </div>

      {/* Day Breakdown */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-content-secondary">Daily breakdown</p>
        <div className="grid grid-cols-7 gap-1">
          {weeklyProgress.map((dayProgress, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={cn(
                  'h-10 w-full rounded-md flex items-center justify-center text-xs font-semibold transition-all',
                  dayProgress.completed > 0
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {dayProgress.completed}
              </div>
              <span className="mt-1 text-xs text-content-tertiary">{dayProgress.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Message */}
      <div
        className={cn(
          'rounded-md p-2 text-center text-sm',
          isGoalMet
            ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        )}
      >
        {isGoalMet ? (
          <p className="font-medium">🏆 Weekly goal achieved!</p>
        ) : weeklyGoal > 0 ? (
          <p>
            {weeklyGoal - totalCompleted} more task{weeklyGoal - totalCompleted !== 1 ? 's' : ''} to reach your weekly goal
          </p>
        ) : (
          <p className="text-content-secondary">Set a weekly goal to get started</p>
        )}
      </div>
    </div>
  )
}
