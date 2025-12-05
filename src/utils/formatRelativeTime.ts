import { formatDistance } from 'date-fns'

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date): string {
  try {
    return formatDistance(date, new Date(), { addSuffix: true })
  } catch {
    return 'Recently'
  }
}
