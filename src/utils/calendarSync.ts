import type { Task, CalendarEvent } from '@/types'

/**
 * Converts a time-blocked task to a calendar event format
 * @param task - The task with time blocking information
 * @returns A CalendarEvent object ready for calendar sync
 */
export function taskToCalendarEvent(task: Task): Omit<CalendarEvent, 'externalId' | 'service' | 'syncedAt'> | null {
  if (!task.dueDate || !task.dueTime) {
    return null
  }

  const [hours, minutes] = task.dueTime.split(':').map(Number)
  const dueDate = new Date(task.dueDate)

  // Parse duration if present (in minutes)
  const duration = task.duration || 30

  // Create start time
  const startTime = new Date(dueDate)
  startTime.setHours(hours, minutes, 0, 0)

  // Create end time based on duration
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + duration)

  return {
    id: task.id,
    title: task.content,
    description: task.description || '',
    startTime,
    endTime,
    duration,
    isAllDay: false,
    taskId: task.id,
  }
}

/**
 * Converts multiple time-blocked tasks to calendar events
 * @param tasks - Array of tasks to convert
 * @returns Array of calendar events
 */
export function tasksToCalendarEvents(
  tasks: Task[],
): Array<Omit<CalendarEvent, 'externalId' | 'service' | 'syncedAt'>> {
  return tasks
    .filter((task) => task.dueTime && task.dueDate && !task.completed)
    .map((task) => taskToCalendarEvent(task))
    .filter(
      (event): event is Omit<CalendarEvent, 'externalId' | 'service' | 'syncedAt'> => event !== null,
    )
}

/**
 * Formats task information for calendar event description
 * @param task - The task to format
 * @returns Formatted description string
 */
export function formatTaskForCalendar(task: Task): string {
  const lines: string[] = []

  if (task.content) {
    lines.push(`**${task.content}**`)
  }

  if (task.description) {
    lines.push('')
    lines.push(task.description)
  }

  if (task.priority) {
    lines.push('')
    const priorityLabels: Record<string, string> = {
      p1: 'Highest',
      p2: 'High',
      p3: 'Medium',
      p4: 'Low',
    }
    lines.push(`Priority: ${priorityLabels[task.priority] || 'Normal'}`)
  }

  if (task.labels && task.labels.length > 0) {
    lines.push('')
    lines.push(`Labels: ${task.labels.join(', ')}`)
  }

  if (task.parentTaskId) {
    lines.push('')
    lines.push('This is a sub-task')
  }

  return lines.join('\n')
}

/**
 * Filters tasks that should be synced to calendar
 * - Must have a due date and time
 * - Must not be completed
 * - Must not be a sub-task
 * @param tasks - Array of tasks to filter
 * @returns Filtered array of time-blocked tasks
 */
export function filterSyncableTasks(tasks: Task[]): Task[] {
  return tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueTime &&
      !task.completed &&
      !task.parentTaskId &&
      !task.recurrence, // Don't sync recurring tasks directly
  )
}

/**
 * Generates a calendar sync report
 * @param tasks - Tasks that were synced
 * @param service - Calendar service name (e.g., 'google', 'outlook')
 * @returns Report object with sync statistics
 */
export function generateSyncReport(tasks: Task[], service: string) {
  const now = new Date()
  const futureTasksCount = tasks.filter((t) => new Date(t.dueDate!) > now).length
  const todayTasksCount = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate!)
    return (
      taskDate.toDateString() === now.toDateString() &&
      t.dueTime
    )
  }).length

  return {
    service,
    syncedAt: now,
    totalTasksSynced: tasks.length,
    futureTasks: futureTasksCount,
    todayTasks: todayTasksCount,
    success: true,
  }
}

/**
 * Creates a calendar export URL for tasks (for manual sharing)
 * @param tasks - Tasks to export
 * @param calendarName - Name for the calendar
 * @returns iCal format string
 */
export function createICalExport(tasks: Task[], calendarName = 'Todone'): string {
  const lines: string[] = []

  // iCal header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Todone//Calendar Export//EN')
  lines.push(`CALSCALE:GREGORIAN`)
  lines.push(`X-WR-CALNAME:${calendarName}`)
  lines.push('X-WR-TIMEZONE:UTC')

  // Add events
  const events = tasksToCalendarEvents(tasks)
  events.forEach((event) => {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.id}@todone.local`)
    lines.push(`DTSTAMP:${formatICalDate(new Date())}`)
    lines.push(`DTSTART:${formatICalDate(event.startTime)}`)
    lines.push(`DTEND:${formatICalDate(event.endTime)}`)
    lines.push(`SUMMARY:${escapeICalText(event.title)}`)

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`)
    }

    // Default reminder: 15 minutes before
    lines.push('BEGIN:VALARM')
    lines.push('TRIGGER:-PT15M')
    lines.push('ACTION:DISPLAY')
    lines.push(`DESCRIPTION:${escapeICalText(event.title)}`)
    lines.push('END:VALARM')

    lines.push('END:VEVENT')
  })

  // iCal footer
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Formats a date for iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Escapes text for iCal format
 */
function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

/**
 * Checks if a task has been modified since last sync
 * @param task - Task to check
 * @param lastSyncTime - Last sync timestamp
 * @returns True if task was modified after last sync
 */
export function isTaskModifiedSinceSyncTime(task: Task, lastSyncTime: Date): boolean {
  return new Date(task.updatedAt || task.createdAt) > lastSyncTime
}

/**
 * Gets tasks that need calendar sync
 * @param tasks - All tasks
 * @param lastSyncTime - Last sync timestamp
 * @returns Tasks that need syncing
 */
export function getTasksNeedingSync(tasks: Task[], lastSyncTime: Date): Task[] {
  return filterSyncableTasks(tasks).filter((task) => isTaskModifiedSinceSyncTime(task, lastSyncTime))
}
