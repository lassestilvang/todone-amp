import { useState } from 'react'
import { Clock, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { parseNaturalLanguageTime } from '@/utils/date'

export interface TimePickerInputProps {
  value?: string
  onChange: (time: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePickerInput({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className,
}: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (val.trim()) {
      const parsed = parseNaturalLanguageTime(val)
      if (parsed) {
        onChange(parsed)
        setInputValue('')
        setIsOpen(false)
      }
    }
  }

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setInputValue('')
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setInputValue('')
  }

  const generateTimeOptions = () => {
    const times: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        times.push(timeStr)
      }
    }
    return times
  }

  const displayTime = value || placeholder

  return (
    <div className={cn('relative', className)}>
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
          <Clock size={16} />
          {displayTime}
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
              placeholder="at 3pm, at 14:00..."
              className={cn(
                'w-full px-3 py-2 border border-border rounded-md text-sm',
                'bg-input-bg text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-focus'
              )}
              autoFocus
            />
            <p className="text-xs text-content-tertiary mt-2">Try: at 3pm, at 14:00, at 9:30am</p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {generateTimeOptions().map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={cn(
                    'px-2 py-2 text-xs font-medium rounded',
                    'hover:bg-brand-100 dark:hover:bg-brand-900 border border-border',
                    value === time && 'bg-brand-500 text-white border-brand-500'
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
