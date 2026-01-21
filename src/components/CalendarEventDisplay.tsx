import React from 'react'
import { Clock, MapPin, Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { CalendarEvent } from '@/types'

interface CalendarEventDisplayProps {
  event: CalendarEvent
  compact?: boolean
  className?: string
}

export const CalendarEventDisplay: React.FC<CalendarEventDisplayProps> = ({
  event,
  compact = false,
  className,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
          event.service === 'google'
            ? 'border-semantic-info bg-semantic-info-light'
            : 'border-accent-teal bg-accent-teal-subtle',
          className
        )}
      >
        <div
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: event.color || (event.service === 'google' ? '#4285f4' : '#0078d4'),
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-content-primary">{event.title}</p>
          <p className="text-xs text-content-tertiary">
            {event.isAllDay ? (
              formatDate(event.startTime)
            ) : (
              <>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </>
            )}
          </p>
        </div>
        <span className="text-xs font-medium text-content-secondary">
          {event.service === 'google' ? 'Google' : 'Outlook'}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 bg-surface-primary p-4',
        event.service === 'google' ? 'border-l-blue-500' : 'border-l-cyan-500',
        className
      )}
    >
      <div className="space-y-2">
        <h4 className="font-semibold text-content-primary">{event.title}</h4>

        {event.description && (
          <p className="text-sm text-content-secondary">{event.description}</p>
        )}

        <div className="flex flex-col gap-2 text-sm text-content-secondary">
          {!event.isAllDay && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-content-tertiary" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
          )}

          {event.isAllDay && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-content-tertiary" />
              <span>
                {formatDate(event.startTime)}
                {event.endTime > event.startTime && ` - ${formatDate(event.endTime)}`}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-content-tertiary" />
              <span>{event.location}</span>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-content-tertiary" />
              <span>{event.attendees.length} attendee(s)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: event.color || (event.service === 'google' ? '#4285f4' : '#0078d4'),
            }}
          />
          <span className="text-xs font-medium text-content-tertiary">
            {event.service === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
          </span>
        </div>
      </div>
    </div>
  )
}
