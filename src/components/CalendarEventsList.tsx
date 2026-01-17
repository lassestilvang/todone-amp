import React from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import { CalendarEventDisplay } from '@/components/CalendarEventDisplay'
import { cn } from '@/utils/cn'
import type { CalendarEvent } from '@/types'

interface CalendarEventsListProps {
  events: CalendarEvent[]
  loading?: boolean
  error?: string | null
  compact?: boolean
  className?: string
}

export const CalendarEventsList: React.FC<CalendarEventsListProps> = ({
  events,
  loading = false,
  error = null,
  compact = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('rounded-lg border border-border p-4', className)}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-blue-600" />
          <p className="text-sm text-content-secondary">Loading calendar events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30', className)}>
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-semantic-error" />
        <div>
          <p className="text-sm font-medium text-red-900 dark:text-red-100">Failed to load events</p>
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed border-border p-6 text-center', className)}>
        <Calendar className="mx-auto h-8 w-8 text-content-tertiary" />
        <p className="mt-2 text-sm text-content-secondary">No calendar events to display</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {events.map((event) => (
        <CalendarEventDisplay
          key={event.id}
          event={event}
          compact={compact}
        />
      ))}
    </div>
  )
}
