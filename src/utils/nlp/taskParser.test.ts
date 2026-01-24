import { describe, it, expect, beforeEach, afterEach, setSystemTime } from 'bun:test'
import { parseTaskInput, formatParsedTask, getSuggestions } from './taskParser'

describe('taskParser', () => {
  const mockContext = {
    projects: [
      { id: 'p1', name: 'Work' },
      { id: 'p2', name: 'Personal' },
    ],
    labels: [
      { id: 'l1', name: 'urgent' },
      { id: 'l2', name: 'important' },
    ],
  }

  beforeEach(() => {
    setSystemTime(new Date('2026-01-12T10:00:00'))
  })

  afterEach(() => {
    setSystemTime()
  })

  describe('parseTaskInput', () => {
    it('parses simple task title', () => {
      const result = parseTaskInput('Buy groceries', mockContext)
      expect(result.title).toBe('Buy groceries')
      // May detect action type (buy) and estimated duration
      expect(result.actionType).toBe('buy')
    })

    it('parses task with date', () => {
      const result = parseTaskInput('Buy groceries tomorrow', mockContext)
      expect(result.title).toBe('Buy groceries')
      expect(result.dueDate).toBeDefined()
      expect(result.parsedFields.some((f) => f.field === 'dueDate')).toBe(true)
    })

    it('parses task with time', () => {
      const result = parseTaskInput('Meeting at 3pm', mockContext)
      expect(result.title).toBe('Meeting')
      expect(result.dueTime).toBe('15:00')
    })

    it('parses task with priority', () => {
      const result = parseTaskInput('Fix important bug p1', mockContext)
      expect(result.title).toBe('Fix bug')
      expect(result.priority).toBe('p1')
    })

    it('parses task with project hashtag', () => {
      const result = parseTaskInput('Complete report #work', mockContext)
      expect(result.title).toBe('Complete report')
      expect(result.projectId).toBe('p1')
      expect(result.projectName).toBe('Work')
    })

    it('parses task with label mention', () => {
      const result = parseTaskInput('Review PR @urgent', mockContext)
      expect(result.title).toBe('Review PR')
      expect(result.labelIds).toContain('l1')
      expect(result.labelNames).toContain('urgent')
    })

    it('parses task with multiple labels', () => {
      const result = parseTaskInput('Task @urgent @important', mockContext)
      expect(result.labelIds.length).toBe(2)
    })

    it('parses complex natural language input', () => {
      const result = parseTaskInput(
        'Meet John for coffee tomorrow at 3pm #work @important p2',
        mockContext
      )
      expect(result.title).toBe('Meet John for coffee')
      expect(result.dueDate).toBeDefined()
      expect(result.dueTime).toBe('15:00')
      expect(result.projectId).toBe('p1')
      expect(result.labelIds).toContain('l2')
      expect(result.priority).toBe('p2')
    })

    it('parses task with recurrence', () => {
      const result = parseTaskInput('Standup meeting daily', mockContext)
      expect(result.title).toBe('Standup meeting')
      expect(result.recurrence?.frequency).toBe('daily')
    })

    it('preserves original text', () => {
      const input = 'Test task tomorrow'
      const result = parseTaskInput(input, mockContext)
      expect(result.originalText).toBe(input)
    })

    it('calculates confidence based on parsed fields', () => {
      const simpleResult = parseTaskInput('Buy groceries', mockContext)
      const complexResult = parseTaskInput('Meeting tomorrow at 3pm #work p1', mockContext)

      expect(complexResult.confidence).toBeGreaterThan(simpleResult.confidence)
    })

    it('handles empty input', () => {
      const result = parseTaskInput('', mockContext)
      expect(result.title).toBe('')
      expect(result.confidence).toBe(0)
    })

    it('handles whitespace-only input', () => {
      const result = parseTaskInput('   ', mockContext)
      expect(result.title).toBe('')
    })
  })

  describe('formatParsedTask', () => {
    it('formats simple task', () => {
      const parsed = parseTaskInput('Buy groceries', mockContext)
      expect(formatParsedTask(parsed)).toBe('Buy groceries')
    })

    it('formats task with project', () => {
      const parsed = parseTaskInput('Task #work', mockContext)
      const formatted = formatParsedTask(parsed)
      expect(formatted).toContain('#Work')
    })

    it('formats task with labels', () => {
      const parsed = parseTaskInput('Task @urgent', mockContext)
      const formatted = formatParsedTask(parsed)
      expect(formatted).toContain('@urgent')
    })

    it('formats task with date', () => {
      const parsed = parseTaskInput('Task tomorrow', mockContext)
      const formatted = formatParsedTask(parsed)
      expect(formatted).toContain('Jan')
    })

    it('formats task with time', () => {
      const parsed = parseTaskInput('Meeting at 3pm', mockContext)
      const formatted = formatParsedTask(parsed)
      expect(formatted).toContain('at 15:00')
    })

    it('formats task with priority', () => {
      const parsed = parseTaskInput('Task p1', mockContext)
      const formatted = formatParsedTask(parsed)
      expect(formatted).toContain('p1')
    })
  })

  describe('getSuggestions', () => {
    it('suggests projects when typing #', () => {
      const suggestions = getSuggestions('task #w', mockContext)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].type).toBe('project')
      expect(suggestions[0].display).toContain('Work')
    })

    it('suggests labels when typing @', () => {
      const suggestions = getSuggestions('task @u', mockContext)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].type).toBe('label')
      expect(suggestions[0].display).toContain('urgent')
    })

    it('returns empty when no match', () => {
      const suggestions = getSuggestions('task #xyz', mockContext)
      expect(suggestions.length).toBe(0)
    })

    it('returns empty when not typing # or @', () => {
      const suggestions = getSuggestions('task', mockContext)
      expect(suggestions.length).toBe(0)
    })
  })
})
