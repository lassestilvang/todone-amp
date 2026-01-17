import { useState, useRef, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDueDate } from '@/utils/date'
import { parseNaturalLanguageDate } from '@/utils/date'

export interface DatePickerInputProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (val.trim()) {
      const parsed = parseNaturalLanguageDate(val)
      if (parsed) {
        onChange(parsed)
      }
    }
  }

  const handleDateSelect = (date: Date) => {
    onChange(date)
    setInputValue('')
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setInputValue('')
  }

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const displayDate = value ? formatDueDate(value) : placeholder
  const calendarDate = value || new Date()
  const calendarDays = getCalendarDays(calendarDate)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 border border-border rounded-md',
          'text-sm font-medium text-content-secondary bg-surface-primary',
          'hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-focus',
          'disabled:opacity-50 disabled:cursor-not-allowed w-full justify-between'
        )}
      >
        <span className="flex items-center gap-2">
          <Calendar size={16} />
          {displayDate}
        </span>
        {value && <X size={16} className="text-content-tertiary hover:text-content-secondary" onClick={handleClear} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface-primary border border-border rounded-lg shadow-lg p-4 w-80">
          <div className="mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Today, tomorrow, in 3 days..."
              className={cn(
                'w-full px-3 py-2 border border-border rounded-md text-sm',
                'bg-input-bg text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-focus'
              )}
              autoFocus
            />
            <p className="text-xs text-content-tertiary mt-2">
              Try: today, tomorrow, monday, in 3 days, Jan 15, next week
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-content-secondary h-6 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={day === null}
                  onClick={() => {
                    if (day) {
                      handleDateSelect(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day))
                    }
                  }}
                  className={cn(
                    'h-8 text-sm font-medium rounded',
                    day === null && 'invisible',
                    day && 'hover:bg-brand-100 dark:hover:bg-brand-900 cursor-pointer',
                    value &&
                      day === value.getDate() &&
                      value.getMonth() === calendarDate.getMonth() &&
                      value.getFullYear() === calendarDate.getFullYear() &&
                      'bg-brand-500 text-white'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="text-xs px-2 py-1 rounded hover:bg-surface-tertiary"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                handleDateSelect(tomorrow)
              }}
              className="text-xs px-2 py-1 rounded hover:bg-surface-tertiary"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                handleDateSelect(nextWeek)
              }}
              className="text-xs px-2 py-1 rounded hover:bg-surface-tertiary"
            >
              Next week
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
