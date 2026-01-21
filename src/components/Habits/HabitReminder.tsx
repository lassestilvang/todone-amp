import React from 'react'
import { Bell, BellOff } from 'lucide-react'
import clsx from 'clsx'

interface HabitReminderProps {
  reminderTime?: string
  onChange: (time: string | undefined) => void
}

export const HabitReminder: React.FC<HabitReminderProps> = ({ reminderTime, onChange }) => {
  const isEnabled = !!reminderTime

  const handleToggle = () => {
    if (isEnabled) {
      onChange(undefined)
    } else {
      onChange('09:00')
    }
  }

  return (
    <div className="bg-surface-primary rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'p-2 rounded-lg',
              isEnabled ? 'bg-interactive-secondary' : 'bg-surface-secondary'
            )}
          >
            {isEnabled ? (
              <Bell className="w-5 h-5 text-interactive-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-content-tertiary" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-content-primary">Daily Reminder</h4>
            <p className="text-sm text-content-tertiary">
              {isEnabled ? `Reminder set for ${formatTime(reminderTime)}` : 'No reminder set'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isEnabled ? 'bg-interactive-primary' : 'bg-surface-tertiary'
          )}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="mt-4 pt-4 border-t border-border">
          <label className="block text-sm font-medium text-content-secondary mb-2">
            Reminder Time
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-surface-primary text-content-primary focus:ring-2 focus:ring-focus focus:border-transparent"
          />
        </div>
      )}
    </div>
  )
}

function formatTime(time?: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
