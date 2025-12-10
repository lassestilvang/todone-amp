import { describe, it, expect } from 'vitest'
import {
  validateRecurrencePattern,
  getNextOccurrence,
  generateRecurrenceInstances,
  formatRecurrencePattern,
  getInstanceEditMode,
} from './recurrence'
import type { RecurrencePattern } from '@/types'

// Helper to create a test pattern
function createPattern(overrides?: Partial<RecurrencePattern>): RecurrencePattern {
  return {
    frequency: 'daily',
    interval: 1,
    startDate: new Date('2025-01-15'),
    endDate: undefined,
    daysOfWeek: [],
    dayOfMonth: undefined,
    exceptions: [],
    ...overrides,
  }
}

describe('Recurrence Utilities', () => {
  describe('validateRecurrencePattern', () => {
    it('should return true for valid daily pattern', () => {
      const pattern = createPattern({ frequency: 'daily', interval: 1 })
      expect(validateRecurrencePattern(pattern)).toBe(true)
    })

    it('should return true for valid weekly pattern', () => {
      const pattern = createPattern({ frequency: 'weekly', interval: 1 })
      expect(validateRecurrencePattern(pattern)).toBe(true)
    })

    it('should return true for valid biweekly pattern', () => {
      const pattern = createPattern({ frequency: 'biweekly', interval: 2 })
      expect(validateRecurrencePattern(pattern)).toBe(true)
    })

    it('should return true for valid monthly pattern with dayOfMonth', () => {
      const pattern = createPattern({
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      })
      expect(validateRecurrencePattern(pattern)).toBe(true)
    })

    it('should return false for monthly pattern without dayOfMonth', () => {
      const pattern = createPattern({
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: undefined,
      })
      expect(validateRecurrencePattern(pattern)).toBe(false)
    })

    it('should return false for monthly pattern with invalid dayOfMonth', () => {
      const pattern = createPattern({
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 32,
      })
      expect(validateRecurrencePattern(pattern)).toBe(false)
    })

    it('should return true for valid yearly pattern', () => {
      const pattern = createPattern({ frequency: 'yearly', interval: 1 })
      expect(validateRecurrencePattern(pattern)).toBe(true)
    })

    it('should return false for invalid interval', () => {
      const pattern = createPattern({ interval: 0 })
      expect(validateRecurrencePattern(pattern)).toBe(false)
    })

    it('should return false for negative interval', () => {
      const pattern = createPattern({ interval: -1 })
      expect(validateRecurrencePattern(pattern)).toBe(false)
    })

    it('should return false for missing frequency', () => {
      const pattern = createPattern()
      pattern.frequency = '' as typeof pattern.frequency
      expect(validateRecurrencePattern(pattern)).toBe(false)
    })
  })

  describe('getNextOccurrence', () => {
    it('should return next day for daily recurrence', () => {
      const pattern = createPattern({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2025-01-15'),
      })
      const current = new Date('2025-01-15')
      const next = getNextOccurrence(current, pattern)

      expect(next).toBeTruthy()
      expect(next?.getDate()).toBe(16)
      expect(next?.getMonth()).toBe(0) // January
      expect(next?.getFullYear()).toBe(2025)
    })

    it('should return next occurrence every N days', () => {
      const pattern = createPattern({
        frequency: 'daily',
        interval: 2,
        startDate: new Date('2025-01-15'),
      })
      const current = new Date('2025-01-15')
      const next = getNextOccurrence(current, pattern)

      expect(next).toBeTruthy()
      expect(next?.getDate()).toBe(17)
    })

    it('should return null for invalid pattern', () => {
      const pattern = createPattern({ interval: 0 })
      const current = new Date('2025-01-15')
      const next = getNextOccurrence(current, pattern)

      expect(next).toBeNull()
    })

    it('should return null if past end date', () => {
      const pattern = createPattern({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
      })
      const current = new Date('2025-01-25')
      const next = getNextOccurrence(current, pattern)

      expect(next).toBeNull()
    })

    it('should skip exception dates', () => {
      const pattern = createPattern({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2025-01-15'),
        exceptions: [new Date('2025-01-16')],
      })
      const current = new Date('2025-01-15')
      const next = getNextOccurrence(current, pattern)

      // Should skip 2025-01-16 and return 2025-01-17
      expect(next).toBeTruthy()
      expect(next?.getDate()).toBe(17)
    })

    it('should handle weekly recurrence', () => {
      const pattern = createPattern({
        frequency: 'weekly',
        interval: 1,
        startDate: new Date('2025-01-15'), // Wednesday
        daysOfWeek: [3], // Wednesday
      })
      const current = new Date('2025-01-15')
      const next = getNextOccurrence(current, pattern)

      expect(next).toBeTruthy()
      // Should be next Wednesday (Jan 22)
      expect(next?.getDate()).toBe(22)
    })
  })

  describe('generateRecurrenceInstances', () => {
    it('should generate multiple instances', () => {
      const pattern = createPattern({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2025-01-15'),
      })
      const rangeStart = new Date('2025-01-15')
      const rangeEnd = new Date('2025-01-20')

      const instances = generateRecurrenceInstances(new Date('2025-01-15'), pattern, rangeStart, rangeEnd)

      expect(instances.length).toBeGreaterThan(0)
      expect(instances.length).toBeLessThanOrEqual(5)
    })

    it('should return empty array for invalid pattern', () => {
      const pattern = createPattern({ interval: 0 })
      const instances = generateRecurrenceInstances(new Date('2025-01-15'), pattern, new Date('2025-01-15'), new Date('2025-01-20'))

      expect(instances).toEqual([])
    })

    it('should respect range boundaries', () => {
      const pattern = createPattern({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2025-01-15'),
      })
      const rangeStart = new Date('2025-01-16')
      const rangeEnd = new Date('2025-01-18')

      const instances = generateRecurrenceInstances(new Date('2025-01-15'), pattern, rangeStart, rangeEnd)

      // Should only include 2025-01-17 (16th is start boundary, 18th is end boundary)
      expect(instances.length).toBeGreaterThan(0)
      expect(instances.every((d) => d.getTime() > rangeStart.getTime())).toBe(true)
      expect(instances.every((d) => d.getTime() < rangeEnd.getTime())).toBe(true)
    })

    it('should exclude exception dates from generated instances', () => {
      const exceptions = [new Date('2025-01-17')]
      const pattern = createPattern({
        frequency: 'daily',
        interval: 1,
        startDate: new Date('2025-01-15'),
        exceptions,
      })
      const rangeStart = new Date('2025-01-15')
      const rangeEnd = new Date('2025-01-20')

      const instances = generateRecurrenceInstances(new Date('2025-01-15'), pattern, rangeStart, rangeEnd)

      const hasException = instances.some((inst) => inst.getDate() === 17)
      expect(hasException).toBe(false)
    })
  })

  describe('formatRecurrencePattern', () => {
    it('should format daily pattern', () => {
      const pattern = createPattern({ frequency: 'daily', interval: 1 })
      expect(formatRecurrencePattern(pattern)).toBe('Daily')
    })

    it('should format every N days pattern', () => {
      const pattern = createPattern({ frequency: 'daily', interval: 3 })
      expect(formatRecurrencePattern(pattern)).toBe('Every 3 days')
    })

    it('should format weekly pattern', () => {
      const pattern = createPattern({
        frequency: 'weekly',
        interval: 1,
        startDate: new Date('2025-01-15'), // Wednesday
      })
      const result = formatRecurrencePattern(pattern)
      expect(result).toContain('Weekly')
    })

    it('should format biweekly pattern', () => {
      const pattern = createPattern({ frequency: 'biweekly' })
      expect(formatRecurrencePattern(pattern)).toBe('Every 2 weeks')
    })

    it('should format monthly pattern with dayOfMonth', () => {
      const pattern = createPattern({
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      })
      const result = formatRecurrencePattern(pattern)
      expect(result).toContain('Monthly')
      expect(result).toContain('15')
    })

    it('should format yearly pattern', () => {
      const pattern = createPattern({
        frequency: 'yearly',
        interval: 1,
        startDate: new Date('2025-01-15'),
      })
      const result = formatRecurrencePattern(pattern)
      expect(result).toContain('Yearly')
      expect(result).toContain('January')
    })

    it('should format weekly pattern with multiple days', () => {
      const pattern = createPattern({
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      })
      const result = formatRecurrencePattern(pattern)
      expect(result).toContain('Weekly')
      expect(result).toContain('Mon')
      expect(result).toContain('Wed')
      expect(result).toContain('Fri')
    })
  })

  describe('getInstanceEditMode', () => {
    it('should return "single" by default', () => {
      const mode = getInstanceEditMode()
      expect(mode).toBe('single')
    })

    it('should return one of valid modes', () => {
      const mode = getInstanceEditMode()
      expect(['single', 'future', 'all']).toContain(mode)
    })
  })
})
