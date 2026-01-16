import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useRecurrenceStore } from '@/store/recurrenceStore'
import { DatePickerInput } from './DatePickerInput'
import { Button } from './Button'
import type { Task } from '@/types'
import { logger } from '@/utils/logger'

export interface RecurrenceExceptionManagerProps {
  task: Task
  onClose?: () => void
  className?: string
}

type ExceptionReason = 'skipped' | 'rescheduled' | 'deleted'

export function RecurrenceExceptionManager({
  task,
  onClose,
  className,
}: RecurrenceExceptionManagerProps) {
  const { skipRecurrenceDate, rescheduleRecurrenceDate, getRecurrenceExceptions } =
    useRecurrenceStore()
  const [exceptions, setExceptions] = useState<Map<string, ExceptionReason>>(new Map())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>()
  const [action, setAction] = useState<'skip' | 'reschedule'>('skip')
  const [isLoading, setIsLoading] = useState(false)

  if (!task.recurrence) {
    return (
      <div className={cn('p-4 text-center text-content-tertiary', className)}>
        <p>No recurrence pattern set for this task</p>
      </div>
    )
  }

  const existingExceptions = getRecurrenceExceptions(task.id)

  const handleSkipDate = async () => {
    if (!selectedDate || !task.recurrence) return

    setIsLoading(true)
    try {
      await skipRecurrenceDate(task.id, selectedDate)
      setExceptions(new Map(exceptions.set(selectedDate.toISOString(), 'skipped')))
      setSelectedDate(undefined)
    } catch (error) {
      logger.error('Failed to skip date:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRescheduleDate = async () => {
    if (!selectedDate || !rescheduleDate || !task.recurrence) return

    setIsLoading(true)
    try {
      await rescheduleRecurrenceDate(task.id, selectedDate, rescheduleDate)
      setExceptions(new Map(exceptions.set(selectedDate.toISOString(), 'rescheduled')))
      setSelectedDate(undefined)
      setRescheduleDate(undefined)
    } catch (error) {
      logger.error('Failed to reschedule date:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-content-primary">Recurrence Exceptions</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-content-tertiary hover:text-content-secondary rounded-md hover:bg-surface-tertiary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Action Selector */}
      <div className="space-y-3 p-4 bg-surface-secondary rounded-lg">
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="action"
              value="skip"
              checked={action === 'skip'}
              onChange={(e) => setAction(e.target.value as 'skip' | 'reschedule')}
              className="w-4 h-4"
            />
            <span className="text-sm text-content-secondary">Skip this occurrence</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="action"
              value="reschedule"
              checked={action === 'reschedule'}
              onChange={(e) => setAction(e.target.value as 'skip' | 'reschedule')}
              className="w-4 h-4"
            />
            <span className="text-sm text-content-secondary">Reschedule to new date</span>
          </label>
        </div>

        {/* Date Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-content-secondary">
            {action === 'skip' ? 'Date to skip' : 'Date to modify'}
          </label>
          <DatePickerInput
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Select a date"
          />
        </div>

        {/* Reschedule Target */}
        {action === 'reschedule' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-content-secondary">
              Reschedule to:
            </label>
            <DatePickerInput
              value={rescheduleDate}
              onChange={setRescheduleDate}
              placeholder="Select new date"
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={action === 'skip' ? handleSkipDate : handleRescheduleDate}
          disabled={
            !selectedDate ||
            isLoading ||
            (action === 'reschedule' && !rescheduleDate)
          }
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          {action === 'skip' ? 'Skip Date' : 'Reschedule'}
        </Button>
      </div>

      {/* Existing Exceptions */}
      {existingExceptions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-content-secondary">
            Exceptions ({existingExceptions.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {existingExceptions.map((exc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg text-sm"
              >
                <div>
                  <p className="text-content-primary">
                    {exc.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-content-tertiary capitalize">{exc.reason}</p>
                </div>
                <button
                  onClick={() => {
                    // Handle removal
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label="Remove exception"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      <p className="text-xs text-content-tertiary">
        Skip a date to remove it from the recurrence pattern. Reschedule to move an occurrence to
        a different date.
      </p>
    </div>
  )
}
