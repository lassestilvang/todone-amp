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
      <div className={clsx('rounded-lg bg-surface-tertiary animate-pulse', {
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
        'border-accent-orange bg-accent-orange-subtle':
          isBurning,
        'border-border bg-surface-secondary':
          !isBurning,
      })}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame
            className={clsx('w-6 h-6 transition-all', {
              'text-icon-orange animate-bounce': isBurning && animated,
              'text-icon-orange': isBurning && !animated,
              'text-content-tertiary': !isBurning,
            })}
          />
          <h3 className={clsx('font-semibold', {
            'text-accent-orange': isBurning,
            'text-content-secondary': !isBurning,
          })}>
            {isBurning ? 'You\'re on fire!' : 'Start your streak'}
          </h3>
        </div>

        <div className={clsx('text-4xl font-bold transition-all', {
          'text-accent-orange': isBurning,
          'text-content-tertiary': !isBurning,
        })}>
          {currentStreak}
        </div>

        <p className={clsx('text-sm mt-2', {
          'text-accent-orange': isBurning,
          'text-content-secondary': !isBurning,
        })}>
          {currentStreak === 1
            ? 'day completed'
            : `${currentStreak} days in a row`}
        </p>

        {!isBurning && (
          <p className="text-xs text-content-tertiary mt-2">
            Complete a task today to start
          </p>
        )}
      </div>

      {/* Best Streak */}
      {showBest && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-purple-subtle border border-accent-purple">
          <Calendar className="w-5 h-5 text-accent-purple flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent-purple">
              Personal best
            </p>
            <p className="text-xs text-accent-purple">
              {longestStreak === 1
                ? '1 day'
                : `${longestStreak} days`}
            </p>
          </div>
          <div className="text-2xl font-bold text-accent-purple">
            {longestStreak}
          </div>
        </div>
      )}

      {/* Daily Reminder */}
      {isBurning && userStats.lastCompletedAt && (
        <div className="text-xs text-center text-content-secondary p-2">
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
        'flex items-center gap-1 px-2 py-1 rounded-full bg-accent-orange-subtle text-accent-orange',
        { 'text-xs': inline }
      )}
    >
      <Flame className="w-3 h-3" />
      <span className="font-semibold">{userStats.currentStreak}</span>
      <span className="text-xs">day{userStats.currentStreak !== 1 ? 's' : ''}</span>
    </div>
  )
}
