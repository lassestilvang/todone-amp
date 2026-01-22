import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { extractUrgency, removeUrgencyFromText } from './urgencyExtractor'

describe('urgencyExtractor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-22T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('extractUrgency', () => {
    it('handles empty input', () => {
      const result = extractUrgency('')
      expect(result.hasUrgency).toBe(false)
    })

    describe('high urgency patterns', () => {
      it('detects "asap"', () => {
        const result = extractUrgency('Call John asap')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p1')
        expect(result.deadline).toBeDefined()
        expect(result.confidence).toBeGreaterThan(0.8)
      })

      it('detects "as soon as possible"', () => {
        const result = extractUrgency('Complete report as soon as possible')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p1')
      })

      it('detects "urgent"', () => {
        const result = extractUrgency('Urgent: Fix the bug')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p1')
      })

      it('detects "immediately"', () => {
        const result = extractUrgency('Respond immediately')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p1')
      })

      it('detects "right away"', () => {
        const result = extractUrgency('Call the client right away')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p1')
      })
    })

    describe('deadline patterns', () => {
      it('detects "by end of day"', () => {
        const result = extractUrgency('Submit report by end of day')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline).toBeDefined()
        expect(result.deadline?.getHours()).toBe(17)
        expect(result.deadlineType).toBe('hard')
      })

      it('detects "by eod"', () => {
        const result = extractUrgency('Complete task by eod')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline).toBeDefined()
      })

      it('detects "by noon"', () => {
        const result = extractUrgency('Send email by noon')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getHours()).toBe(12)
      })

      it('detects "before lunch"', () => {
        const result = extractUrgency('Finish draft before lunch')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getHours()).toBe(12)
      })

      it('detects "by tomorrow"', () => {
        const result = extractUrgency('Review PR by tomorrow')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline).toBeDefined()
        expect(result.deadline?.getDate()).toBe(23) // January 23
      })

      it('detects "by end of week"', () => {
        const result = extractUrgency('Complete project by end of week')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline).toBeDefined()
        expect(result.deadlineType).toBe('hard')
      })

      it('detects "by eow"', () => {
        const result = extractUrgency('Ship feature by eow')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline).toBeDefined()
      })

      it('detects "by end of month"', () => {
        const result = extractUrgency('Finish audit by end of month')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getDate()).toBe(31) // January 31
      })

      it('detects "by tomorrow morning"', () => {
        const result = extractUrgency('Prepare slides by tomorrow morning')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getDate()).toBe(23)
        expect(result.deadline?.getHours()).toBe(9)
      })

      it('detects "first thing tomorrow"', () => {
        const result = extractUrgency('Review code first thing tomorrow')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getDate()).toBe(23)
      })

      it('detects "by tonight"', () => {
        const result = extractUrgency('Send document by tonight')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getHours()).toBe(21)
      })
    })

    describe('weekday deadline patterns', () => {
      it('detects "by Monday"', () => {
        const result = extractUrgency('Submit report by Monday')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline).toBeDefined()
        expect(result.deadline?.getDay()).toBe(1) // Monday
      })

      it('detects "before Friday"', () => {
        const result = extractUrgency('Complete task before Friday')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getDay()).toBe(5) // Friday
      })

      it('detects "due on Wednesday"', () => {
        const result = extractUrgency('Report due on Wednesday')
        expect(result.hasUrgency).toBe(true)
        expect(result.deadline?.getDay()).toBe(3) // Wednesday
      })
    })

    describe('medium urgency patterns', () => {
      it('detects "important"', () => {
        const result = extractUrgency('Important: Review the contract')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p2')
      })

      it('detects "high priority"', () => {
        const result = extractUrgency('High priority task')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p2')
      })

      it('detects "needs attention"', () => {
        const result = extractUrgency('This needs attention')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p2')
      })
    })

    describe('low urgency patterns', () => {
      it('detects "when you get a chance"', () => {
        const result = extractUrgency('Review docs when you get a chance')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p4')
      })

      it('detects "no rush"', () => {
        const result = extractUrgency('Update readme, no rush')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p4')
      })

      it('detects "whenever"', () => {
        const result = extractUrgency('Clean up code whenever')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p4')
      })

      it('detects "someday"', () => {
        const result = extractUrgency('Learn Rust someday')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p4')
      })

      it('detects "low priority"', () => {
        const result = extractUrgency('Low priority cleanup')
        expect(result.hasUrgency).toBe(true)
        expect(result.implicitPriority).toBe('p4')
      })
    })

    it('returns spans for matched phrases', () => {
      const result = extractUrgency('Submit report by eod')
      expect(result.spans).toHaveLength(1)
      expect(result.spans[0].type).toBe('deadline')
    })

    it('handles text without urgency', () => {
      const result = extractUrgency('Buy groceries')
      expect(result.hasUrgency).toBe(false)
      expect(result.implicitPriority).toBeUndefined()
      expect(result.deadline).toBeUndefined()
    })
  })

  describe('removeUrgencyFromText', () => {
    it('removes urgency phrases', () => {
      const result = removeUrgencyFromText('Call John asap')
      expect(result).toBe('Call John')
    })

    it('removes deadline phrases', () => {
      const result = removeUrgencyFromText('Submit report by end of day')
      expect(result).toBe('Submit report')
    })

    it('removes "no rush"', () => {
      const result = removeUrgencyFromText('Review docs, no rush')
      expect(result).toBe('Review docs,')
    })

    it('handles text without urgency', () => {
      const result = removeUrgencyFromText('Buy groceries')
      expect(result).toBe('Buy groceries')
    })
  })
})
