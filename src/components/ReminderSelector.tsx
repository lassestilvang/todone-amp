import { useState } from 'react'
import { useReminderStore, type ReminderType } from '@/store/reminderStore'
import { cn } from '@/utils/cn'
import { Clock, MapPin, Bell, Plus, X } from 'lucide-react'

interface ReminderSelectorProps {
  taskId: string
  onReminderAdded?: (reminderId: string) => void
  className?: string
}

export function ReminderSelector({ taskId, onReminderAdded, className }: ReminderSelectorProps) {
  const { getRemindersForTask, addReminder, deleteReminder } = useReminderStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ReminderType>('before')
  const [minutesBefore, setMinutesBefore] = useState(30)
  const [reminderTime, setReminderTime] = useState('09:00')

  const reminders = getRemindersForTask(taskId)

  const handleAdd = async () => {
    const id = await addReminder(taskId, selectedType, minutesBefore, reminderTime)
    onReminderAdded?.(id)
    setIsOpen(false)
  }

  const handleDelete = async (reminderId: string) => {
    await deleteReminder(reminderId)
  }

  const reminderLabels: Record<ReminderType, string> = {
    before: 'Minutes before',
    at: 'At specific time',
    location: 'Location-based',
    manual: 'Manual reminder',
  }

  const presetMinutes = [5, 10, 15, 30, 60, 1440] // 1440 = 1 day
  const presetLabels: Record<number, string> = {
    5: '5 min',
    10: '10 min',
    15: '15 min',
    30: '30 min',
    60: '1 hour',
    1440: '1 day',
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminders</h4>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Existing reminders */}
      {reminders.length > 0 && (
        <div className="space-y-1">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2 text-sm">
                {reminder.type === 'before' && (
                  <>
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {reminder.minutesBefore} min before
                    </span>
                  </>
                )}
                {reminder.type === 'at' && (
                  <>
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {reminder.reminderTime}
                    </span>
                  </>
                )}
                {reminder.type === 'location' && (
                  <>
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {reminder.location || 'Location'}
                    </span>
                  </>
                )}
                {reminder.type === 'manual' && (
                  <>
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Manual</span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleDelete(reminder.id)}
                className="rounded p-0.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add reminder form */}
      {isOpen && (
        <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          {/* Type selector */}
          <div className="mb-3">
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Reminder type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['before', 'at', 'location', 'manual'] as ReminderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'rounded px-2 py-1.5 text-xs font-medium transition-colors',
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {reminderLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific settings */}
          {selectedType === 'before' && (
            <div className="mb-3">
              <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Minutes before
              </label>
              <div className="mb-2 flex gap-1">
                {presetMinutes.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setMinutesBefore(minutes)}
                    className={cn(
                      'rounded px-2 py-1 text-xs font-medium',
                      minutesBefore === minutes
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                    )}
                  >
                    {presetLabels[minutes]}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={minutesBefore}
                onChange={(e) => setMinutesBefore(parseInt(e.target.value) || 30)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {selectedType === 'at' && (
            <div className="mb-3">
              <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Reminder time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded bg-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
