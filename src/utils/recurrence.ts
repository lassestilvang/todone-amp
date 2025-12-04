import { addDays, addYears, startOfDay, isSameDay, isAfter, isBefore, format } from 'date-fns'
import type { RecurrencePattern } from '@/types'

/**
 * Validate a recurrence pattern
 */
export function validateRecurrencePattern(pattern: RecurrencePattern): boolean {
  if (!pattern.frequency || !pattern.interval) return false
  if (pattern.interval < 1) return false

  switch (pattern.frequency) {
    case 'daily':
    case 'weekly':
    case 'biweekly':
      return true
    case 'monthly':
      return pattern.dayOfMonth !== undefined && pattern.dayOfMonth >= 1 && pattern.dayOfMonth <= 31
    case 'yearly':
      return true
    default:
      return false
  }
}

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
export function getNextOccurrence(
  currentDate: Date,
  pattern: RecurrencePattern
): Date | null {
  if (!validateRecurrencePattern(pattern)) return null

  const startDate = startOfDay(pattern.startDate)
  let nextDate = new Date(currentDate)

  // Move to next day first
  nextDate = addDays(nextDate, 1)
  nextDate = startOfDay(nextDate)

  // Check end date
  if (pattern.endDate && isAfter(nextDate, pattern.endDate)) {
    return null
  }

  while (isAfter(nextDate, startDate) && (!pattern.endDate || isBefore(nextDate, pattern.endDate))) {
    // Check if date is in exceptions
    if (pattern.exceptions.some((exc) => isSameDay(exc, nextDate))) {
      nextDate = addDays(nextDate, 1)
      continue
    }

    // Check frequency pattern
    if (matchesPattern(startDate, nextDate, pattern)) {
      return nextDate
    }

    nextDate = addDays(nextDate, 1)

    // Safety check: don't loop more than 4 years
    if (isAfter(nextDate, addYears(new Date(), 4))) {
      return null
    }
  }

  return null
}

/**
 * Check if a date matches the recurrence pattern
 */
function matchesPattern(startDate: Date, currentDate: Date, pattern: RecurrencePattern): boolean {
  const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  switch (pattern.frequency) {
    case 'daily':
      return daysDiff % pattern.interval === 0

    case 'weekly': {
      const weeks = Math.floor(daysDiff / 7)
      const dayOfWeek = currentDate.getDay()
      const startDayOfWeek = startDate.getDay()

      if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
        return weeks % pattern.interval === 0 && dayOfWeek === startDayOfWeek
      }

      const isRightWeek = weeks % pattern.interval === 0
      return isRightWeek && pattern.daysOfWeek.includes(dayOfWeek)
    }

    case 'biweekly': {
      const days = daysDiff
      const weeks = Math.floor(days / 7)
      return weeks % 2 === 0 && currentDate.getDay() === startDate.getDay()
    }

    case 'monthly': {
      const monthsDiff =
        (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
        (currentDate.getMonth() - startDate.getMonth())

      if (monthsDiff % pattern.interval !== 0) return false

      if (pattern.dayOfMonth) {
        return currentDate.getDate() === pattern.dayOfMonth
      }

      return currentDate.getDate() === startDate.getDate()
    }

    case 'yearly': {
      const yearsDiff = currentDate.getFullYear() - startDate.getFullYear()
      if (yearsDiff % pattern.interval !== 0) return false

      return (
        currentDate.getMonth() === startDate.getMonth() &&
        currentDate.getDate() === startDate.getDate()
      )
    }

    default:
      return false
  }
}

/**
 * Generate recurrence instances for a date range
 */
export function generateRecurrenceInstances(
  baseDate: Date,
  pattern: RecurrencePattern,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const instances: Date[] = []

  if (!validateRecurrencePattern(pattern)) return instances

  let current = new Date(baseDate)

  // Generate instances until end of range
  while (isBefore(current, rangeEnd)) {
    const next = getNextOccurrence(current, pattern)
    if (!next || isSameDay(next, current)) break

    if (isAfter(next, rangeStart) && isBefore(next, rangeEnd)) {
      instances.push(new Date(next))
    }

    current = new Date(next)
  }

  return instances
}

/**
 * Format recurrence pattern as human-readable string
 */
export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  switch (pattern.frequency) {
    case 'daily':
      return pattern.interval === 1 ? 'Daily' : `Every ${pattern.interval} days`

    case 'weekly': {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
        return pattern.interval === 1
          ? `Weekly (${dayNames[new Date(pattern.startDate).getDay()]})`
          : `Every ${pattern.interval} weeks`
      }
      const days = pattern.daysOfWeek.map((d) => dayNames[d]).join(', ')
      return `Weekly (${days})`
    }

    case 'biweekly':
      return 'Every 2 weeks'

    case 'monthly':
      return pattern.dayOfMonth
        ? `Monthly (day ${pattern.dayOfMonth})`
        : `Monthly (${format(new Date(pattern.startDate), 'do')})`

    case 'yearly':
      return `Yearly (${format(new Date(pattern.startDate), 'MMMM d')})`

    default:
      return 'No recurrence'
  }
}

/**
 * Handle editing a single instance vs all future instances
 * Note: Mode is determined by user choice in UI
 */
export function getInstanceEditMode(): 'single' | 'future' | 'all' {
  // Default to 'single' mode; UI will override based on user selection
  return 'single'
}

/**
 * Generate next N occurrences starting from a date
 */
export function getNextOccurrences(
  currentDate: Date,
  pattern: RecurrencePattern,
  count: number = 5
): Date[] {
  const occurrences: Date[] = []
  let current = new Date(currentDate)

  for (let i = 0; i < count; i++) {
    const next = getNextOccurrence(current, pattern)
    if (!next) break

    occurrences.push(new Date(next))
    current = new Date(next)
  }

  return occurrences
}

/**
 * Check if a date is an exception (skipped or rescheduled)
 */
export function isDateException(date: Date, exceptions: Date[]): boolean {
  return exceptions.some((exc) => isSameDay(exc, date))
}

/**
 * Parse recurrence frequency from natural language
 */
export function parseRecurrenceFromText(text: string): RecurrencePattern | null {
  const lowerText = text.toLowerCase().trim()

  // Daily patterns
  if (lowerText.includes('daily') || lowerText.includes('every day')) {
    return {
      frequency: 'daily',
      interval: 1,
      startDate: new Date(),
      exceptions: [],
    }
  }

  // Weekly patterns
  if (lowerText.includes('weekly') || lowerText.includes('every week')) {
    return {
      frequency: 'weekly',
      interval: 1,
      startDate: new Date(),
      exceptions: [],
    }
  }

  // Biweekly patterns
  if (lowerText.includes('biweekly') || lowerText.includes('every 2 weeks')) {
    return {
      frequency: 'biweekly',
      interval: 2,
      startDate: new Date(),
      exceptions: [],
    }
  }

  // Monthly patterns
  if (lowerText.includes('monthly') || lowerText.includes('every month')) {
    return {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: new Date().getDate(),
      startDate: new Date(),
      exceptions: [],
    }
  }

  // Yearly patterns
  if (lowerText.includes('yearly') || lowerText.includes('every year')) {
    return {
      frequency: 'yearly',
      interval: 1,
      startDate: new Date(),
      exceptions: [],
    }
  }

  return null
}
