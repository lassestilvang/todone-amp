import { describe, it, expect, beforeEach, afterEach, setSystemTime } from 'bun:test'
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueTomorrow,
  isTaskDueThisWeek,
  formatDueDate,
  getDueDateGroup,
  parseNaturalLanguageDate,
  parseNaturalLanguageTime,
} from './date'
import { startOfDay, addDays } from 'date-fns'

describe('Date Utilities', () => {
  let now: Date

  beforeEach(() => {
    // Mock current date to 2025-01-15 (Wednesday)
    now = new Date('2025-01-15T10:00:00Z')
    setSystemTime(now)
  })

  afterEach(() => {
    setSystemTime()
  })

  describe('isTaskOverdue', () => {
    it('should return false for undefined date', () => {
      expect(isTaskOverdue(undefined)).toBe(false)
    })

    it('should return true for past date', () => {
      const pastDate = new Date('2025-01-10T10:00:00Z')
      expect(isTaskOverdue(pastDate)).toBe(true)
    })

    it('should return false for today', () => {
      const today = new Date('2025-01-15T10:00:00Z')
      expect(isTaskOverdue(today)).toBe(false)
    })

    it('should return false for future date', () => {
      const futureDate = new Date('2025-01-20T10:00:00Z')
      expect(isTaskOverdue(futureDate)).toBe(false)
    })
  })

  describe('isTaskDueToday', () => {
    it('should return false for undefined date', () => {
      expect(isTaskDueToday(undefined)).toBe(false)
    })

    it('should return true for today', () => {
      const today = new Date('2025-01-15T10:00:00Z')
      expect(isTaskDueToday(today)).toBe(true)
    })

    it('should return false for other dates', () => {
      expect(isTaskDueToday(new Date('2025-01-14T10:00:00Z'))).toBe(false)
      expect(isTaskDueToday(new Date('2025-01-16T10:00:00Z'))).toBe(false)
    })
  })

  describe('isTaskDueTomorrow', () => {
    it('should return false for undefined date', () => {
      expect(isTaskDueTomorrow(undefined)).toBe(false)
    })

    it('should return true for tomorrow', () => {
      const tomorrow = new Date('2025-01-16T10:00:00Z')
      expect(isTaskDueTomorrow(tomorrow)).toBe(true)
    })

    it('should return false for other dates', () => {
      expect(isTaskDueTomorrow(new Date('2025-01-15T10:00:00Z'))).toBe(false)
      expect(isTaskDueTomorrow(new Date('2025-01-17T10:00:00Z'))).toBe(false)
    })
  })

  describe('isTaskDueThisWeek', () => {
    it('should return false for undefined date', () => {
      expect(isTaskDueThisWeek(undefined)).toBe(false)
    })

    it('should return true for days this week (Mon-Sun)', () => {
      // 2025-01-15 is Wednesday, week ends on Sunday 2025-01-19
      expect(isTaskDueThisWeek(new Date('2025-01-16T10:00:00Z'))).toBe(true) // Thursday
      expect(isTaskDueThisWeek(new Date('2025-01-17T10:00:00Z'))).toBe(true) // Friday
      expect(isTaskDueThisWeek(new Date('2025-01-18T10:00:00Z'))).toBe(true) // Saturday
      expect(isTaskDueThisWeek(new Date('2025-01-19T10:00:00Z'))).toBe(true) // Sunday
    })

    it('should return false for next week', () => {
      expect(isTaskDueThisWeek(new Date('2025-01-20T10:00:00Z'))).toBe(false)
    })

    it('should return false for today', () => {
      expect(isTaskDueThisWeek(new Date('2025-01-15T10:00:00Z'))).toBe(false)
    })
  })

  describe('formatDueDate', () => {
    it('should return "No due date" for undefined', () => {
      expect(formatDueDate(undefined)).toBe('No due date')
    })

    it('should format overdue dates with distance', () => {
      const pastDate = new Date('2025-01-10T10:00:00Z')
      const result = formatDueDate(pastDate)
      expect(result).toContain('ago')
    })

    it('should format today as "Today"', () => {
      const today = new Date('2025-01-15T10:00:00Z')
      expect(formatDueDate(today)).toBe('Today')
    })

    it('should format tomorrow as "Tomorrow"', () => {
      const tomorrow = new Date('2025-01-16T10:00:00Z')
      expect(formatDueDate(tomorrow)).toBe('Tomorrow')
    })

    it('should format this week as day name', () => {
      // Start the test from a different day so we test "this week" correctly
      const friday = new Date('2025-01-17T10:00:00Z')
      const result = formatDueDate(friday)
      expect(result).toBe('Friday')
    })

    it('should format later dates as "MMM d"', () => {
      const futureDate = new Date('2025-02-10T10:00:00Z')
      const result = formatDueDate(futureDate)
      expect(result).toBe('Feb 10')
    })
  })

  describe('getDueDateGroup', () => {
    it('should return "No date" for undefined', () => {
      expect(getDueDateGroup(undefined)).toBe('No date')
    })

    it('should return "Overdue" for past dates', () => {
      const pastDate = new Date('2025-01-10T10:00:00Z')
      expect(getDueDateGroup(pastDate)).toBe('Overdue')
    })

    it('should return "Today" for today', () => {
      const today = new Date('2025-01-15T10:00:00Z')
      expect(getDueDateGroup(today)).toBe('Today')
    })

    it('should return "Tomorrow" for tomorrow', () => {
      const tomorrow = new Date('2025-01-16T10:00:00Z')
      expect(getDueDateGroup(tomorrow)).toBe('Tomorrow')
    })

    it('should return "This week" for this week dates', () => {
      const friday = new Date('2025-01-17T10:00:00Z')
      expect(getDueDateGroup(friday)).toBe('This week')
    })

    it('should return "Later" for future dates beyond this week', () => {
      const futureDate = new Date('2025-02-10T10:00:00Z')
      expect(getDueDateGroup(futureDate)).toBe('Later')
    })
  })

  describe('parseNaturalLanguageDate', () => {
    it('should parse "today"', () => {
      const result = parseNaturalLanguageDate('today')
      expect(result).toEqual(startOfDay(now))
    })

    it('should parse "t" as today', () => {
      const result = parseNaturalLanguageDate('t')
      expect(result).toEqual(startOfDay(now))
    })

    it('should parse "tomorrow"', () => {
      const result = parseNaturalLanguageDate('tomorrow')
      expect(result).toEqual(startOfDay(addDays(now, 1)))
    })

    it('should parse "tom" as tomorrow', () => {
      const result = parseNaturalLanguageDate('tom')
      expect(result).toEqual(startOfDay(addDays(now, 1)))
    })

    it('should parse "yesterday"', () => {
      const result = parseNaturalLanguageDate('yesterday')
      expect(result).toEqual(startOfDay(addDays(now, -1)))
    })

    it('should parse "y" as yesterday', () => {
      const result = parseNaturalLanguageDate('y')
      expect(result).toEqual(startOfDay(addDays(now, -1)))
    })

    it('should parse "in X days"', () => {
      const result = parseNaturalLanguageDate('in 3 days')
      expect(result).toEqual(startOfDay(addDays(now, 3)))
    })

    it('should parse day names (Monday, Tuesday, etc.)', () => {
      // Current date is Wednesday (2025-01-15)
      // Next Monday would be 2025-01-20 (5 days ahead)
      const result = parseNaturalLanguageDate('monday')
      expect(result?.getDate()).toBe(20)
    })

    it('should parse "next Monday" format', () => {
      const result = parseNaturalLanguageDate('next monday')
      expect(result?.getDate()).toBe(20)
    })

    it('should return null for invalid input', () => {
      const result = parseNaturalLanguageDate('invalid date string')
      expect(result).toBeNull()
    })
  })

  describe('parseNaturalLanguageTime', () => {
    it('should parse "at 3pm"', () => {
      const result = parseNaturalLanguageTime('at 3pm')
      expect(result).toBe('15:00')
    })

    it('should parse "at 3:30pm"', () => {
      const result = parseNaturalLanguageTime('at 3:30pm')
      expect(result).toBe('15:30')
    })

    it('should parse "at 9am"', () => {
      const result = parseNaturalLanguageTime('at 9am')
      expect(result).toBe('09:00')
    })

    it('should parse "at 14:00" (24h format)', () => {
      const result = parseNaturalLanguageTime('at 14:00')
      expect(result).toBe('14:00')
    })

    it('should handle 12pm correctly', () => {
      const result = parseNaturalLanguageTime('at 12pm')
      expect(result).toBe('12:00')
    })

    it('should handle 12am correctly', () => {
      const result = parseNaturalLanguageTime('at 12am')
      expect(result).toBe('00:00')
    })

    it('should return null for invalid time format', () => {
      const result = parseNaturalLanguageTime('no time here')
      expect(result).toBeNull()
    })
  })
})
