import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'
import { CheckCircle2, Target, TrendingUp } from 'lucide-react'
import { startOfDay } from 'date-fns'

interface DailyGoalProgressProps {
  className?: string
  compact?: boolean
}

export const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({ className, compact = false }) => {
  const user = useAuthStore((state) => state.user)
  const { tasks } = useTaskStore()
  const [todayCompletedCount, setTodayCompletedCount] = useState(0)

  useEffect(() => {
    if (!tasks) return

    const today = startOfDay(new Date())
    const todayCompleted = tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false
      const completedDay = startOfDay(new Date(task.completedAt))
      return completedDay.getTime() === today.getTime()
    }).length

    setTodayCompletedCount(todayCompleted)
  }, [tasks])

  if (!user?.settings) {
    return null
  }

  const dailyGoal = user.settings.dailyGoal || 0
  const progressPercentage = dailyGoal > 0 ? (todayCompletedCount / dailyGoal) * 100 : 0
  const isGoalMet = todayCompletedCount >= dailyGoal && dailyGoal > 0

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Target className="h-4 w-4 text-blue-500" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Daily Goal</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {todayCompletedCount}/{dailyGoal}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isGoalMet ? 'bg-green-500' : 'bg-blue-500'
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
    <div className={cn('space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Daily Goal</h3>
        </div>
        {isGoalMet && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      </div>

      {/* Goal Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tasks completed today</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {todayCompletedCount}/{dailyGoal}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isGoalMet ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
              )}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0</span>
            <span>50%</span>
            <span>{dailyGoal}</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={cn(
          'rounded-md p-2 text-center text-sm',
          isGoalMet
            ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        )}
      >
        {isGoalMet ? (
          <p className="font-medium">🎉 Goal achieved! Great work!</p>
        ) : dailyGoal > 0 ? (
          <p>
            {dailyGoal - todayCompletedCount} more task{dailyGoal - todayCompletedCount !== 1 ? 's' : ''} to reach your goal
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Set a daily goal to get started</p>
        )}
      </div>

      {/* Motivation */}
      {dailyGoal > 0 && !isGoalMet && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 dark:bg-amber-900">
          <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-700 dark:text-amber-200">
            {progressPercentage > 0 ? `You're ${Math.round(progressPercentage)}% there!` : 'Start completing tasks to progress!'}
          </p>
        </div>
      )}
    </div>
  )
}
