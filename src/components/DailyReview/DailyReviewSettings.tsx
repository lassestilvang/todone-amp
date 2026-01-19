import { useEffect } from 'react'
import { X, Sun, Moon, Bell } from 'lucide-react'
import { Button } from '@/components/Button'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { cn } from '@/utils/cn'

interface DailyReviewSettingsProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function DailyReviewSettings({ isOpen, onClose, userId }: DailyReviewSettingsProps) {
  const { settings, loadSettings, updateSettings } = useDailyReviewStore()

  useEffect(() => {
    if (isOpen && !settings) {
      loadSettings(userId)
    }
  }, [isOpen, settings, loadSettings, userId])

  if (!isOpen) return null

  const handleToggle = (
    key: 'morningReviewEnabled' | 'eveningReviewEnabled' | 'autoPrompt'
  ) => {
    if (!settings) return
    updateSettings(userId, { [key]: !settings[key] })
  }

  const handleTimeChange = (key: 'morningReviewTime' | 'eveningReviewTime', value: string) => {
    updateSettings(userId, { [key]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={cn(
          'bg-surface-primary rounded-xl shadow-2xl',
          'w-full max-w-md mx-4 max-h-[90vh] overflow-hidden'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-content-primary">
            Daily Review Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-content-tertiary" />
          </button>
        </div>

        {settings && (
          <div className="p-4 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-icon-yellow" />
                  </div>
                  <div>
                    <p className="font-medium text-content-primary">Morning Review</p>
                    <p className="text-sm text-content-tertiary">
                      Plan your day ahead
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('morningReviewEnabled')}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    settings.morningReviewEnabled
                      ? 'bg-blue-500'
                      : 'bg-interactive-secondary'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                      settings.morningReviewEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>

              {settings.morningReviewEnabled && (
                <div className="ml-13 pl-13">
                  <label className="block text-sm text-content-tertiary mb-1">
                    Review time
                  </label>
                  <input
                    type="time"
                    value={settings.morningReviewTime}
                    onChange={(e) => handleTimeChange('morningReviewTime', e.target.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg border',
                      'bg-surface-primary',
                      'border-border',
                      'text-content-primary',
                      'focus:outline-none focus:ring-2 focus:ring-focus'
                    )}
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-icon-indigo" />
                  </div>
                  <div>
                    <p className="font-medium text-content-primary">Evening Review</p>
                    <p className="text-sm text-content-tertiary">
                      Reflect on your day
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('eveningReviewEnabled')}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    settings.eveningReviewEnabled
                      ? 'bg-blue-500'
                      : 'bg-interactive-secondary'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                      settings.eveningReviewEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>

              {settings.eveningReviewEnabled && (
                <div className="ml-13 pl-13">
                  <label className="block text-sm text-content-tertiary mb-1">
                    Review time
                  </label>
                  <input
                    type="time"
                    value={settings.eveningReviewTime}
                    onChange={(e) => handleTimeChange('eveningReviewTime', e.target.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg border',
                      'bg-surface-primary',
                      'border-border',
                      'text-content-primary',
                      'focus:outline-none focus:ring-2 focus:ring-focus'
                    )}
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center">
                    <Bell className="w-5 h-5 text-content-tertiary" />
                  </div>
                  <div>
                    <p className="font-medium text-content-primary">Auto Prompt</p>
                    <p className="text-sm text-content-tertiary">
                      Show review prompt at scheduled times
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('autoPrompt')}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    settings.autoPrompt ? 'bg-blue-500' : 'bg-interactive-secondary'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                      settings.autoPrompt && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <Button onClick={onClose} variant="primary" className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
