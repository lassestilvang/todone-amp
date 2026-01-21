import React, { useMemo, useState } from 'react'
import { Award, Lock } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import { AchievementDetailModal } from './AchievementDetailModal'
import clsx from 'clsx'

export interface AchievementsShowcaseProps {
  columns?: number
  showLocked?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const AchievementsShowcase: React.FC<AchievementsShowcaseProps> = ({
  columns = 3,
  showLocked = true,
  size = 'medium',
}) => {
  const { userStats, achievements, loading } = useGamificationStore()
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null)

  const unlockedIds = useMemo(() => {
    if (!userStats) return new Set<string>()
    return new Set(
      userStats.achievements.map((a) => (typeof a === 'string' ? a : a.id))
    )
  }, [userStats])

  const achievementList = useMemo(() => {
    const unlocked = achievements
      .filter((a) => unlockedIds.has(a.id))
      .map((a) => ({ ...a, unlocked: true as const }))

    if (!showLocked) return unlocked

    const locked = achievements
      .filter((a) => !unlockedIds.has(a.id))
      .map((a) => ({ ...a, unlocked: false as const }))

    return [...unlocked, ...locked]
  }, [achievements, unlockedIds, showLocked])

  if (loading) {
    return (
      <div className={clsx('grid gap-4', {
        'grid-cols-2': columns === 2,
        'grid-cols-3': columns === 3,
        'grid-cols-4': columns === 4,
      })}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={clsx('bg-skeleton-base rounded-lg animate-pulse', {
              'h-24': size === 'small',
              'h-32': size === 'medium',
              'h-40': size === 'large',
            })}
          />
        ))}
      </div>
    )
  }

  if (achievementList.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-8 h-8 text-content-tertiary mx-auto mb-2" />
        <p className="text-content-tertiary">No achievements yet. Keep going!</p>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('grid gap-4', {
        'grid-cols-2': columns === 2,
        'grid-cols-3': columns === 3,
        'grid-cols-4': columns === 4,
      })}>
        {achievementList.map((achievement) => (
          <div
            key={achievement.id}
            onClick={() => setSelectedAchievementId(achievement.id)}
            className={clsx(
              'relative p-3 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer',
              {
                'border-accent-yellow bg-accent-yellow-subtle': achievement.unlocked,
                'border-border bg-surface-tertiary opacity-50':
                  !achievement.unlocked,
              }
            )}
            title={achievement.unlocked ? achievement.name : 'Locked'}
          >
            {/* Locked Badge */}
            {!achievement.unlocked && (
              <div className="absolute top-1 right-1">
                <Lock className="w-3 h-3 text-content-tertiary" />
              </div>
            )}

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className={clsx('text-3xl mb-2', {
                'text-4xl': size === 'large',
                'opacity-50': !achievement.unlocked,
              })}>
                {achievement.icon}
              </div>

              {/* Name */}
              <h4
                className={clsx('text-xs font-bold text-center line-clamp-2', {
                  'text-accent-yellow': achievement.unlocked,
                  'text-content-secondary': !achievement.unlocked,
                })}
              >
                {achievement.name}
              </h4>

              {/* Points */}
              {achievement.unlocked && (
                <p className="text-xs text-accent-yellow mt-1">+{achievement.points} pts</p>
              )}

              {/* Unlock Hint */}
              {!achievement.unlocked && (
                <p className="text-xs text-content-tertiary mt-1 line-clamp-1">
                  Locked
                </p>
              )}
            </div>

            {/* Tooltip on hover (mobile-friendly description) */}
            <div
              className={clsx(
                'absolute left-0 right-0 top-full mt-1 bg-tooltip-bg text-tooltip-text text-xs rounded p-2 hidden group-hover:block z-10 whitespace-normal',
                'pointer-events-none'
              )}
            >
              {achievement.description}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievementId={selectedAchievementId || ''}
        isOpen={!!selectedAchievementId}
        onClose={() => setSelectedAchievementId(null)}
      />
    </>
  )
}

// Stats summary component
export const AchievementStats: React.FC = () => {
  const { userStats, achievements } = useGamificationStore()

  if (!userStats) {
    return null
  }

  const totalAchievements = achievements.length
  const unlockedCount = userStats.achievements.length
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100)

  return (
    <div className="p-4 rounded-lg bg-semantic-info-light border border-semantic-info/30">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-semantic-info flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievement Progress
        </h3>
        <span className="text-sm font-bold text-semantic-info">
          {unlockedCount} / {totalAchievements}
        </span>
      </div>

      <div className="w-full h-3 bg-semantic-info/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-semantic-info to-brand-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-xs text-semantic-info mt-2">
        {progressPercent}% complete - Keep going to unlock more achievements!
      </p>
    </div>
  )
}
