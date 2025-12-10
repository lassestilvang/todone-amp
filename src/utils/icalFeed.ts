import type { Task, Project } from '@/types'

interface ICalEvent {
  uid: string
  dtstamp: string
  dtstart: string
  dtend: string
  summary: string
  description: string
  location?: string
  status: 'COMPLETED' | 'IN-PROCESS' | 'TENTATIVE'
  priority: number
  categories: string[]
}

/**
 * Generate iCal format from task
 * Compliant with RFC 5545
 */
function taskToICalEvent(task: Task): ICalEvent {
  const now = new Date()
  const dtstamp = formatICalDate(now)
  const dtstart = task.dueDate ? formatICalDate(task.dueDate) : dtstamp
  const dtend = task.dueDate
    ? formatICalDate(new Date(task.dueDate.getTime() + 3600000))
    : dtstart

  return {
    uid: `${task.id}@todone.app`,
    dtstamp,
    dtstart,
    dtend,
    summary: task.content,
    description: task.description || '',
    status: task.completed ? 'COMPLETED' : 'IN-PROCESS',
    priority: getPriorityCode(task.priority ?? undefined),
    categories: task.labels || [],
  }
}

/**
 * Format date for iCal format (YYYYMMDDTHHMMSSZ)
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
 * Convert priority to iCal priority code (0-9)
 * 0 = undefined
 * 1-4 = high (p1)
 * 5 = medium (p2-p3)
 * 6-9 = low (p4)
 */
function getPriorityCode(priority: string | undefined): number {
  switch (priority) {
    case 'p1':
      return 1
    case 'p2':
      return 5
    case 'p3':
      return 5
    case 'p4':
      return 7
    default:
      return 0
  }
}

/**
 * Escape special characters in iCal text
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
}

/**
 * Generate complete iCal feed from tasks
 */
export function generateICalFeed(
  tasks: Task[],
  project?: Project,
  calendarName?: string,
): string {
  const feedTitle = calendarName || project?.name || 'Todone Tasks'
  const now = formatICalDate(new Date())

  const events = tasks
    .filter((task) => !task.parentTaskId) // Only include top-level tasks
    .map((task) => {
      const event = taskToICalEvent(task)
      return formatICalEvent(event)
    })
    .join('\n')

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Todone//Todone Task Management//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${escapeICalText(feedTitle)}
X-WR-CALDESC:Task calendar for ${escapeICalText(feedTitle)}
X-WR-TIMEZONE:UTC
BEGIN:VTIMEZONE
TZID:UTC
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:UTC
END:STANDARD
END:VTIMEZONE
DTSTAMP:${now}
${events}
END:VCALENDAR`
}

/**
 * Format a single iCal event
 */
function formatICalEvent(event: ICalEvent): string {
  const categories = event.categories.length > 0
    ? `CATEGORIES:${event.categories.map(escapeICalText).join(',')}\n`
    : ''

  return `BEGIN:VEVENT
UID:${event.uid}
DTSTAMP:${event.dtstamp}
CREATED:${event.dtstamp}
LAST-MODIFIED:${event.dtstamp}
DTSTART:${event.dtstart}
DTEND:${event.dtend}
SUMMARY:${escapeICalText(event.summary)}
DESCRIPTION:${escapeICalText(event.description)}
STATUS:${event.status}
PRIORITY:${event.priority}
${categories}END:VEVENT`
}

/**
 * Download iCal feed as a file
 */
export function downloadICalFeed(
  tasks: Task[],
  filename: string = 'todone-tasks.ics',
  project?: Project,
): void {
  const icalContent = generateICalFeed(tasks, project)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Get iCal feed URL for subscription
 * Returns the feed as a data URL
 */
export function getICalFeedUrl(
  tasks: Task[],
  project?: Project,
): string {
  const icalContent = generateICalFeed(tasks, project)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  return URL.createObjectURL(blob)
}

/**
 * Copy iCal feed content to clipboard
 */
export async function copyICalFeedToClipboard(
  tasks: Task[],
  project?: Project,
): Promise<boolean> {
  try {
    const icalContent = generateICalFeed(tasks, project)
    await navigator.clipboard.writeText(icalContent)
    return true
  } catch {
    return false
  }
}
