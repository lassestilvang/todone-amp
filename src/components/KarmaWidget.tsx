import React from 'react'
import { Zap, TrendingUp } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import clsx from 'clsx'
import type { KarmaLevel } from '@/types'

const LEVEL_COLORS = {
  beginner: 'text-gray-500',
  novice: 'text-blue-500',
  intermediate: 'text-green-500',
  advanced: 'text-purple-500',
  professional: 'text-orange-500',
  expert: 'text-red-500',
  master: 'text-pink-500',
  grandmaster: 'text-indigo-500',
  enlightened: 'text-yellow-500',
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
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24" />
      </div>
    )
  }

  const levelColor = LEVEL_COLORS[userStats.karmaLevel]
  const levelProgress = getLevelProgressInfo(userStats.karma, userStats.karmaLevel)
  const isMaxLevel = userStats.karmaLevel === 'enlightened'

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Karma Points</h3>
        </div>
        <span className={clsx('text-sm font-bold capitalize', levelColor)}>{userStats.karmaLevel}</span>
      </div>

      {/* Karma Display */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.karma}</div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Total points earned</p>
      </div>

      {/* Level Progress Bar */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Level {LEVEL_ORDER.indexOf(userStats.karmaLevel) + 1} of {LEVEL_ORDER.length}
          </span>
          {!isMaxLevel && levelProgress.pointsNeeded !== null && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {levelProgress.pointsNeeded} points to level up
            </span>
          )}
          {isMaxLevel && <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">Max Level</span>}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className={clsx(
              'h-full transition-all duration-500 rounded-full',
              isMaxLevel
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            )}
            style={{ width: `${levelProgress.progressPercentage}%` }}
          />
        </div>

        {/* Level Range Info */}
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{levelProgress.currentLevelThreshold.toLocaleString()}</span>
          <span>{(levelProgress.nextLevelThreshold || levelProgress.currentLevelThreshold).toLocaleString()}</span>
        </div>
      </div>

      {/* Simple Progress Bar for Backward Compatibility */}
      <div className="mb-4">
        <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${Math.min((userStats.karma % 500) / 5, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall progression</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Streak */}
        <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {userStats.currentStreak}
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">days</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {userStats.longestStreak}
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">days</span>
          </div>
        </div>

        {/* Total Completed */}
        <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
            {userStats.totalCompleted}
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>

        {/* Achievements */}
        <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Badges</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {userStats.achievements.length}
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">earned</span>
          </div>
        </div>
      </div>
    </div>
  )
}
