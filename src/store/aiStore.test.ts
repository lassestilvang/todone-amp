import { describe, it, expect, beforeEach } from 'vitest'
import { useAIStore } from './aiStore'

describe('AIStore', () => {
  beforeEach(() => {
    useAIStore.setState({
      suggestions: [],
      loading: false,
      error: null,
      lastParsedText: null,
    })
  })

  describe('extractDueDate', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    it('should extract "today" as due date', () => {
      const store = useAIStore.getState()
      const date = store.extractDueDate('finish project today')

      expect(date).toBeDefined()
      expect(date?.toDateString()).toBe(today.toDateString())
    })

    it('should extract "tomorrow" as due date', () => {
      const store = useAIStore.getState()
      const date = store.extractDueDate('finish project tomorrow')

      expect(date).toBeDefined()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(date?.toDateString()).toBe(tomorrow.toDateString())
    })

    it('should extract "next week" as due date', () => {
      const store = useAIStore.getState()
      const date = store.extractDueDate('meeting next week')

      expect(date).toBeDefined()
      expect(date instanceof Date).toBe(true)
    })

    it('should extract "in 3 days" as due date', () => {
      const store = useAIStore.getState()
      const date = store.extractDueDate('task due in 3 days')

      expect(date).toBeDefined()
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() + 3)
      expect(date?.toDateString()).toBe(expectedDate.toDateString())
    })

    it('should return undefined for text without date keywords', () => {
      const store = useAIStore.getState()
      const date = store.extractDueDate('just a random task')

      expect(date).toBeUndefined()
    })
  })

  describe('extractPriority', () => {
    it('should extract P1 priority from urgent keywords', () => {
      const store = useAIStore.getState()
      expect(store.extractPriority('urgent task')).toBe('p1')
      expect(store.extractPriority('critical issue')).toBe('p1')
      expect(store.extractPriority('ASAP fix')).toBe('p1')
    })

    it('should extract P2 priority from high keywords', () => {
      const store = useAIStore.getState()
      // Note: 'high priority' is actually p1, but 'high' alone is p2
      expect(store.extractPriority('high priority task')).toBe('p1') // 'high priority' keyword
      expect(store.extractPriority('soon !!')).toBe('p2')
    })

    it('should extract P3 priority from medium keywords', () => {
      const store = useAIStore.getState()
      expect(store.extractPriority('medium priority')).toBe('p3')
      expect(store.extractPriority('normal task')).toBe('p3')
    })

    it('should extract P4 priority from low keywords', () => {
      const store = useAIStore.getState()
      expect(store.extractPriority('low priority')).toBe('p4')
      expect(store.extractPriority('someday maybe')).toBe('p4')
    })

    it('should return null for text without priority keywords', () => {
      const store = useAIStore.getState()
      expect(store.extractPriority('just a task')).toBeNull()
    })
  })

  describe('extractTimeExpression', () => {
    it('should extract time in HH:MM format', () => {
      const store = useAIStore.getState()
      const time = store.extractTimeExpression('meeting at 14:30')
      expect(time).toContain('14')
      expect(time).toContain('30')
    })

    it('should extract time with AM/PM', () => {
      const store = useAIStore.getState()
      const time = store.extractTimeExpression('call at 3:00 pm')
      expect(time).toBeDefined()
    })

    it('should return undefined for text without time', () => {
      const store = useAIStore.getState()
      const time = store.extractTimeExpression('tomorrow')
      expect(time).toBeUndefined()
    })
  })

  describe('suggestProject', () => {
    const projects = [
      { id: 'proj-1', name: 'Work' },
      { id: 'proj-2', name: 'Personal' },
      { id: 'proj-3', name: 'Shopping' },
    ]

    it('should suggest project matching task text', () => {
      const store = useAIStore.getState()
      const projectId = store.suggestProject('buy groceries for personal stuff', projects)
      expect(projectId).toBe('proj-2')
    })

    it('should be case-insensitive', () => {
      const store = useAIStore.getState()
      const projectId = store.suggestProject('WORK task here', projects)
      expect(projectId).toBe('proj-1')
    })

    it('should return undefined if no project matches', () => {
      const store = useAIStore.getState()
      const projectId = store.suggestProject('random task', projects)
      expect(projectId).toBeUndefined()
    })
  })

  describe('suggestLabels', () => {
    const labels = ['bug', 'feature', 'documentation', 'urgent']

    it('should suggest labels matching task text', () => {
      const store = useAIStore.getState()
      const suggested = store.suggestLabels('fix urgent bug in documentation', labels)
      expect(suggested).toContain('bug')
      expect(suggested).toContain('urgent')
      expect(suggested).toContain('documentation')
    })

    it('should be case-insensitive', () => {
      const store = useAIStore.getState()
      const suggested = store.suggestLabels('urgent FEATURE request', labels)
      expect(suggested).toContain('feature')
      expect(suggested).toContain('urgent')
    })

    it('should return empty array if no labels match', () => {
      const store = useAIStore.getState()
      const suggested = store.suggestLabels('random task', labels)
      expect(Array.isArray(suggested)).toBe(true)
      expect(suggested.length).toBe(0)
    })
  })

  describe('parseTask', () => {
    it('should parse basic task text', async () => {
      const store = useAIStore.getState()
      const parsed = await store.parseTask('buy groceries tomorrow')

      expect(parsed.content).toBe('buy groceries tomorrow')
      expect(parsed.priority).toBeNull()
      expect(parsed.dueDate).toBeDefined()
    })

    it('should parse task with priority', async () => {
      const store = useAIStore.getState()
      const parsed = await store.parseTask('urgent: fix bug today')

      expect(parsed.priority).toBe('p1')
      expect(parsed.dueDate).toBeDefined()
    })

    it('should clean whitespace', async () => {
      const store = useAIStore.getState()
      const parsed = await store.parseTask('  multiple   spaces   here  ')

      expect(parsed.content).not.toMatch(/ {2}/)
    })

    it('should set labels array to empty', async () => {
      const store = useAIStore.getState()
      const parsed = await store.parseTask('task text')

      expect(Array.isArray(parsed.labels)).toBe(true)
      const labels = parsed.labels ?? []
      expect(labels).toHaveLength(0)
    })
  })

  describe('getSuggestions', () => {
    it('should return array of suggestions', async () => {
      const store = useAIStore.getState()
      const suggestions = await store.getSuggestions('urgent meeting tomorrow at 2pm')

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should include parsed task in suggestion', async () => {
      const store = useAIStore.getState()
      const suggestions = await store.getSuggestions('test task')

      expect(suggestions[0]).toHaveProperty('suggestedTask')
      expect(suggestions[0]).toHaveProperty('originalText')
      expect(suggestions[0]).toHaveProperty('timestamp')
      expect(suggestions[0]).toHaveProperty('confidence')
    })

    it('should have high confidence for straightforward text', async () => {
      const store = useAIStore.getState()
      const suggestions = await store.getSuggestions('simple task')

      expect(suggestions[0].confidence).toBeGreaterThan(0.8)
    })
  })

  describe('clearSuggestions', () => {
    it('should clear suggestions array', async () => {
      await useAIStore.getState().getSuggestions('test')

      // The store might or might not have suggestions depending on getSuggestions implementation
      // Just test that clearSuggestions works correctly
      
      useAIStore.getState().clearSuggestions()
      const updatedStore = useAIStore.getState()

      expect(updatedStore.suggestions.length).toBe(0)
      expect(updatedStore.lastParsedText).toBeNull()
      expect(updatedStore.error).toBeNull()
    })
  })
})
