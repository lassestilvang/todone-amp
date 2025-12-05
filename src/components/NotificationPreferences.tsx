import { useState } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import { Bell, Mail, Volume2, Smartphone } from 'lucide-react'

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const { user } = useAuthStore()
  const { preferences, updatePreferences } = useNotificationStore()
  const [isSaving, setIsSaving] = useState(false)
  const [quietHours, setQuietHours] = useState(preferences.quietHours || {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  })

  const handleToggle = async (key: string) => {
    if (!user) return
    setIsSaving(true)
    try {
      await updatePreferences(user.id, {
        [key]: !preferences[key as keyof typeof preferences],
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuietHoursToggle = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await updatePreferences(user.id, {
        quietHours: {
          ...quietHours,
          enabled: !quietHours.enabled,
        },
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuietHourChange = async (field: 'startTime' | 'endTime', value: string) => {
    if (!user) return
    const newQuietHours = { ...quietHours, [field]: value }
    setQuietHours(newQuietHours)
    setIsSaving(true)
    try {
      await updatePreferences(user.id, {
        quietHours: newQuietHours,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const preferenceOptions = [
    {
      key: 'enableBrowserNotifications',
      label: 'Browser Notifications',
      icon: Bell,
      description: 'Show desktop notifications',
    },
    {
      key: 'enableEmailNotifications',
      label: 'Email Notifications',
      icon: Mail,
      description: 'Receive email updates',
    },
    {
      key: 'enableSoundNotifications',
      label: 'Sound Notifications',
      icon: Volume2,
      description: 'Play notification sounds',
    },
    {
      key: 'enablePushNotifications',
      label: 'Push Notifications',
      icon: Smartphone,
      description: 'Push notifications on mobile',
    },
  ]

  return (
    <div className={cn('space-y-6 rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Notification Preferences
      </h3>

      {/* Toggle options */}
      <div className="space-y-4">
        {preferenceOptions.map(({ key, label, icon: Icon, description }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded border border-gray-100 p-3 dark:border-gray-800"
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const keyMap = {
                  enableBrowserNotifications: 'enableBrowserNotifications',
                  enableEmailNotifications: 'enableEmailNotifications',
                  enableSoundNotifications: 'enableSoundNotifications',
                  enablePushNotifications: 'enablePushNotifications',
                }
                handleToggle(keyMap[key as keyof typeof keyMap])
              }}
              disabled={isSaving}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors',
                preferences[key as keyof typeof preferences]
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  preferences[key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Quiet hours */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Quiet Hours</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Disable notifications during these hours
            </p>
          </div>
          <button
            onClick={handleQuietHoursToggle}
            disabled={isSaving}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors',
              quietHours.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {quietHours.enabled && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                From
              </label>
              <input
                type="time"
                value={quietHours.startTime}
                onChange={(e) =>
                  handleQuietHourChange('startTime', e.target.value)
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                To
              </label>
              <input
                type="time"
                value={quietHours.endTime}
                onChange={(e) =>
                  handleQuietHourChange('endTime', e.target.value)
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Notification preferences are saved locally. Email and push notifications require backend
          configuration.
        </p>
      </div>
    </div>
  )
}
