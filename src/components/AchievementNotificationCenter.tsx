import React, { useEffect, useState } from 'react'
import { Trophy, X } from 'lucide-react'
import { useGamificationStore } from '@/store/gamificationStore'
import type { Achievement } from '@/hooks/useAchievementNotifier'
import { cn } from '@/utils/cn'

interface UnlockedNotification extends Achievement {
  key: string
  timestamp: number
}

/**
 * AchievementNotificationCenter displays achievement unlock notifications
 * Manages a queue of notifications with auto-dismissal
 */
export const AchievementNotificationCenter: React.FC = () => {
  const { achievements } = useGamificationStore()
  const [notifications, setNotifications] = useState<UnlockedNotification[]>([])

  // Track previous achievement count to detect new unlocks
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0)

  // Track achievement unlocks (simplified - in production would use event emitter)
  useEffect(() => {
    // This is a placeholder - proper implementation would use a dedicated event system
    // For now, notifications are triggered externally via setNotifications calls
    const currentCount = achievements.length
    if (currentCount > previousAchievementCount) {
      setPreviousAchievementCount(currentCount)
    }
  }, [achievements, previousAchievementCount])

  const removeNotification = (key: string) => {
    setNotifications((prev) => prev.filter((n) => n.key !== key))
  }

  // Expose addNotification for external use
  React.useEffect(() => {
    const addNotification = (achievement: Achievement) => {
      const notification: UnlockedNotification = {
        ...achievement,
        key: `${achievement.id}-${Date.now()}`,
        timestamp: Date.now(),
      }

      setNotifications((prev) => [...prev, notification])

      // Auto-dismiss after 5 seconds
      setTimeout(() => removeNotification(notification.key), 5000)
    }

    const windowType = window as unknown as Record<string, unknown>
    windowType.__addAchievementNotification = addNotification
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.key}
          className={cn(
            'pointer-events-auto',
            'animate-in slide-in-from-right-5',
            'bg-gradient-to-r from-amber-400 to-yellow-400',
            'dark:from-amber-600 dark:to-yellow-600',
            'rounded-lg shadow-lg p-4 max-w-sm',
            'flex items-center gap-3'
          )}
        >
          {/* Icon */}
          <div className="text-3xl flex-shrink-0">{notification.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-accent-yellow flex-shrink-0" />
              <p className="font-bold text-accent-yellow">Achievement Unlocked</p>
            </div>
            <p className="text-sm text-accent-yellow line-clamp-2">{notification.name}</p>
            <p className="text-xs text-accent-yellow mt-1">+{notification.points} Karma Points</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => removeNotification(notification.key)}
            className={cn(
              'flex-shrink-0 p-1 rounded',
              'text-accent-yellow',
              'hover:bg-accent-yellow/20',
              'transition-colors'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
