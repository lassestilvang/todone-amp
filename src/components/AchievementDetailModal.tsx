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
        <div className="bg-surface-primary rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="relative px-6 py-8 text-center border-b border-border">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-content-tertiary hover:text-content-secondary"
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
                <Trophy className="w-5 h-5 text-accent-yellow" />
              ) : (
                <Lock className="w-5 h-5 text-content-tertiary" />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
                  isUnlocked ? 'text-accent-yellow' : 'text-content-tertiary'
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
              <h2 className="text-2xl font-bold text-content-primary">
                {achievement.name}
              </h2>
            </div>

            {/* Description */}
            <div>
              <p className="text-content-secondary">{achievement.description}</p>
            </div>

            {/* Reward */}
            <div className="flex items-center gap-2 p-3 bg-info-light rounded-lg">
              <Gift className="w-5 h-5 text-info dark:text-info flex-shrink-0" />
              <span className="text-sm font-medium text-info-dark dark:text-info">
                Reward: +{achievement.points} Karma Points
              </span>
            </div>

            {/* Unlock Info */}
            {isUnlocked && (
              <div className="p-3 bg-success-light rounded-lg">
                <p className="text-sm text-success-dark dark:text-semantic-success">
                  ✓ Achievement unlocked!
                </p>
                <p className="text-xs text-semantic-success mt-1">Great job on your progress!</p>
              </div>
            )}

            {/* Additional Details */}
            <div className="pt-4 space-y-2 text-sm text-content-secondary">
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="font-medium text-content-primary">
                  {achievement.points > 300 ? 'Hard' : achievement.points > 100 ? 'Medium' : 'Easy'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium text-content-primary">
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
          <div className="px-6 py-4 bg-surface-secondary rounded-b-lg flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-interactive-secondary text-content-primary rounded-lg font-medium hover:bg-surface-tertiary transition-colors"
            >
              Close
            </button>
            {isUnlocked && (
              <button className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
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
