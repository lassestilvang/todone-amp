import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { X, Save, Clock, Coffee, Moon, Volume2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useFocusStore } from '@/store/focusStore'
import { useAuthStore } from '@/store/authStore'
import type { FocusSoundType } from '@/types'

interface FocusSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function FocusSettings({ isOpen, onClose }: FocusSettingsProps) {
  const { user } = useAuthStore()
  const { settings, updateSettings } = useFocusStore()

  const [focusDuration, setFocusDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4)
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [autoStartFocus, setAutoStartFocus] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundType, setSoundType] = useState<FocusSoundType>('bell')

  useEffect(() => {
    if (settings) {
      setFocusDuration(Math.round(settings.focusDuration / 60))
      setShortBreakDuration(Math.round(settings.shortBreakDuration / 60))
      setLongBreakDuration(Math.round(settings.longBreakDuration / 60))
      setSessionsUntilLongBreak(settings.sessionsUntilLongBreak)
      setAutoStartBreaks(settings.autoStartBreaks)
      setAutoStartFocus(settings.autoStartFocus)
      setSoundEnabled(settings.soundEnabled)
      setSoundType(settings.soundType)
    }
  }, [settings])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!user) return

    await updateSettings(user.id, {
      focusDuration: focusDuration * 60,
      shortBreakDuration: shortBreakDuration * 60,
      longBreakDuration: longBreakDuration * 60,
      sessionsUntilLongBreak,
      autoStartBreaks,
      autoStartFocus,
      soundEnabled,
      soundType,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 md:items-center">
      <div className="w-full max-w-md rounded-t-lg bg-white p-6 shadow-xl md:mx-auto md:rounded-2xl dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Focus Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto">
          {/* Duration Settings */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-brand-500" />
              <p className="font-medium text-gray-900 dark:text-white">Duration Settings</p>
            </div>
            <div className="space-y-4">
              <Input
                type="number"
                label="Focus duration (minutes)"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={120}
              />
              <Input
                type="number"
                label="Short break (minutes)"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={30}
              />
              <Input
                type="number"
                label="Long break (minutes)"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={60}
              />
            </div>
          </div>

          {/* Session Settings */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Coffee className="h-5 w-5 text-amber-500" />
              <p className="font-medium text-gray-900 dark:text-white">Session Settings</p>
            </div>
            <Input
              type="number"
              label="Sessions until long break"
              value={sessionsUntilLongBreak}
              onChange={(e) =>
                setSessionsUntilLongBreak(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={10}
            />
          </div>

          {/* Auto-start Settings */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Moon className="h-5 w-5 text-purple-500" />
              <p className="font-medium text-gray-900 dark:text-white">Auto-start</p>
            </div>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-start breaks
                </span>
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-brand-500"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-start focus sessions
                </span>
                <input
                  type="checkbox"
                  checked={autoStartFocus}
                  onChange={(e) => setAutoStartFocus(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-brand-500"
                />
              </label>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-green-500" />
              <p className="font-medium text-gray-900 dark:text-white">Sound</p>
            </div>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable sound</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-brand-500"
                />
              </label>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sound type
                </label>
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value as FocusSoundType)}
                  disabled={!soundEnabled}
                  className={clsx(
                    'w-full rounded-md border border-gray-300 px-3 py-2',
                    'text-base text-gray-900 dark:text-white',
                    'bg-white dark:bg-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                    'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
                    'dark:border-gray-600 dark:disabled:bg-gray-800'
                  )}
                >
                  <option value="bell">Bell</option>
                  <option value="chime">Chime</option>
                  <option value="none">None</option>
                </select>
              </div>
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
