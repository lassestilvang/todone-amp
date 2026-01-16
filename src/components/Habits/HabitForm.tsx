import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import type { Habit, HabitFrequency } from '@/types'

const EMOJI_OPTIONS = [
  '💪',
  '🏃',
  '📚',
  '💧',
  '🧘',
  '🎯',
  '✍️',
  '🌅',
  '🛌',
  '🥗',
  '💊',
  '🎸',
  '🖥️',
  '🏋️',
  '🧠',
  '💰',
  '📝',
  '🎨',
  '🌿',
  '☕',
]

const COLOR_OPTIONS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface HabitFormProps {
  habit?: Habit
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt'>) => void
  onClose: () => void
  userId: string
}

export const HabitForm: React.FC<HabitFormProps> = ({ habit, onSubmit, onClose, userId }) => {
  const [name, setName] = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [icon, setIcon] = useState(habit?.icon || '💪')
  const [color, setColor] = useState(habit?.color || '#3b82f6')
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || 'daily')
  const [customDays, setCustomDays] = useState<number[]>(habit?.customDays || [1, 2, 3, 4, 5])
  const [targetCount, setTargetCount] = useState(habit?.targetCount || 1)
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || '')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || '')
      setIcon(habit.icon)
      setColor(habit.color)
      setFrequency(habit.frequency)
      setCustomDays(habit.customDays || [1, 2, 3, 4, 5])
      setTargetCount(habit.targetCount)
      setReminderTime(habit.reminderTime || '')
    }
  }, [habit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      userId,
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      targetCount,
      reminderTime: reminderTime || undefined,
      archivedAt: habit?.archivedAt,
    })
  }

  const toggleCustomDay = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day))
    } else {
      setCustomDays([...customDays, day].sort())
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-primary rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-content-primary">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-content-tertiary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-content-primary focus:ring-2 focus:ring-focus focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-content-primary focus:ring-2 focus:ring-focus focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                Icon
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-2xl text-left"
                >
                  {icon}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-surface-primary border border-border rounded-lg shadow-lg z-10 grid grid-cols-5 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setIcon(emoji)
                          setShowEmojiPicker(false)
                        }}
                        className={clsx(
                          'w-10 h-10 text-xl rounded-lg hover:bg-surface-tertiary transition-colors',
                          icon === emoji && 'bg-brand-100 dark:bg-brand-900'
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-1 p-2 border border-border rounded-lg bg-surface-primary">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={clsx(
                      'w-6 h-6 rounded-full transition-transform',
                      color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Frequency
            </label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'custom'] as HabitFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                    frequency === freq
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-secondary text-content-secondary hover:bg-surface-tertiary'
                  )}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-content-secondary mb-1">
                Days of the week
              </label>
              <div className="flex gap-1">
                {DAY_NAMES.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(index)}
                    className={clsx(
                      'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                      customDays.includes(index)
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-secondary text-content-secondary hover:bg-surface-tertiary'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Target count per day
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={targetCount}
              onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-3 py-2 border border-border rounded-lg bg-surface-primary text-content-primary focus:ring-2 focus:ring-focus focus:border-transparent"
            />
            <p className="mt-1 text-xs text-content-tertiary">
              How many times do you want to complete this habit each day?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-1">
              Reminder time (optional)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-32 px-3 py-2 border border-border rounded-lg bg-surface-primary text-content-primary focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-content-secondary hover:bg-surface-tertiary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              {habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
