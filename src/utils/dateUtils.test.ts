import { describe, it, expect } from 'vitest'
import {
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueTomorrow,
  isTaskDueThisWeek,
  formatDueDate,
} from './date'

describe('date utilities', () => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  describe('isTaskDueToday', () => {
    it('should return true for today', () => {
      expect(isTaskDueToday(today)).toBe(true)
    })

    it('should return false for yesterday', () => {
      expect(isTaskDueToday(yesterday)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isTaskDueToday(undefined)).toBe(false)
    })
  })

  describe('isTaskDueTomorrow', () => {
    it('should return true for tomorrow', () => {
      expect(isTaskDueTomorrow(tomorrow)).toBe(true)
    })

    it('should return false for today', () => {
      expect(isTaskDueTomorrow(today)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isTaskDueTomorrow(undefined)).toBe(false)
    })
  })

  describe('isTaskDueThisWeek', () => {
    it('should return false for undefined', () => {
      expect(isTaskDueThisWeek(undefined)).toBe(false)
    })

    it('should return false for past dates', () => {
      expect(isTaskDueThisWeek(yesterday)).toBe(false)
    })
  })

  describe('isTaskOverdue', () => {
    it('should return true for past dates', () => {
      expect(isTaskOverdue(yesterday)).toBe(true)
    })

    it('should return false for today', () => {
      expect(isTaskOverdue(today)).toBe(false)
    })

    it('should return false for future dates', () => {
      expect(isTaskOverdue(tomorrow)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isTaskOverdue(undefined)).toBe(false)
    })
  })

  describe('formatDueDate', () => {
    it('should format date as string', () => {
      const result = formatDueDate(today)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle undefined', () => {
      const result = formatDueDate(undefined)
      expect(typeof result).toBe('string')
    })
  })
})
