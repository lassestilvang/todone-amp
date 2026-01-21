import React from 'react'
import { Zap, TrendingUp } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import clsx from 'clsx'
import type { KarmaLevel } from '@/types'

const LEVEL_COLORS = {
  beginner: 'text-content-tertiary',
  novice: 'text-icon-info',
  intermediate: 'text-icon-success',
  advanced: 'text-icon-purple',
  professional: 'text-icon-orange',
  expert: 'text-icon-error',
  master: 'text-icon-pink',
  grandmaster: 'text-icon-indigo',
  enlightened: 'text-icon-yellow',
}

const LEVEL_ORDER: KarmaLevel[] = [
  'beginner',
  'novice',
  'intermediate',
  'advanced',
  'professional',
  'expert',
  'master',
  'grandmaster',
  'enlightened',
]

const KARMA_THRESHOLDS: Record<KarmaLevel, number> = {
  beginner: 0,
  novice: 100,
  intermediate: 300,
  advanced: 700,
  professional: 1300,
  expert: 2000,
  master: 3000,
  grandmaster: 4500,
  enlightened: 6000,
}

interface LevelProgressInfo {
  currentLevel: KarmaLevel
  nextLevel: KarmaLevel | null
  currentLevelThreshold: number
  nextLevelThreshold: number | null
  progressInLevel: number
  progressPercentage: number
  pointsNeeded: number | null
}

const getLevelProgressInfo = (karma: number, level: KarmaLevel): LevelProgressInfo => {
  const currentLevelIndex = LEVEL_ORDER.indexOf(level)
  const currentLevelThreshold = KARMA_THRESHOLDS[level]
  const nextLevel = currentLevelIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentLevelIndex + 1] : null
  const nextLevelThreshold = nextLevel ? KARMA_THRESHOLDS[nextLevel] : null

  const progressInLevel = karma - currentLevelThreshold
  const levelRange = nextLevelThreshold ? nextLevelThreshold - currentLevelThreshold : 1000
  const progressPercentage = nextLevelThreshold ? Math.min((progressInLevel / levelRange) * 100, 100) : 100
  const pointsNeeded = nextLevelThreshold ? Math.max(0, nextLevelThreshold - karma) : null

  return {
    currentLevel: level,
    nextLevel,
    currentLevelThreshold,
    nextLevelThreshold: nextLevelThreshold || currentLevelThreshold,
    progressInLevel,
    progressPercentage,
    pointsNeeded,
  }
}

export const KarmaWidget: React.FC = () => {
  const { userStats, loading } = useGamificationStore()

  if (loading || !userStats) {
    return (
      <div className="p-4 rounded-lg bg-surface-tertiary animate-pulse">
        <div className="h-8 bg-interactive-secondary rounded w-24" />
      </div>
    )
  }

  const levelColor = LEVEL_COLORS[userStats.karmaLevel]
  const levelProgress = getLevelProgressInfo(userStats.karma, userStats.karmaLevel)
  const isMaxLevel = userStats.karmaLevel === 'enlightened'

  return (
    <div className="p-4 rounded-lg bg-accent-indigo-subtle border border-accent-indigo">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-icon-yellow" />
          <h3 className="font-semibold text-content-primary">Karma Points</h3>
        </div>
        <span className={clsx('text-sm font-bold capitalize', levelColor)}>{userStats.karmaLevel}</span>
      </div>

      {/* Karma Display */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-content-primary">{userStats.karma}</div>
        <p className="text-sm text-content-secondary">Total points earned</p>
      </div>

      {/* Level Progress Bar */}
      <div className="mb-4 p-3 bg-surface-primary rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-content-secondary">
            Level {LEVEL_ORDER.indexOf(userStats.karmaLevel) + 1} of {LEVEL_ORDER.length}
          </span>
          {!isMaxLevel && levelProgress.pointsNeeded !== null && (
            <span className="text-xs text-content-secondary">
              {levelProgress.pointsNeeded} points to level up
            </span>
          )}
          {isMaxLevel && <span className="text-xs text-accent-yellow font-semibold">Max Level</span>}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-interactive-secondary rounded-full overflow-hidden mb-2">
          <div
            className={clsx(
              'h-full transition-all duration-500 rounded-full',
              isMaxLevel ? 'bg-accent-yellow' : 'bg-accent-indigo'
            )}
            style={{ width: `${levelProgress.progressPercentage}%` }}
          />
        </div>

        {/* Level Range Info */}
        <div className="flex justify-between text-xs text-content-secondary">
          <span>{levelProgress.currentLevelThreshold.toLocaleString()}</span>
          <span>{(levelProgress.nextLevelThreshold || levelProgress.currentLevelThreshold).toLocaleString()}</span>
        </div>
      </div>

      {/* Simple Progress Bar for Backward Compatibility */}
      <div className="mb-4">
        <div className="w-full h-2 bg-interactive-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-indigo transition-all duration-300"
            style={{ width: `${Math.min((userStats.karma % 500) / 5, 100)}%` }}
          />
        </div>
        <p className="text-xs text-content-tertiary mt-1">Overall progression</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Streak */}
        <div className="p-2 bg-surface-primary rounded border border-border">
          <div className="text-xs text-content-tertiary">Streak</div>
          <div className="text-lg font-bold text-content-primary">
            {userStats.currentStreak}
            <span className="text-sm text-content-secondary ml-1">days</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-2 bg-surface-primary rounded border border-border">
          <div className="text-xs text-content-tertiary">Best</div>
          <div className="text-lg font-bold text-content-primary">
            {userStats.longestStreak}
            <span className="text-sm text-content-secondary ml-1">days</span>
          </div>
        </div>

        {/* Total Completed */}
        <div className="p-2 bg-surface-primary rounded border border-border">
          <div className="text-xs text-content-tertiary">Completed</div>
          <div className="text-lg font-bold text-content-primary flex items-center gap-1">
            {userStats.totalCompleted}
            <TrendingUp className="w-4 h-4 text-icon-success" />
          </div>
        </div>

        {/* Achievements */}
        <div className="p-2 bg-surface-primary rounded border border-border">
          <div className="text-xs text-content-tertiary">Badges</div>
          <div className="text-lg font-bold text-content-primary">
            {userStats.achievements.length}
            <span className="text-sm text-content-secondary ml-1">earned</span>
          </div>
        </div>
      </div>
    </div>
  )
}
