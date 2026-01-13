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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'p-2 rounded-lg',
              isEnabled ? 'bg-brand-100 dark:bg-brand-900' : 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            {isEnabled ? (
              <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Daily Reminder</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEnabled ? `Reminder set for ${formatTime(reminderTime)}` : 'No reminder set'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reminder Time
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
