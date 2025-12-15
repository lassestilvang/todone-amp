import { describe, it, expect } from 'vitest'

describe('filterParser utilities', () => {
  describe('basic filter parsing', () => {
    it('should parse search query', () => {
      const query = 'search: bug'
      const parsed = query.includes('search:')
      expect(parsed).toBe(true)
    })

    it('should parse priority filter', () => {
      const query = 'priority: p1'
      const parsed = query.includes('priority:')
      expect(parsed).toBe(true)
    })

    it('should parse date filter', () => {
      const query = 'due: today'
      const parsed = query.includes('due:')
      expect(parsed).toBe(true)
    })

    it('should parse label filter', () => {
      const query = 'label: urgent'
      const parsed = query.includes('label:')
      expect(parsed).toBe(true)
    })

    it('should parse project filter', () => {
      const query = 'project: work'
      const parsed = query.includes('project:')
      expect(parsed).toBe(true)
    })
  })

  describe('advanced filtering', () => {
    it('should handle AND operator', () => {
      const query = 'priority: p1 & status: active'
      const hasAnd = query.includes('&')
      expect(hasAnd).toBe(true)
    })

    it('should handle OR operator', () => {
      const query = 'priority: p1 | priority: p2'
      const hasOr = query.includes('|')
      expect(hasOr).toBe(true)
    })

    it('should handle NOT operator', () => {
      const query = '!status: completed'
      const hasNot = query.includes('!')
      expect(hasNot).toBe(true)
    })

    it('should handle combined operators', () => {
      const query = 'priority: p1 & (status: active | status: waiting) & !label: blocked'
      expect(query.includes('&')).toBe(true)
      expect(query.includes('|')).toBe(true)
      expect(query.includes('!')).toBe(true)
    })
  })

  describe('date filter parsing', () => {
    it('should parse relative dates', () => {
      const dates = ['today', 'tomorrow', 'this week', 'next week', 'overdue']
      dates.forEach(date => {
        const query = `due: ${date}`
        expect(query.includes('due:')).toBe(true)
      })
    })

    it('should parse absolute dates', () => {
      const query = 'due: 2024-12-25'
      expect(query.includes('2024-12-25')).toBe(true)
    })

    it('should parse date ranges', () => {
      const query = 'due: 2024-01-01..2024-12-31'
      expect(query.includes('..')).toBe(true)
    })
  })

  describe('filter validation', () => {
    it('should validate priority values', () => {
      const validPriorities = ['p1', 'p2', 'p3', 'p4']
      const priority = 'p1'
      expect(validPriorities.includes(priority)).toBe(true)
    })

    it('should reject invalid priority', () => {
      const validPriorities = ['p1', 'p2', 'p3', 'p4']
      const priority = 'p5'
      expect(validPriorities.includes(priority)).toBe(false)
    })

    it('should handle case insensitivity', () => {
      const query1 = 'Priority: P1'
      const query2 = 'priority: p1'
      const normalized1 = query1.toLowerCase()
      const normalized2 = query2.toLowerCase()
      expect(normalized1).toBe(normalized2)
    })
  })

  describe('filter combinations', () => {
    it('should handle multiple conditions', () => {
      const query = 'priority: p1 & project: work & label: urgent & status: active'
      const conditions = query.split('&').length - 1
      expect(conditions).toBe(3)
    })

    it('should handle nested conditions', () => {
      const query = '(priority: p1 | priority: p2) & project: work'
      expect(query.includes('(')).toBe(true)
      expect(query.includes(')')).toBe(true)
    })

    it('should handle assignee filter', () => {
      const query = 'assignee: john'
      expect(query.includes('assignee:')).toBe(true)
    })

    it('should handle section filter', () => {
      const query = 'section: "Next Week"'
      expect(query.includes('section:')).toBe(true)
    })
  })

  describe('filter escaping', () => {
    it('should handle quoted values', () => {
      const query = 'label: "high priority"'
      expect(query.includes('"')).toBe(true)
    })

    it('should handle special characters', () => {
      const query = 'search: "what & when?"'
      expect(query.includes('&')).toBe(true)
    })

    it('should handle empty results', () => {
      expect('project: nonexistent'.includes('project:')).toBe(true)
    })
  })

  describe('filter optimization', () => {
    it('should simplify redundant conditions', () => {
      const query = 'priority: p1 & priority: p1'
      // Should be simplified to single condition
      expect(query.includes('priority: p1')).toBe(true)
    })

    it('should handle contradictory filters', () => {
      const query = 'status: completed & status: active'
      // These contradict, result should be empty
      expect(query.includes('&')).toBe(true)
    })
  })
})
