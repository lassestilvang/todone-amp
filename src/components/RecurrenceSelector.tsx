import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { RecurrencePattern } from '@/types'
import { formatRecurrencePattern, validateRecurrencePattern } from '@/utils/recurrence'
import { cn } from '@/utils/cn'

interface RecurrenceSelectorProps {
  value?: RecurrencePattern
  onChange: (pattern: RecurrencePattern | undefined) => void
}

type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFreq, setSelectedFreq] = useState<RecurrenceFrequency>(value?.frequency || 'daily')
  const [interval, setInterval] = useState(value?.interval || 1)
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    new Set(value?.daysOfWeek || [])
  )
  const [dayOfMonth, setDayOfMonth] = useState(value?.dayOfMonth || new Date().getDate())

  const frequencies: { value: RecurrenceFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleSave = () => {
    const pattern: RecurrencePattern = {
      frequency: selectedFreq,
      interval,
      daysOfWeek: selectedFreq === 'weekly' ? Array.from(selectedDays) : undefined,
      dayOfMonth: selectedFreq === 'monthly' ? dayOfMonth : undefined,
      startDate: new Date(),
      exceptions: [],
    }

    if (validateRecurrencePattern(pattern)) {
      onChange(pattern)
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    onChange(undefined)
    setIsOpen(false)
  }

  const handleDayToggle = (day: number) => {
    const newDays = new Set(selectedDays)
    if (newDays.has(day)) {
      newDays.delete(day)
    } else {
      newDays.add(day)
    }
    setSelectedDays(newDays)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Recurrence</label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 flex items-center justify-between"
      >
        <span className="text-gray-900">
          {value ? formatRecurrencePattern(value) : 'No recurrence'}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={selectedFreq}
              onChange={(e) => setSelectedFreq(e.target.value as RecurrenceFrequency)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Every
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedFreq === 'daily' && `every ${interval} day${interval > 1 ? 's' : ''}`}
              {selectedFreq === 'weekly' && `every ${interval} week${interval > 1 ? 's' : ''}`}
              {selectedFreq === 'monthly' && `every ${interval} month${interval > 1 ? 's' : ''}`}
              {selectedFreq === 'yearly' && `every ${interval} year${interval > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Days of Week (for weekly) */}
          {selectedFreq === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDayToggle(index)}
                    className={cn(
                      'py-1 text-xs font-medium rounded transition-colors',
                      selectedDays.has(index)
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {selectedFreq === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-brand-600 text-white font-medium rounded hover:bg-brand-700 transition-colors"
            >
              Set
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={14} />
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
