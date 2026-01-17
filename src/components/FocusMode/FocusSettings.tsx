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
      <div className="w-full max-w-md rounded-t-lg bg-surface-primary p-6 shadow-xl md:mx-auto md:rounded-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-content-primary">
            Focus Settings
          </h2>
          <button
            onClick={onClose}
            className="text-content-tertiary hover:text-content-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto">
          {/* Duration Settings */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-brand-500" />
              <p className="font-medium text-content-primary">Duration Settings</p>
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
          <div className="rounded-lg bg-surface-secondary p-4">
            <div className="mb-4 flex items-center gap-3">
              <Coffee className="h-5 w-5 text-amber-500" />
              <p className="font-medium text-content-primary">Session Settings</p>
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
          <div className="rounded-lg bg-surface-secondary p-4">
            <div className="mb-4 flex items-center gap-3">
              <Moon className="h-5 w-5 text-icon-purple" />
              <p className="font-medium text-content-primary">Auto-start</p>
            </div>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-content-secondary">
                  Auto-start breaks
                </span>
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-brand-500"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-content-secondary">
                  Auto-start focus sessions
                </span>
                <input
                  type="checkbox"
                  checked={autoStartFocus}
                  onChange={(e) => setAutoStartFocus(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-brand-500"
                />
              </label>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="rounded-lg bg-surface-secondary p-4">
            <div className="mb-4 flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-icon-success" />
              <p className="font-medium text-content-primary">Sound</p>
            </div>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-content-secondary">Enable sound</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-brand-500"
                />
              </label>
              <div>
                <label className="mb-1 block text-sm font-medium text-content-secondary">
                  Sound type
                </label>
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value as FocusSoundType)}
                  disabled={!soundEnabled}
                  className={clsx(
                    'w-full rounded-md border border-border px-3 py-2',
                    'text-base text-content-primary',
                    'bg-surface-primary',
                    'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
                    'disabled:bg-surface-tertiary disabled:text-content-tertiary disabled:cursor-not-allowed'
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
