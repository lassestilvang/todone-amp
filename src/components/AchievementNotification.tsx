import React, { useEffect, useState } from 'react'
import { X, Award } from 'lucide-react'
import clsx from 'clsx'

export interface AchievementNotificationProps {
  id: string
  name: string
  description: string
  icon: string
  points: number
  onClose?: () => void
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  name,
  description,
  icon,
  points,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg',
        'bg-accent-yellow-subtle',
        'border border-accent-yellow',
        'animate-in slide-in-from-bottom-5 duration-300'
      )}
      role="status"
      aria-live="polite"
      aria-label={`Achievement unlocked: ${name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="text-4xl flex-shrink-0">{icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-accent-yellow flex-shrink-0" />
              <h3 className="font-bold text-content-primary truncate">{name}</h3>
              </div>
              <p className="text-sm text-content-secondary mb-2">{description}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-accent-yellow">
                +{points} Karma
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="flex-shrink-0 text-content-tertiary hover:text-content-secondary transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-accent-yellow/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-yellow animate-shrink"
          style={{
            animation: 'shrink 5s linear forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

// Provider component to manage multiple notifications
interface NotificationItem extends AchievementNotificationProps {
  id: string
}

export const AchievementNotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const addNotification = (notification: Omit<NotificationItem, 'id'>) => {
    const id = `notification-${Date.now()}`
    const newNotification: NotificationItem = {
      ...notification,
      id,
    }

    setNotifications((prev) => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Expose global function for adding notifications
  React.useEffect(() => {
    (window as unknown as { addAchievementNotification?: typeof addNotification })
      .addAchievementNotification = addNotification
  }, [])

  return (
    <div className="fixed bottom-4 right-4 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <AchievementNotification
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}
