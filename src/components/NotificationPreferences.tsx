import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import {
  Bell,
  Mail,
  Smartphone,
  Volume2,
  Clock,
  X,
  Save,
} from 'lucide-react'
import { useState } from 'react'

interface NotificationPreferencesProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPreferences({ isOpen, onClose }: NotificationPreferencesProps) {
  const { user, updateUser } = useAuthStore()
  const quietHours = user?.settings.notificationPreferences?.quietHours
  const [quietEnabled, setQuietEnabled] = useState(quietHours?.enabled || false)
  const [quietHourStart, setQuietHourStart] = useState(quietHours?.startTime || '22:00')
  const [quietHourEnd, setQuietHourEnd] = useState(quietHours?.endTime || '08:00')
  const [browserNotifs, setBrowserNotifs] = useState(
    user?.settings.notificationPreferences?.enableBrowserNotifications !== false
  )
  const [emailNotifs, setEmailNotifs] = useState(
    user?.settings.notificationPreferences?.enableEmailNotifications !== false
  )
  const [pushNotifs, setPushNotifs] = useState(
    user?.settings.notificationPreferences?.enablePushNotifications !== false
  )
  const [soundEnabled, setSoundEnabled] = useState(
    user?.settings.notificationPreferences?.enableSoundNotifications !== false
  )

  if (!isOpen || !user) return null

  const handleSave = async () => {
    await updateUser({
      settings: {
        ...user.settings,
        notificationPreferences: {
          ...user.settings.notificationPreferences,
          enableBrowserNotifications: browserNotifs,
          enableEmailNotifications: emailNotifs,
          enablePushNotifications: pushNotifs,
          enableSoundNotifications: soundEnabled,
          quietHours: {
            enabled: quietEnabled,
            startTime: quietHourStart,
            endTime: quietHourEnd,
          },
        },
      },
    })
    onClose()
  }

  const handleRequestBrowserPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setBrowserNotifs(true)
        new Notification('Notifications enabled!', {
          body: 'You will now receive browser notifications.',
          icon: '/icon-192.png',
        })
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 md:items-center">
      <div className="w-full max-w-md rounded-lg bg-surface-primary p-6 shadow-xl md:rounded-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-content-primary">
            Notification Preferences
          </h2>
          <button
            onClick={onClose}
            className="text-content-tertiary hover:text-content-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Browser Notifications */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-semantic-info" />
                <div>
                  <p className="font-medium text-content-primary">
                    Browser Notifications
                  </p>
                  <p className="text-sm text-content-secondary">
                    Alerts in your browser
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={browserNotifs}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleRequestBrowserPermission()
                  } else {
                    setBrowserNotifs(false)
                  }
                }}
                className="h-5 w-5 rounded border-border text-brand-500"
              />
            </label>
          </div>

          {/* Email Notifications */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-semantic-success" />
                <div>
                  <p className="font-medium text-content-primary">
                    Email Notifications
                  </p>
                  <p className="text-sm text-content-secondary">
                    Alerts sent to your email
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-5 w-5 rounded border-border text-brand-500"
              />
            </label>
          </div>

          {/* Push Notifications */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-accent-purple" />
                <div>
                  <p className="font-medium text-content-primary">
                    Push Notifications
                  </p>
                  <p className="text-sm text-content-secondary">
                    Mobile app alerts
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="h-5 w-5 rounded border-border text-brand-500"
              />
            </label>
          </div>

          {/* Sound Notifications */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-semantic-warning" />
                <div>
                  <p className="font-medium text-content-primary">
                    Sound Effects
                  </p>
                  <p className="text-sm text-content-secondary">
                    Play notification sounds
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-border text-brand-500"
              />
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <label className="mb-4 flex cursor-pointer items-center gap-3">
              <Clock className="h-5 w-5 text-content-secondary" />
              <div className="flex-1">
                <p className="font-medium text-content-primary">Quiet Hours</p>
                <p className="text-sm text-content-secondary">
                  No notifications between these times
                </p>
              </div>
              <input
                type="checkbox"
                checked={quietEnabled}
                onChange={(e) => setQuietEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-border text-brand-500"
              />
            </label>
            {quietEnabled && (
              <div className="space-y-3">
                <Input
                  type="time"
                  value={quietHourStart}
                  onChange={(e) => setQuietHourStart(e.target.value)}
                  label="Start time"
                />
                <Input
                  type="time"
                  value={quietHourEnd}
                  onChange={(e) => setQuietHourEnd(e.target.value)}
                  label="End time"
                />
              </div>
            )}
          </div>

          {/* Notification Types */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <p className="mb-3 font-medium text-content-primary">
              Notification Types
            </p>
            <div className="space-y-2">
              {[
                { label: 'Task assigned', id: 'task_assigned' },
                { label: 'Task shared', id: 'task_shared' },
                { label: 'Comments', id: 'comment' },
                { label: 'Reminders', id: 'reminder' },
                { label: 'System updates', id: 'system' },
              ].map((type) => (
                <label key={type.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-border text-brand-500"
                  />
                  <span className="text-sm text-content-secondary">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
