import React, { useEffect } from 'react'
import { Medal, Trophy, Zap } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import clsx from 'clsx'

export interface LeaderboardProps {
  limit?: number
  showPersonal?: boolean
}

const MEDAL_ICONS = [Trophy, Medal, Medal]
const MEDAL_COLORS = [
  'text-icon-yellow',
  'text-content-tertiary',
  'text-icon-orange',
]

export const Leaderboard: React.FC<LeaderboardProps> = ({ limit = 10 }) => {
  const { leaderboard, loading, getLeaderboard } = useGamificationStore()

  useEffect(() => {
    getLeaderboard(limit)
  }, [limit, getLeaderboard])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-skeleton-base rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="w-8 h-8 text-content-tertiary mx-auto mb-2" />
        <p className="text-content-tertiary">No karma points yet. Complete tasks to earn karma!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry, index) => {
        const MedalIcon = MEDAL_ICONS[Math.min(index, 2)]
        const medalColor = MEDAL_COLORS[Math.min(index, 2)]
        const isTop3 = index < 3

        return (
          <div
            key={entry.userId}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-lg transition-all',
              isTop3
                ? 'bg-accent-yellow-subtle border border-accent-yellow'
                : 'bg-surface-secondary border border-border hover:bg-surface-tertiary'
            )}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-primary flex-shrink-0">
              {isTop3 ? (
                <MedalIcon className={clsx('w-5 h-5', medalColor)} />
              ) : (
                <span className="font-bold text-content-secondary">{index + 1}</span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-content-primary truncate">
                {entry.name}
              </h4>
              <p className="text-xs text-content-tertiary">User #{entry.userId}</p>
            </div>

            {/* Karma Points */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Zap className="w-4 h-4 text-icon-yellow" />
              <span className="font-bold text-content-primary">{entry.karma}</span>
            </div>
          </div>
        )
      })}

      {leaderboard.length < 10 && (
        <div className="text-center py-4 text-sm text-content-tertiary">
          {leaderboard.length} of {Math.max(leaderboard.length, 10)} users
        </div>
      )}
    </div>
  )
}
