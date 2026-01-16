import React from 'react'
import { useGamificationStore } from '@/store/gamificationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import { Zap } from 'lucide-react'

interface LevelProgressBarProps {
  className?: string
  compact?: boolean
}

const KARMA_THRESHOLDS: Record<string, number> = {
  beginner: 0,
  novice: 100,
  intermediate: 300,
  advanced: 800,
  professional: 1500,
  expert: 2500,
  master: 4000,
  grandmaster: 6000,
  enlightened: 9000,
}

const KARMA_LEVELS = ['beginner', 'novice', 'intermediate', 'advanced', 'professional', 'expert', 'master', 'grandmaster', 'enlightened'] as const

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ className, compact = false }) => {
  const user = useAuthStore((state) => state.user)
  const { userStats } = useGamificationStore()

  if (!user || !userStats) {
    return null
  }

  const currentKarma = userStats.karma || 0
  const currentLevel = userStats.karmaLevel || 'beginner'
  const currentLevelIndex = KARMA_LEVELS.indexOf(currentLevel)

  // Get next level threshold
  const nextLevel = currentLevelIndex < KARMA_LEVELS.length - 1 ? KARMA_LEVELS[currentLevelIndex + 1] : currentLevel

  const currentThreshold = KARMA_THRESHOLDS[currentLevel]
  const nextThreshold = KARMA_THRESHOLDS[nextLevel]
  const karmaInCurrentLevel = currentKarma - currentThreshold
  const karmaNeededForNextLevel = nextThreshold - currentThreshold
  const progressPercentage = (karmaInCurrentLevel / karmaNeededForNextLevel) * 100

  const levelColors: Record<string, string> = {
    beginner: 'bg-gray-400',
    novice: 'bg-blue-400',
    intermediate: 'bg-cyan-400',
    advanced: 'bg-green-400',
    professional: 'bg-yellow-400',
    expert: 'bg-orange-400',
    master: 'bg-red-400',
    grandmaster: 'bg-purple-400',
    enlightened: 'bg-pink-400',
  }

  const levelEmojis: Record<string, string> = {
    beginner: '🌱',
    novice: '📚',
    intermediate: '⭐',
    advanced: '🚀',
    professional: '💼',
    expert: '🎯',
    master: '👑',
    grandmaster: '🏆',
    enlightened: '✨',
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1">
          <span className="text-sm">{levelEmojis[currentLevel]}</span>
          <span className="text-xs font-semibold text-content-secondary capitalize">{currentLevel}</span>
        </div>
        <div className="w-24 h-2 rounded-full bg-interactive-secondary overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', levelColors[currentLevel])}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <span className="text-xs text-content-tertiary">{currentKarma}</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 rounded-lg border border-border bg-surface-primary p-4', className)}>
      {/* Current Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{levelEmojis[currentLevel]}</span>
          <div>
            <p className="text-sm font-semibold text-content-primary capitalize">{currentLevel}</p>
            <p className="text-xs text-content-tertiary">{currentKarma} karma points</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-bold text-content-primary">{currentKarma}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {currentLevel !== 'enlightened' && (
        <>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-content-secondary">Progress to next level</p>
              <p className="text-xs text-content-tertiary">
                {karmaInCurrentLevel} / {karmaNeededForNextLevel}
              </p>
            </div>
            <div className="w-full h-3 rounded-full bg-interactive-secondary overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', levelColors[currentLevel])}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Next Level Preview */}
          <div className="flex items-center gap-2 rounded-md bg-surface-secondary p-2">
            <span className="text-lg">{levelEmojis[nextLevel]}</span>
            <div className="text-xs text-content-secondary">
              <p className="font-medium capitalize">{nextLevel}</p>
              <p className="text-content-tertiary">{nextThreshold} karma points</p>
            </div>
          </div>
        </>
      )}

      {/* Max Level Message */}
      {currentLevel === 'enlightened' && (
        <div className="rounded-md bg-purple-50 p-2 text-center dark:bg-purple-900">
          <p className="text-xs font-medium text-purple-900 dark:text-purple-200">You've reached the highest level!</p>
          <p className="text-xs text-purple-700 dark:text-purple-300">Continue earning karma to unlock achievements</p>
        </div>
      )}
    </div>
  )
}
