import React, { useMemo } from 'react'
import { Calendar, Zap, Trophy, Target } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import clsx from 'clsx'

import type { UserStats } from '@/store/gamificationStore'

interface Badge {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  criteria: (stats: UserStats) => boolean
  description: string
}

const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'daily-login',
    name: 'Daily Visitor',
    icon: <Calendar className="w-5 h-5" />,
    color: 'bg-info-light',
    criteria: () => true, // Placeholder - would need lastLoginDate tracking
    description: 'Log in every day for a week',
  },
  {
    id: 'weekly-warrior',
    name: 'Weekly Warrior',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-accent-yellow-subtle',
    criteria: (stats) => stats?.totalCompleted >= 15,
    description: 'Complete 15+ tasks in a week',
  },
  {
    id: 'monthly-master',
    name: 'Monthly Master',
    icon: <Trophy className="w-5 h-5" />,
    color: 'bg-accent-purple-subtle',
    criteria: (stats) => stats?.totalCompleted >= 60,
    description: 'Complete 60+ tasks in a month',
  },
  {
    id: 'streak-champion',
    name: 'Streak Champion',
    icon: <Target className="w-5 h-5" />,
    color: 'bg-error-light',
    criteria: (stats) => stats?.currentStreak >= 7,
    description: 'Maintain a 7-day completion streak',
  },
]

interface BadgesDisplayProps {
  layout?: 'grid' | 'row'
  showTooltip?: boolean
  maxBadges?: number
}

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({
  layout = 'grid',
  showTooltip = true,
  maxBadges,
}) => {
  const { userStats } = useGamificationStore()

  const earnedBadges = useMemo(() => {
    if (!userStats) return []
    return BADGE_DEFINITIONS.filter((badge) => badge.criteria(userStats)).slice(
      0,
      maxBadges
    )
  }, [userStats, maxBadges])

  if (!userStats) {
    return <div className="animate-pulse h-12 bg-skeleton-base rounded" />
  }

  if (earnedBadges.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-content-tertiary">
          Complete more tasks to earn badges!
        </p>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'gap-3',
        layout === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-4'
          : 'flex flex-wrap'
      )}
    >
      {earnedBadges.map((badge) => (
        <div
          key={badge.id}
          className={clsx(
            'relative p-3 rounded-lg border-2 border-accent-yellow',
            badge.color,
            'transition-all hover:shadow-md cursor-pointer',
            'flex flex-col items-center justify-center text-center'
          )}
          title={showTooltip ? badge.description : undefined}
        >
          <div className="text-accent-yellow mb-1">{badge.icon}</div>
          <div className="text-xs font-bold text-content-primary line-clamp-2">
            {badge.name}
          </div>
          {showTooltip && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-surface-inverse text-content-inverse text-xs rounded p-2 hidden group-hover:block z-10 whitespace-normal pointer-events-none">
              {badge.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


