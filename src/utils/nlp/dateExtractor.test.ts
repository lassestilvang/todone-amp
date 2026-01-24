import { describe, it, expect, beforeEach, afterEach, setSystemTime } from 'bun:test'
import { extractDateTime, removeDateTimeFromText } from './dateExtractor'

describe('dateExtractor', () => {
  beforeEach(() => {
    setSystemTime(new Date('2026-01-12T10:00:00'))
  })

  afterEach(() => {
    setSystemTime()
  })

  describe('extractDateTime', () => {
    describe('relative dates', () => {
      it('parses "today"', () => {
        const result = extractDateTime('meeting today')
        expect(result.hasDate).toBe(true)
        expect(result.date?.toDateString()).toBe('Mon Jan 12 2026')
        expect(result.confidence).toBeGreaterThan(0.9)
      })

      it('parses "tomorrow"', () => {
        const result = extractDateTime('call tomorrow')
        expect(result.hasDate).toBe(true)
        expect(result.date?.toDateString()).toBe('Tue Jan 13 2026')
      })

      it('parses "next week"', () => {
        const result = extractDateTime('review next week')
        expect(result.hasDate).toBe(true)
        expect(result.date?.toDateString()).toBe('Mon Jan 19 2026')
      })

      it('parses "next month"', () => {
        const result = extractDateTime('deadline next month')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getMonth()).toBe(1) // February
      })

      it('parses "this week"', () => {
        const result = extractDateTime('finish this week')
        expect(result.hasDate).toBe(true)
      })

      it('parses "end of week"', () => {
        const result = extractDateTime('complete end of week')
        expect(result.hasDate).toBe(true)
      })

      it('parses "end of month"', () => {
        const result = extractDateTime('submit end of month')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDate()).toBe(31)
      })
    })

    describe('day of week', () => {
      it('parses "monday"', () => {
        const result = extractDateTime('meeting monday')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDay()).toBe(1)
      })

      it('parses "friday"', () => {
        const result = extractDateTime('demo friday')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDay()).toBe(5)
      })

      it('parses "next tuesday"', () => {
        const result = extractDateTime('call next tuesday')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDay()).toBe(2)
      })
    })

    describe('relative time periods', () => {
      it('parses "in 3 days"', () => {
        const result = extractDateTime('submit in 3 days')
        expect(result.hasDate).toBe(true)
        expect(result.date?.toDateString()).toBe('Thu Jan 15 2026')
      })

      it('parses "in 2 weeks"', () => {
        const result = extractDateTime('review in 2 weeks')
        expect(result.hasDate).toBe(true)
        expect(result.date?.toDateString()).toBe('Mon Jan 26 2026')
      })

      it('parses "in 1 month"', () => {
        const result = extractDateTime('deadline in 1 month')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getMonth()).toBe(1)
      })
    })

    describe('explicit dates', () => {
      it('parses "Jan 15"', () => {
        const result = extractDateTime('meeting Jan 15')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDate()).toBe(15)
        expect(result.date?.getMonth()).toBe(0)
      })

      it('parses "January 20th"', () => {
        const result = extractDateTime('due January 20th')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDate()).toBe(20)
      })

      it('parses "15th of February"', () => {
        const result = extractDateTime('submit 15th of February')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getDate()).toBe(15)
        expect(result.date?.getMonth()).toBe(1)
      })

      it('parses "1/20"', () => {
        const result = extractDateTime('meeting 1/20')
        expect(result.hasDate).toBe(true)
        expect(result.date?.getMonth()).toBe(0)
        expect(result.date?.getDate()).toBe(20)
      })
    })

    describe('time parsing', () => {
      it('parses "at 3pm"', () => {
        const result = extractDateTime('meeting at 3pm')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('15:00')
      })

      it('parses "at 10am"', () => {
        const result = extractDateTime('call at 10am')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('10:00')
      })

      it('parses "at 2:30pm"', () => {
        const result = extractDateTime('meeting at 2:30pm')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('14:30')
      })

      it('parses "at 14:00"', () => {
        const result = extractDateTime('call at 14:00')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('14:00')
      })

      it('parses "noon"', () => {
        const result = extractDateTime('lunch noon')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('12:00')
      })

      it('parses "midnight"', () => {
        const result = extractDateTime('deadline midnight')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('00:00')
      })

      it('parses "morning"', () => {
        const result = extractDateTime('call morning')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('09:00')
      })

      it('parses "afternoon"', () => {
        const result = extractDateTime('meeting afternoon')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('14:00')
      })

      it('parses "evening"', () => {
        const result = extractDateTime('dinner evening')
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('18:00')
      })
    })

    describe('combined date and time', () => {
      it('parses "tomorrow at 3pm"', () => {
        const result = extractDateTime('meeting tomorrow at 3pm')
        expect(result.hasDate).toBe(true)
        expect(result.hasTime).toBe(true)
        expect(result.time).toBe('15:00')
      })

      it('parses "friday at 2:30pm"', () => {
        const result = extractDateTime('demo friday at 2:30pm')
        expect(result.hasDate).toBe(true)
        expect(result.hasTime).toBe(true)
        expect(result.date?.getDay()).toBe(5)
        expect(result.time).toBe('14:30')
      })
    })

    it('returns empty for text without date/time', () => {
      const result = extractDateTime('buy groceries')
      expect(result.hasDate).toBe(false)
      expect(result.hasTime).toBe(false)
    })
  })

  describe('removeDateTimeFromText', () => {
    it('removes relative dates', () => {
      expect(removeDateTimeFromText('meeting today at 3pm')).toBe('meeting')
      expect(removeDateTimeFromText('call tomorrow morning')).toBe('call')
    })

    it('removes day names', () => {
      expect(removeDateTimeFromText('demo friday at 2pm')).toBe('demo')
      expect(removeDateTimeFromText('meeting next monday')).toBe('meeting')
    })

    it('removes time expressions', () => {
      expect(removeDateTimeFromText('standup at 9am')).toBe('standup')
      expect(removeDateTimeFromText('lunch noon')).toBe('lunch')
    })

    it('preserves task content', () => {
      expect(removeDateTimeFromText('Buy groceries for dinner')).toBe('Buy groceries for dinner')
    })
  })
})
