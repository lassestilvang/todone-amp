import React from 'react'
import { Flame, Calendar } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import clsx from 'clsx'

export interface StreakDisplayProps {
  size?: 'small' | 'medium' | 'large'
  showBest?: boolean
  animated?: boolean
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  size = 'medium',
  showBest = true,
  animated = true,
}) => {
  const { userStats, loading } = useGamificationStore()

  if (loading || !userStats) {
    return (
      <div className={clsx('rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse', {
        'h-16 w-16': size === 'small',
        'h-24 w-24': size === 'medium',
        'h-32 w-32': size === 'large',
      })} />
    )
  }

  const currentStreak = userStats.currentStreak || 0
  const longestStreak = userStats.longestStreak || 0
  const isBurning = currentStreak > 0

  return (
    <div className="space-y-4">
      {/* Current Streak */}
      <div className={clsx('rounded-lg border-2 p-4 text-center', {
        'border-orange-300 dark:border-orange-600 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900':
          isBurning,
        'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800':
          !isBurning,
      })}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame
            className={clsx('w-6 h-6 transition-all', {
              'text-orange-500 animate-bounce': isBurning && animated,
              'text-orange-400': isBurning && !animated,
              'text-gray-400': !isBurning,
            })}
          />
          <h3 className={clsx('font-semibold', {
            'text-orange-900 dark:text-orange-100': isBurning,
            'text-gray-700 dark:text-gray-300': !isBurning,
          })}>
            {isBurning ? 'You\'re on fire!' : 'Start your streak'}
          </h3>
        </div>

        <div className={clsx('text-4xl font-bold transition-all', {
          'text-orange-600 dark:text-orange-300': isBurning,
          'text-gray-500 dark:text-gray-400': !isBurning,
        })}>
          {currentStreak}
        </div>

        <p className={clsx('text-sm mt-2', {
          'text-orange-700 dark:text-orange-200': isBurning,
          'text-gray-600 dark:text-gray-400': !isBurning,
        })}>
          {currentStreak === 1
            ? 'day completed'
            : `${currentStreak} days in a row`}
        </p>

        {!isBurning && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Complete a task today to start
          </p>
        )}
      </div>

      {/* Best Streak */}
      {showBest && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-300 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Personal best
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              {longestStreak === 1
                ? '1 day'
                : `${longestStreak} days`}
            </p>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
            {longestStreak}
          </div>
        </div>
      )}

      {/* Daily Reminder */}
      {isBurning && userStats.lastCompletedAt && (
        <div className="text-xs text-center text-gray-600 dark:text-gray-400 p-2">
          Keep it up! Last completed: {new Date(userStats.lastCompletedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

// Compact version for inline display
export const StreakBadge: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  const { userStats } = useGamificationStore()

  if (!userStats || userStats.currentStreak === 0) {
    return null
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
        { 'text-xs': inline }
      )}
    >
      <Flame className="w-3 h-3" />
      <span className="font-semibold">{userStats.currentStreak}</span>
      <span className="text-xs">day{userStats.currentStreak !== 1 ? 's' : ''}</span>
    </div>
  )
}
