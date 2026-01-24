import { describe, it, expect } from 'bun:test'
import { detectMultiPart, wouldSplitCleanly } from './multiPartDetector'

describe('multiPartDetector', () => {
  describe('detectMultiPart', () => {
    it('handles empty input', () => {
      const result = detectMultiPart('')
      expect(result.isMultiPart).toBe(false)
    })

    it('detects single task as not multi-part', () => {
      const result = detectMultiPart('Buy groceries')
      expect(result.isMultiPart).toBe(false)
    })

    describe('"and" separator', () => {
      it('detects "and" with multiple actions', () => {
        const result = detectMultiPart('Call mom and email John')
        expect(result.isMultiPart).toBe(true)
        expect(result.suggestedSplit).toHaveLength(2)
        expect(result.suggestedSplit).toContain('Call mom')
        expect(result.suggestedSplit).toContain('Email John')
      })

      it('detects "and then"', () => {
        const result = detectMultiPart('Write report and then send to client')
        expect(result.isMultiPart).toBe(true)
        expect(result.suggestedSplit?.length).toBeGreaterThanOrEqual(2)
      })

      it('detects "and also"', () => {
        const result = detectMultiPart('Review PR and also update docs')
        expect(result.isMultiPart).toBe(true)
      })
    })

    describe('"then" separator', () => {
      it('detects "then" with multiple actions', () => {
        const result = detectMultiPart('Draft email then schedule meeting')
        expect(result.isMultiPart).toBe(true)
        expect(result.suggestedSplit).toHaveLength(2)
      })
    })

    describe('"also" separator', () => {
      it('detects "also" with multiple actions', () => {
        const result = detectMultiPart('Buy groceries, also pay bills')
        expect(result.isMultiPart).toBe(true)
      })
    })

    describe('semicolon separator', () => {
      it('detects semicolon-separated tasks', () => {
        const result = detectMultiPart('Call John; email Sarah; book meeting')
        expect(result.isMultiPart).toBe(true)
        expect(result.suggestedSplit?.length).toBeGreaterThanOrEqual(2)
      })
    })

    describe('complex multi-part tasks', () => {
      it('detects three-part task', () => {
        const result = detectMultiPart('Call client, then prepare proposal, and schedule followup')
        expect(result.isMultiPart).toBe(true)
        expect(result.suggestedSplit?.length).toBeGreaterThanOrEqual(2)
      })

      it('returns confidence score', () => {
        const result = detectMultiPart('Email John and call Sarah')
        expect(result.isMultiPart).toBe(true)
        expect(result.confidence).toBeGreaterThan(0)
        expect(result.confidence).toBeLessThanOrEqual(1)
      })

      it('higher confidence for more actions', () => {
        const twoActions = detectMultiPart('Email John and call Sarah')
        const threeActions = detectMultiPart('Email John and call Sarah and schedule meeting')
        expect(threeActions.confidence).toBeGreaterThanOrEqual(twoActions.confidence)
      })
    })

    describe('edge cases', () => {
      it('does not split "bread and butter"', () => {
        // Without action verbs, should have lower confidence or not split
        const result = detectMultiPart('Buy bread and butter')
        // This might still detect "and" but should have low confidence
        // since "butter" is not an action verb
        if (result.isMultiPart) {
          expect(result.confidence).toBeLessThan(0.7)
        }
      })

      it('does not split very short segments', () => {
        const result = detectMultiPart('Do a and b')
        // Should not create very short splits
        if (result.suggestedSplit) {
          for (const split of result.suggestedSplit) {
            expect(split.length).toBeGreaterThan(3)
          }
        }
      })

      it('capitalizes split suggestions', () => {
        const result = detectMultiPart('call mom and email dad')
        expect(result.isMultiPart).toBe(true)
        if (result.suggestedSplit) {
          for (const split of result.suggestedSplit) {
            expect(split[0]).toBe(split[0].toUpperCase())
          }
        }
      })
    })

    it('returns split points', () => {
      const result = detectMultiPart('Call mom and email John')
      expect(result.splitPoints.length).toBeGreaterThan(0)
      expect(result.splitPoints[0]).toHaveProperty('index')
      expect(result.splitPoints[0]).toHaveProperty('separator')
    })
  })

  describe('wouldSplitCleanly', () => {
    it('returns valid: true when separator creates valid parts', () => {
      const result = wouldSplitCleanly('Call mom and email John', 'and')
      expect(result.valid).toBe(true)
      expect(result.parts.length).toBe(2)
    })

    it('returns valid: false for unknown separator', () => {
      const result = wouldSplitCleanly('Call mom xyz email John', 'xyz')
      expect(result.valid).toBe(false)
    })

    it('returns valid: false when parts are too short', () => {
      const result = wouldSplitCleanly('a and b', 'and')
      expect(result.valid).toBe(false)
    })

    it('filters out very short parts', () => {
      const result = wouldSplitCleanly('Call mom and a and email John', 'and')
      // Should filter out "a"
      for (const part of result.parts) {
        expect(part.length).toBeGreaterThan(3)
      }
    })
  })
})
