import React, { useMemo } from 'react';
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { Calendar, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ExternalEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  calendar: 'google' | 'outlook' | 'apple' | 'other';
  description?: string;
  location?: string;
  allDay?: boolean;
  url?: string;
  color?: string;
}

interface ExternalCalendarEventsProps {
  events: ExternalEvent[];
  dateFilter?: 'today' | 'tomorrow' | 'thisWeek' | 'all';
  maxItems?: number;
  showDescription?: boolean;
  onEventClick?: (event: ExternalEvent) => void;
  className?: string;
}

const calendarColors = {
  google: 'bg-blue-50 border-blue-200 text-blue-900',
  outlook: 'bg-cyan-50 border-cyan-200 text-cyan-900',
  apple: 'bg-surface-secondary border-border text-content-primary',
  other: 'bg-purple-50 border-purple-200 text-purple-900',
};

const calendarBadgeColors = {
  google: 'bg-blue-100 text-blue-800',
  outlook: 'bg-cyan-100 text-cyan-800',
  apple: 'bg-surface-tertiary text-content-primary',
  other: 'bg-purple-100 text-purple-800',
};

const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? parseISO(date) : date;
};

const filterEventsByDate = (
  events: ExternalEvent[],
  filter: 'today' | 'tomorrow' | 'thisWeek' | 'all'
): ExternalEvent[] => {
  if (filter === 'all') return events;

  return events.filter((event) => {
    const eventDate = parseDate(event.start);

    switch (filter) {
      case 'today':
        return isToday(eventDate);
      case 'tomorrow':
        return isTomorrow(eventDate);
      case 'thisWeek':
        return isThisWeek(eventDate);
      default:
        return true;
    }
  });
};

const ExternalEventItem: React.FC<{
  event: ExternalEvent;
  showDescription: boolean;
  onEventClick?: (event: ExternalEvent) => void;
}> = ({ event, showDescription, onEventClick }) => {
  const startDate = parseDate(event.start);
  const endDate = event.end ? parseDate(event.end) : undefined;

  const timeString = useMemo(() => {
    if (event.allDay) {
      return 'All day';
    }

    const start = format(startDate, 'HH:mm');
    if (endDate) {
      const end = format(endDate, 'HH:mm');
      return `${start} - ${end}`;
    }
    return start;
  }, [startDate, endDate, event.allDay]);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer',
        calendarColors[event.calendar]
      )}
      onClick={() => onEventClick?.(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onEventClick?.(event);
        }
      }}
      aria-label={`External event: ${event.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{event.title}</h4>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap', calendarBadgeColors[event.calendar])}>
              {event.calendar.charAt(0).toUpperCase() + event.calendar.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-content-secondary mb-1">
            <Clock className="w-3 h-3" />
            {timeString}
          </div>

          {event.location && (
            <p className="text-xs text-content-secondary mb-1 truncate">
              📍 {event.location}
            </p>
          )}

          {showDescription && event.description && (
            <p className="text-xs text-content-secondary line-clamp-2">{event.description}</p>
          )}
        </div>

        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-1.5 hover:bg-surface-tertiary rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Open in calendar app"
            aria-label={`Open ${event.title} in calendar app`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export const ExternalCalendarEvents: React.FC<ExternalCalendarEventsProps> = ({
  events,
  dateFilter = 'all',
  maxItems = 5,
  showDescription = false,
  onEventClick,
  className,
}) => {
  const filteredEvents = useMemo(
    () => filterEventsByDate(events, dateFilter),
    [events, dateFilter]
  );

  const displayedEvents = useMemo(
    () => filteredEvents.slice(0, maxItems),
    [filteredEvents, maxItems]
  );

  if (displayedEvents.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 px-1 mb-2">
        <Calendar className="w-4 h-4 text-content-secondary" />
        <h3 className="text-sm font-semibold text-content-secondary">
          Calendar Events
          {filteredEvents.length > maxItems && ` (${maxItems}/${filteredEvents.length})`}
        </h3>
      </div>

      <div className="space-y-2">
        {displayedEvents.map((event) => (
          <ExternalEventItem
            key={event.id}
            event={event}
            showDescription={showDescription}
            onEventClick={onEventClick}
          />
        ))}
      </div>

      {filteredEvents.length > maxItems && (
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium px-1 py-1">
          View all {filteredEvents.length} events
        </button>
      )}
    </div>
  );
};

export default ExternalCalendarEvents;
