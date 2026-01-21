import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useRecurrenceStore } from '@/store/recurrenceStore'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  addMonths,
  format,
} from 'date-fns'
import type { Task } from '@/types'

export interface RecurrenceCalendarViewProps {
  task: Task
  className?: string
  onSelectDate?: (date: Date) => void
}

export function RecurrenceCalendarView({
  task,
  className,
  onSelectDate,
}: RecurrenceCalendarViewProps) {
  const { loadTaskInstances, getInstancesByDateRange } = useRecurrenceStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded) {
      loadTaskInstances(task.id).then(() => setHasLoaded(true))
    }
  }, [task.id, hasLoaded, loadTaskInstances])

  if (!task.recurrence) {
    return null
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const instances = getInstancesByDateRange(task.id, monthStart, monthEnd)

  // Create a map of dates to instances for quick lookup
  const instanceMap = new Map()
  instances.forEach((instance) => {
    instanceMap.set(instance.dueDate.toDateString(), instance)
  })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const firstDayOfMonth = getDay(monthStart)

  // Get leading empty days
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const handlePrevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDayClick = (day: Date) => {
    onSelectDate?.(day)
  }

  return (
    <div className={cn('bg-surface-primary rounded-lg border border-border p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-content-primary">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-content-secondary hover:bg-surface-tertiary rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-content-secondary hover:bg-surface-tertiary rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-content-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month starts */}
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Days of month */}
        {days.map((day) => {
          const instance = instanceMap.get(day.toDateString())
          const isCurrentMonth = isSameMonth(day, currentMonth)

          return (
            <button
              key={day.toDateString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                'aspect-square relative flex items-center justify-center rounded text-sm font-medium',
                'transition-colors duration-150',
                !isCurrentMonth && 'text-content-tertiary cursor-default',
                isCurrentMonth && [
                  instance
                    ? instance.completed
                      ? 'bg-semantic-success-light text-semantic-success hover:bg-semantic-success-light/80 dark:bg-semantic-success-light dark:text-semantic-success-dark'
                      : 'bg-semantic-info-light text-semantic-info hover:bg-semantic-info-light/80 dark:bg-semantic-info-light dark:text-semantic-info-dark'
                    : 'text-content-primary hover:bg-surface-tertiary',
                ],
              )}
              disabled={!isCurrentMonth}
            >
              <span>{day.getDate()}</span>

              {/* Instance Indicator */}
              {isCurrentMonth && instance && (
                <div className="absolute bottom-1 right-1">
                  {instance.completed ? (
                    <CheckCircle2 size={12} className="text-semantic-success" />
                  ) : (
                    <Circle size={12} className="text-semantic-info" />
                  )}
                </div>
              )}

              {/* Exception Indicator */}
              {isCurrentMonth && instance?.isException && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-orange rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-content-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-semantic-info-light" />
          <span>Upcoming occurrence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-semantic-success-light" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-semantic-warning" />
          <span>Exception (skipped/rescheduled)</span>
        </div>
      </div>
    </div>
  )
}
