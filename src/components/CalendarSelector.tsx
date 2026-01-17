import React, { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { CalendarIntegration } from '@/types'

interface CalendarSelectorProps {
  integration: CalendarIntegration
  onCalendarsChange: (calendars: string[]) => void
  className?: string
}

// Mock calendars for demo purposes
const getMockCalendars = (service: 'google' | 'outlook') => [
  {
    id: `${service}-primary`,
    name: 'Primary Calendar',
    color: service === 'google' ? '#4285f4' : '#0078d4',
  },
  {
    id: `${service}-work`,
    name: 'Work',
    color: '#34a853',
  },
  {
    id: `${service}-personal`,
    name: 'Personal',
    color: '#ea4335',
  },
  {
    id: `${service}-holidays`,
    name: 'Holidays',
    color: '#fbbc04',
  },
]

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  integration,
  onCalendarsChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const mockCalendars = getMockCalendars(integration.service)

  const handleToggleCalendar = (calendarId: string) => {
    const updated = integration.selectedCalendars.includes(calendarId)
      ? integration.selectedCalendars.filter((id) => id !== calendarId)
      : [...integration.selectedCalendars, calendarId]

    onCalendarsChange(updated)
  }

  const selectedCount = integration.selectedCalendars.length
  const totalCount = mockCalendars.length

  return (
    <div className={cn('relative inline-block w-full', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-border bg-surface-primary px-4 py-2 text-left text-sm hover:bg-surface-tertiary"
      >
        <span className="font-medium text-content-primary">
          {selectedCount === 0
            ? 'Select calendars'
            : selectedCount === totalCount
              ? 'All calendars'
              : `${selectedCount} calendar(s)`}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-full rounded-lg border border-border bg-surface-primary shadow-lg">
          <div className="max-h-64 overflow-y-auto p-2">
            {mockCalendars.map((calendar) => (
              <button
                key={calendar.id}
                onClick={() => handleToggleCalendar(calendar.id)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-tertiary"
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded border',
                    integration.selectedCalendars.includes(calendar.id)
                      ? 'border-brand-600 bg-brand-600 dark:border-brand-500 dark:bg-brand-500'
                      : 'border-border bg-surface-primary'
                  )}
                >
                  {integration.selectedCalendars.includes(calendar.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>

                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: calendar.color }}
                />

                <span className="flex-1 text-sm font-medium text-content-primary">
                  {calendar.name}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-border bg-surface-secondary p-2">
            <button
              onClick={() => {
                if (selectedCount === totalCount) {
                  onCalendarsChange([])
                } else {
                  onCalendarsChange(mockCalendars.map((c) => c.id))
                }
              }}
              className="w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-surface-tertiary"
            >
              {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
