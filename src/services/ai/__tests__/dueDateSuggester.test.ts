import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { suggestDueDate, extractAllDateMatches } from '../dueDateSuggester'

describe('dueDateSuggester', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-22T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('suggestDueDate', () => {
    describe('today/tonight', () => {
      it('detects "today" keyword', () => {
        const result = suggestDueDate({ taskContent: 'finish report today' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-22').toDateString())
        expect(result?.confidence).toBeGreaterThan(0.9)
      })

      it('detects "tonight" keyword', () => {
        const result = suggestDueDate({ taskContent: 'call mom tonight' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-22').toDateString())
      })
    })

    describe('tomorrow', () => {
      it('detects "tomorrow" keyword', () => {
        const result = suggestDueDate({ taskContent: 'meeting tomorrow at 2pm' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-23').toDateString())
        expect(result?.confidence).toBeGreaterThan(0.9)
      })
    })

    describe('urgency keywords', () => {
      it('detects "urgent" and suggests today', () => {
        const result = suggestDueDate({ taskContent: 'urgent: fix production bug' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-22').toDateString())
        expect(result?.value.urgencyScore).toBe(1.0)
        expect(result?.value.isDeadline).toBe(true)
      })

      it('detects "asap" and suggests today', () => {
        const result = suggestDueDate({ taskContent: 'need this asap' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-22').toDateString())
      })

      it('detects "immediately" and suggests today', () => {
        const result = suggestDueDate({ taskContent: 'respond immediately to client' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-22').toDateString())
      })
    })

    describe('relative dates', () => {
      it('detects "in 3 days"', () => {
        const result = suggestDueDate({ taskContent: 'review PR in 3 days' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-25').toDateString())
      })

      it('detects "in 2 weeks"', () => {
        const result = suggestDueDate({ taskContent: 'prepare presentation in 2 weeks' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-02-05').toDateString())
      })

      it('detects "in 1 month"', () => {
        const result = suggestDueDate({ taskContent: 'quarterly review in 1 month' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-02-22').toDateString())
      })
    })

    describe('this week/month', () => {
      it('detects "this week" and suggests Friday', () => {
        const result = suggestDueDate({ taskContent: 'finish this week' })
        expect(result).not.toBeNull()
        expect(result?.value.date.getDay()).toBe(5)
      })

      it('detects "next week"', () => {
        const result = suggestDueDate({ taskContent: 'start next week' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-29').toDateString())
      })

      it('detects "this month" and suggests end of month', () => {
        const result = suggestDueDate({ taskContent: 'complete this month' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-31').toDateString())
      })

      it('detects "next month"', () => {
        const result = suggestDueDate({ taskContent: 'schedule for next month' })
        expect(result).not.toBeNull()
        expect(result?.value.date.getMonth()).toBe(1)
      })
    })

    describe('weekday names', () => {
      it('detects "on monday" (next monday from Thursday)', () => {
        const result = suggestDueDate({ taskContent: 'meeting on monday' })
        expect(result).not.toBeNull()
        expect(result!.value.date.getDay()).toBe(1)
        expect(result!.value.date >= new Date('2026-01-22')).toBe(true)
      })

      it('detects "by friday"', () => {
        const result = suggestDueDate({ taskContent: 'submit by friday' })
        expect(result).not.toBeNull()
        expect(result!.value.date.getDay()).toBe(5)
      })

      it('detects "next tuesday"', () => {
        const result = suggestDueDate({ taskContent: 'call next tuesday' })
        expect(result).not.toBeNull()
        expect(result!.value.date.getDay()).toBe(2)
        expect(result!.value.date > new Date('2026-01-28')).toBe(true)
      })
    })

    describe('explicit deadlines', () => {
      it('detects "deadline friday"', () => {
        const result = suggestDueDate({ taskContent: 'report deadline friday' })
        expect(result).not.toBeNull()
        expect(result?.value.isDeadline).toBe(true)
      })

      it('detects "due by monday"', () => {
        const result = suggestDueDate({ taskContent: 'proposal due by monday' })
        expect(result).not.toBeNull()
        expect(result?.value.isDeadline).toBe(true)
      })
    })

    describe('end of period', () => {
      it('detects "end of day" / "eod"', () => {
        const result = suggestDueDate({ taskContent: 'respond by eod' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-22').toDateString())
        expect(result?.value.isDeadline).toBe(true)
      })

      it('detects "end of week" / "eow"', () => {
        const result = suggestDueDate({ taskContent: 'finish by end of week' })
        expect(result).not.toBeNull()
        expect(result?.value.isDeadline).toBe(true)
      })

      it('detects "end of month" / "eom"', () => {
        const result = suggestDueDate({ taskContent: 'invoices due eom' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-31').toDateString())
        expect(result?.value.isDeadline).toBe(true)
      })
    })

    describe('specific dates', () => {
      it('detects "jan 25"', () => {
        const result = suggestDueDate({ taskContent: 'meeting jan 25' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-01-25').toDateString())
      })

      it('detects "january 15th"', () => {
        const result = suggestDueDate({ taskContent: 'deadline january 15th' })
        expect(result).not.toBeNull()
        expect(result?.value.date.getMonth()).toBe(0)
        expect(result?.value.date.getDate()).toBe(15)
      })

      it('detects "15 feb"', () => {
        const result = suggestDueDate({ taskContent: 'submit 15 feb' })
        expect(result).not.toBeNull()
        expect(result?.value.date.getMonth()).toBe(1)
        expect(result?.value.date.getDate()).toBe(15)
      })

      it('detects ISO date "2026-02-14"', () => {
        const result = suggestDueDate({ taskContent: 'valentines 2026-02-14' })
        expect(result).not.toBeNull()
        expect(result?.value.date.toDateString()).toBe(new Date('2026-02-14').toDateString())
        expect(result?.confidence).toBeGreaterThan(0.95)
      })

      it('detects US date "1/25"', () => {
        const result = suggestDueDate({ taskContent: 'due 1/25' })
        expect(result).not.toBeNull()
        expect(result?.value.date.getMonth()).toBe(0)
        expect(result?.value.date.getDate()).toBe(25)
      })
    })

    describe('weekend', () => {
      it('detects "this weekend"', () => {
        const result = suggestDueDate({ taskContent: 'clean garage this weekend' })
        expect(result).not.toBeNull()
        expect(result?.value.date.getDay()).toBe(6)
      })

      it('detects "next weekend"', () => {
        const result = suggestDueDate({ taskContent: 'trip next weekend' })
        expect(result).not.toBeNull()
        expect(result!.value.date.getDay()).toBe(6)
        expect(result!.value.date > new Date('2026-01-25')).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('returns null for text without date references', () => {
        const result = suggestDueDate({ taskContent: 'buy groceries' })
        expect(result).toBeNull()
      })

      it('returns null for empty text', () => {
        const result = suggestDueDate({ taskContent: '' })
        expect(result).toBeNull()
      })

      it('returns null for whitespace only', () => {
        const result = suggestDueDate({ taskContent: '   ' })
        expect(result).toBeNull()
      })

      it('handles text with multiple date references (picks highest confidence)', () => {
        const result = suggestDueDate({
          taskContent: 'deadline 2026-02-14, but start tomorrow',
        })
        expect(result).not.toBeNull()
        expect(result?.confidence).toBeGreaterThan(0.9)
      })
    })

    describe('reasoning', () => {
      it('provides human-readable reasoning', () => {
        const result = suggestDueDate({ taskContent: 'meeting tomorrow' })
        expect(result?.reasoning).toContain('tomorrow')
      })
    })
  })

  describe('extractAllDateMatches', () => {
    it('extracts multiple date references from text', () => {
      const matches = extractAllDateMatches('start tomorrow, finish by friday, deadline jan 30')
      expect(matches.length).toBeGreaterThanOrEqual(3)
    })

    it('returns empty array for text without dates', () => {
      const matches = extractAllDateMatches('just a regular task')
      expect(matches).toHaveLength(0)
    })

    it('sorts matches by confidence', () => {
      const matches = extractAllDateMatches('meeting 2026-02-14 or maybe tomorrow')
      expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence)
    })
  })
})
