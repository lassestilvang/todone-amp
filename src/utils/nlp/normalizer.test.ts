import { describe, it, expect } from 'bun:test'
import { normalizeInput, getAbbreviationHints } from './normalizer'

describe('normalizer', () => {
  describe('normalizeInput', () => {
    it('handles empty input', () => {
      const result = normalizeInput('')
      expect(result.normalizedText).toBe('')
      expect(result.replacements).toHaveLength(0)
    })

    it('handles whitespace-only input', () => {
      const result = normalizeInput('   ')
      expect(result.normalizedText).toBe('')
    })

    it('preserves simple text unchanged', () => {
      const result = normalizeInput('Buy groceries')
      expect(result.normalizedText).toBe('Buy groceries')
    })

    describe('abbreviation expansion', () => {
      it('expands tmrw to tomorrow', () => {
        const result = normalizeInput('Call mom tmrw')
        expect(result.normalizedText).toBe('Call mom tomorrow')
        expect(result.replacements).toContainEqual(
          expect.objectContaining({ original: 'tmrw', replacement: 'tomorrow' })
        )
      })

      it('expands mtg to meeting', () => {
        const result = normalizeInput('Team mtg at 3pm')
        expect(result.normalizedText).toBe('Team meeting at 3pm')
      })

      it('expands appt to appointment', () => {
        const result = normalizeInput('Doctor appt tomorrow')
        expect(result.normalizedText).toBe('Doctor appointment tomorrow')
      })

      it('expands fup to follow up', () => {
        const result = normalizeInput('Fup with client')
        expect(result.normalizedText).toBe('Follow up with client')
      })

      it('expands w/ to with', () => {
        const result = normalizeInput('Meeting w/ John')
        expect(result.normalizedText).toBe('Meeting with John')
      })

      it('expands eod to end of day', () => {
        const result = normalizeInput('Submit report eod')
        expect(result.normalizedText).toBe('Submit report end of day')
      })

      it('expands asap to as soon as possible', () => {
        const result = normalizeInput('Call John asap')
        expect(result.normalizedText).toBe('Call John as soon as possible')
      })

      it('expands weekday abbreviations', () => {
        const result = normalizeInput('Meeting mon at 10am')
        expect(result.normalizedText).toBe('Meeting monday at 10am')
      })

      it('preserves case for uppercase abbreviations', () => {
        const result = normalizeInput('Tmrw morning meeting')
        expect(result.normalizedText).toBe('Tomorrow morning meeting')
      })

      it('handles multiple abbreviations', () => {
        const result = normalizeInput('Mtg w/ client tmrw')
        expect(result.normalizedText).toBe('Meeting with client tomorrow')
      })
    })

    describe('character normalization', () => {
      it('normalizes smart quotes', () => {
        const result = normalizeInput('Review John\u2019s proposal')
        expect(result.normalizedText).toBe("Review John's proposal")
      })

      it('normalizes em dashes', () => {
        const result = normalizeInput('Task one \u2014 task two')
        expect(result.normalizedText).toBe('Task one - task two')
      })

      it('normalizes curly quotes', () => {
        const result = normalizeInput('\u201CImportant\u201D task')
        expect(result.normalizedText).toBe('"Important" task')
      })
    })

    describe('whitespace normalization', () => {
      it('collapses multiple spaces', () => {
        const result = normalizeInput('Task   with    spaces')
        expect(result.normalizedText).toBe('Task with spaces')
      })

      it('trims leading and trailing whitespace', () => {
        const result = normalizeInput('  Task with padding  ')
        expect(result.normalizedText).toBe('Task with padding')
      })
    })

    describe('separator normalization', () => {
      it('normalizes re: to regarding', () => {
        const result = normalizeInput('Email John re: proposal')
        expect(result.normalizedText).toBe('Email John regarding proposal')
      })

      it('normalizes re with space to regarding', () => {
        const result = normalizeInput('Call about re : the meeting')
        expect(result.normalizedText).toBe('Call about regarding the meeting')
      })
    })
  })

  describe('getAbbreviationHints', () => {
    it('returns array of abbreviation hints', () => {
      const hints = getAbbreviationHints()
      expect(hints).toBeInstanceOf(Array)
      expect(hints.length).toBeGreaterThan(0)
    })

    it('includes common abbreviations', () => {
      const hints = getAbbreviationHints()
      const abbrevs = hints.map((h) => h.abbrev)
      expect(abbrevs).toContain('tmrw')
      expect(abbrevs).toContain('mtg')
      expect(abbrevs).toContain('appt')
    })

    it('each hint has abbrev and expansion', () => {
      const hints = getAbbreviationHints()
      for (const hint of hints) {
        expect(hint).toHaveProperty('abbrev')
        expect(hint).toHaveProperty('expansion')
        expect(typeof hint.abbrev).toBe('string')
        expect(typeof hint.expansion).toBe('string')
      }
    })
  })
})
