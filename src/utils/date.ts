import {
  isToday,
  isTomorrow,
  startOfDay,
  endOfWeek,
  addDays,
  format,
  formatDistance,
  parseISO,
  isAfter,
  isBefore,
} from 'date-fns'

export function isTaskOverdue(dueDate: Date | undefined): boolean {
  if (!dueDate) return false
  return isBefore(dueDate, startOfDay(new Date()))
}

export function isTaskDueToday(dueDate: Date | undefined): boolean {
  if (!dueDate) return false
  return isToday(dueDate)
}

export function isTaskDueTomorrow(dueDate: Date | undefined): boolean {
  if (!dueDate) return false
  return isTomorrow(dueDate)
}

export function isTaskDueThisWeek(dueDate: Date | undefined): boolean {
  if (!dueDate) return false
  const now = new Date()
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  return isAfter(dueDate, now) && isBefore(dueDate, weekEnd)
}

export function formatDueDate(dueDate: Date | undefined): string {
  if (!dueDate) return 'No due date'

  if (isTaskOverdue(dueDate)) {
    return `${formatDistance(dueDate, new Date(), { addSuffix: true })}`
  }

  if (isTaskDueToday(dueDate)) {
    return 'Today'
  }

  if (isTaskDueTomorrow(dueDate)) {
    return 'Tomorrow'
  }

  if (isTaskDueThisWeek(dueDate)) {
    return format(dueDate, 'EEEE')
  }

  return format(dueDate, 'MMM d')
}

export function getDueDateGroup(dueDate: Date | undefined): string {
  if (!dueDate) return 'No date'
  if (isTaskOverdue(dueDate)) return 'Overdue'
  if (isTaskDueToday(dueDate)) return 'Today'
  if (isTaskDueTomorrow(dueDate)) return 'Tomorrow'
  if (isTaskDueThisWeek(dueDate)) return 'This week'
  return 'Later'
}

export function parseNaturalLanguageDate(input: string): Date | null {
  const now = new Date()
  const lower = input.toLowerCase().trim()

  // Today
  if (lower === 'today' || lower === 't') {
    return startOfDay(now)
  }

  // Tomorrow
  if (lower === 'tomorrow' || lower === 'tom') {
    return startOfDay(addDays(now, 1))
  }

  // Yesterday
  if (lower === 'yesterday' || lower === 'y') {
    return startOfDay(addDays(now, -1))
  }

  // Next N days
  const daysMatch = input.match(/in (\d+) days?/i)
  if (daysMatch) {
    return startOfDay(addDays(now, parseInt(daysMatch[1], 10)))
  }

  // Next Monday, Tuesday, etc.
  const dayMatch = input.match(/(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (dayMatch) {
    const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(
      dayMatch[1].toLowerCase()
    )
    const today = now.getDay()
    let daysAhead = targetDay - today
    if (daysAhead <= 0) daysAhead += 7
    return startOfDay(addDays(now, daysAhead))
  }

  // Try parsing as ISO date or common formats
  try {
    const parsed = parseISO(input)
    if (!isNaN(parsed.getTime())) {
      return startOfDay(parsed)
    }
  } catch {
    // Continue
  }

  return null
}

export function parseNaturalLanguageTime(input: string): string | null {
  // Match "at 3pm" or "at 14:00"
  const timeMatch = input.match(/at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10)
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0
    const period = timeMatch[3]?.toLowerCase()

    if (period === 'pm' && hour !== 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  return null
}
