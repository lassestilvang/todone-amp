import React from 'react'
import { Lock, Trophy, Gift, Share2 } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import { cn } from '@/utils/cn'

interface AchievementDetailModalProps {
  achievementId: string
  isOpen: boolean
  onClose: () => void
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievementId,
  isOpen,
  onClose,
}) => {
  const { achievements, userStats } = useGamificationStore()

  if (!isOpen) return null

  const achievement = achievements.find((a) => a.id === achievementId)
  if (!achievement) return null

  const isUnlocked = userStats?.achievements.some(
    (a) => (typeof a === 'string' ? a : a.id) === achievementId
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="relative px-6 py-8 text-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>

            {/* Icon */}
            <div
              className={cn(
                'text-6xl mb-4 mx-auto',
                isUnlocked ? 'drop-shadow-lg' : 'opacity-30'
              )}
            >
              {achievement.icon}
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {isUnlocked ? (
                <Trophy className="w-5 h-5 text-amber-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
                  isUnlocked
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {isUnlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {achievement.name}
              </h2>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-600 dark:text-gray-300">{achievement.description}</p>
            </div>

            {/* Reward */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Reward: +{achievement.points} Karma Points
              </span>
            </div>

            {/* Unlock Info */}
            {isUnlocked && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-200">
                  ✓ Achievement unlocked!
                </p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Great job on your progress!
                </p>
              </div>
            )}

            {/* Additional Details */}
            <div className="pt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {achievement.points > 300 ? 'Hard' : achievement.points > 100 ? 'Medium' : 'Easy'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {achievementId.includes('streak')
                    ? 'Streaks'
                    : achievementId.includes('task')
                      ? 'Tasks'
                      : achievementId.includes('priority')
                        ? 'Priorities'
                        : 'Other'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
            {isUnlocked && (
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
