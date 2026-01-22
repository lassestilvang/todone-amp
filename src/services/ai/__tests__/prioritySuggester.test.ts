import { describe, it, expect } from 'vitest'
import { suggestPriority, extractAllPriorityMatches } from '../prioritySuggester'

describe('prioritySuggester', () => {
  describe('suggestPriority', () => {
    describe('explicit priority markers', () => {
      it('detects "p1" marker', () => {
        const result = suggestPriority({ taskContent: 'fix login bug p1' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.confidence).toBeGreaterThan(0.95)
      })

      it('detects "P2" marker (case insensitive)', () => {
        const result = suggestPriority({ taskContent: 'update docs P2' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
        expect(result?.confidence).toBeGreaterThan(0.95)
      })

      it('detects "priority 3" marker', () => {
        const result = suggestPriority({ taskContent: 'cleanup code priority 3' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p3')
      })

      it('detects "p4" marker', () => {
        const result = suggestPriority({ taskContent: 'research new framework p4' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "!!!" as P1', () => {
        const result = suggestPriority({ taskContent: 'fix production bug !!!' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.confidence).toBeGreaterThan(0.95)
      })

      it('detects "!!" as P2', () => {
        const result = suggestPriority({ taskContent: 'important task !!' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })
    })

    describe('critical urgency keywords', () => {
      it('detects "critical" as P1', () => {
        const result = suggestPriority({ taskContent: 'critical: API is failing' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.value.factors).toContain('Critical urgency keyword detected')
      })

      it('detects "urgent" as P1', () => {
        const result = suggestPriority({ taskContent: 'urgent fix needed for checkout' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "asap" as P1', () => {
        const result = suggestPriority({ taskContent: 'need this asap' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "emergency" as P1', () => {
        const result = suggestPriority({ taskContent: 'emergency: database corruption' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "immediately" as P1', () => {
        const result = suggestPriority({ taskContent: 'respond immediately to outage' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })
    })

    describe('production and security issues', () => {
      it('detects "production bug" as P1', () => {
        const result = suggestPriority({ taskContent: 'production bug in payment flow' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.value.factors).toContain('Production issue detected')
      })

      it('detects "outage" as P1', () => {
        const result = suggestPriority({ taskContent: 'investigate outage in us-east' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "site down" as P1', () => {
        const result = suggestPriority({ taskContent: 'site down for some users' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "security vulnerability" as P1', () => {
        const result = suggestPriority({ taskContent: 'patch security vulnerability CVE-123' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.value.factors).toContain('Security concern detected')
      })

      it('detects "data breach" as P1', () => {
        const result = suggestPriority({ taskContent: 'possible data breach investigation' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })
    })

    describe('blocking tasks', () => {
      it('detects "blocker" as P1', () => {
        const result = suggestPriority({ taskContent: 'blocker: need API key' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.value.factors).toContain('Task is blocking other work')
      })

      it('detects "blocking" as P1', () => {
        const result = suggestPriority({ taskContent: 'this is blocking the release' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "waiting on" as P1', () => {
        const result = suggestPriority({ taskContent: 'team waiting on this fix' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })
    })

    describe('deadline pressure', () => {
      it('detects "eod" as P1', () => {
        const result = suggestPriority({ taskContent: 'finish report eod' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.value.factors).toContain('Same-day deadline detected')
      })

      it('detects "end of day" as P1', () => {
        const result = suggestPriority({ taskContent: 'need this by end of day' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })

      it('detects "today" as P1', () => {
        const result = suggestPriority({ taskContent: 'must complete today' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
      })
    })

    describe('importance keywords → P2', () => {
      it('detects "important" as P2', () => {
        const result = suggestPriority({ taskContent: 'important: review contracts' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
        expect(result?.value.factors).toContain('Importance keyword detected')
      })

      it('detects "high priority" as P2', () => {
        const result = suggestPriority({ taskContent: 'high priority feature request' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })

      it('detects "crucial" as P2', () => {
        const result = suggestPriority({ taskContent: 'crucial meeting prep' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })
    })

    describe('near-term deadlines → P2', () => {
      it('detects "tomorrow" as P2', () => {
        const result = suggestPriority({ taskContent: 'submit proposal tomorrow' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
        expect(result?.value.factors).toContain('Near-term deadline detected')
      })

      it('detects "this week" as P2', () => {
        const result = suggestPriority({ taskContent: 'complete this week' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })

      it('detects "by friday" as P2', () => {
        const result = suggestPriority({ taskContent: 'deliver by friday' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })
    })

    describe('meeting and client related → P2', () => {
      it('detects "before meeting" as P2', () => {
        const result = suggestPriority({ taskContent: 'prepare slides before meeting' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
        expect(result?.value.factors).toContain('Meeting/presentation related task')
      })

      it('detects "presentation" as P2', () => {
        const result = suggestPriority({ taskContent: 'finalize presentation deck' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })

      it('detects "client" as P2', () => {
        const result = suggestPriority({ taskContent: 'respond to client email' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
        expect(result?.value.factors).toContain('Client/customer facing task')
      })

      it('detects "customer" as P2', () => {
        const result = suggestPriority({ taskContent: 'customer reported issue' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })
    })

    describe('standard tasks → P3', () => {
      it('detects "need to" as P3', () => {
        const result = suggestPriority({ taskContent: 'need to update dependencies' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p3')
        expect(result?.value.factors).toContain('Standard task indicator')
      })

      it('detects "documentation" as P3', () => {
        const result = suggestPriority({ taskContent: 'add documentation for API' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p3')
        expect(result?.value.factors).toContain('Documentation/maintenance task')
      })

      it('detects "refactor" as P3', () => {
        const result = suggestPriority({ taskContent: 'refactor auth module' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p3')
      })

      it('detects "cleanup" as P3', () => {
        const result = suggestPriority({ taskContent: 'cleanup unused imports' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p3')
      })
    })

    describe('low priority indicators → P4', () => {
      it('detects "low priority" as P4', () => {
        const result = suggestPriority({ taskContent: 'low priority: explore new library' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
        expect(result?.value.factors).toContain('Low priority indicator')
      })

      it('detects "someday" as P4', () => {
        const result = suggestPriority({ taskContent: 'someday learn Rust' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "when I have time" as P4', () => {
        const result = suggestPriority({ taskContent: 'when I have time review that book' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "nice to have" as P4', () => {
        const result = suggestPriority({ taskContent: 'nice to have: dark mode' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })
    })

    describe('optional/tentative tasks → P4', () => {
      it('detects "maybe" as P4', () => {
        const result = suggestPriority({ taskContent: 'maybe try new testing framework' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
        expect(result?.value.factors).toContain('Optional/tentative task')
      })

      it('detects "optional" as P4', () => {
        const result = suggestPriority({ taskContent: 'optional: add animations' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "consider" as P4', () => {
        const result = suggestPriority({ taskContent: 'consider using TypeScript strict mode' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })
    })

    describe('research and exploration → P4', () => {
      it('detects "research" as P4', () => {
        const result = suggestPriority({ taskContent: 'research GraphQL alternatives' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
        expect(result?.value.factors).toContain('Research/exploration task')
      })

      it('detects "explore" as P4', () => {
        const result = suggestPriority({ taskContent: 'explore edge computing options' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "investigate" as P4', () => {
        const result = suggestPriority({ taskContent: 'investigate performance issue' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "spike" as P4', () => {
        const result = suggestPriority({ taskContent: 'spike on new auth approach' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })
    })

    describe('future/backlog tasks → P4', () => {
      it('detects "next month" as P4', () => {
        const result = suggestPriority({ taskContent: 'plan next month quarterly review' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
        expect(result?.value.factors).toContain('Future/backlog task')
      })

      it('detects "backlog" as P4', () => {
        const result = suggestPriority({ taskContent: 'add to backlog: improve error handling' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })

      it('detects "long term" as P4', () => {
        const result = suggestPriority({ taskContent: 'long term goal: rewrite in Go' })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p4')
      })
    })

    describe('edge cases', () => {
      it('returns null for text without priority indicators', () => {
        const result = suggestPriority({ taskContent: 'buy groceries' })
        expect(result).toBeNull()
      })

      it('returns null for empty text', () => {
        const result = suggestPriority({ taskContent: '' })
        expect(result).toBeNull()
      })

      it('returns null for whitespace only', () => {
        const result = suggestPriority({ taskContent: '   ' })
        expect(result).toBeNull()
      })

      it('handles multiple priority indicators (picks highest confidence)', () => {
        const result = suggestPriority({
          taskContent: 'urgent p1 task that is also important',
        })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p1')
        expect(result?.confidence).toBeGreaterThan(0.9)
      })

      it('prefers explicit markers over keywords', () => {
        const result = suggestPriority({
          taskContent: 'maybe p2 task',
        })
        expect(result).not.toBeNull()
        expect(result?.value.priority).toBe('p2')
      })
    })

    describe('reasoning', () => {
      it('provides human-readable reasoning', () => {
        const result = suggestPriority({ taskContent: 'urgent fix needed' })
        expect(result?.reasoning).toContain('P1')
        expect(result?.reasoning).toContain('Urgent')
      })

      it('includes factors in reasoning', () => {
        const result = suggestPriority({ taskContent: 'production bug fix' })
        expect(result?.reasoning).toContain('Production issue detected')
      })
    })
  })

  describe('extractAllPriorityMatches', () => {
    it('extracts multiple priority indicators from text', () => {
      const matches = extractAllPriorityMatches('urgent p1 task, also important for client')
      expect(matches.length).toBeGreaterThanOrEqual(3)
    })

    it('returns empty array for text without priority indicators', () => {
      const matches = extractAllPriorityMatches('just a regular task')
      expect(matches).toHaveLength(0)
    })

    it('sorts matches by confidence', () => {
      const matches = extractAllPriorityMatches('important task p1')
      expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence)
    })

    it('includes pattern id and factors', () => {
      const matches = extractAllPriorityMatches('critical issue')
      expect(matches[0].pattern).toBe('critical-urgency')
      expect(matches[0].factors).toContain('Critical urgency keyword detected')
    })
  })
})
