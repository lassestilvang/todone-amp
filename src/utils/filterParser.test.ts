import { describe, it, expect } from 'vitest'
import {
  parseAndEvaluateFilter,
  applyAdvancedFilter,
  getFilterSuggestions,
  getFieldNameSuggestions,
  getValueSuggestions,
  formatFilterQuery,
} from './filterParser'
import type { Task } from '@/types'

// Helper to create a test task
function createTask(overrides?: Partial<Task>): Task {
  const now = new Date()
  return {
    id: 'task-1',
    content: 'Test task',
    description: 'Test description',
    completed: false,
    priority: 'p2',
    labels: [],
    assigneeIds: [],
    projectId: undefined,
    sectionId: undefined,
    parentTaskId: undefined,
    dueDate: undefined,
    dueTime: undefined,
    duration: 0,
    createdAt: now,
    updatedAt: now,
    completedAt: undefined,
    createdBy: 'user-1',
    order: 1,
    recurrence: undefined,
    attachments: [],
    reminders: [],
    ...overrides,
  }
}

describe('Filter Parser', () => {
  describe('parseAndEvaluateFilter', () => {
    it('should return true for empty query', () => {
      const task = createTask()
      expect(parseAndEvaluateFilter('', task)).toBe(true)
    })

    it('should filter by priority', () => {
      const task = createTask({ priority: 'p1' })
      expect(parseAndEvaluateFilter('priority:p1', task)).toBe(true)
      expect(parseAndEvaluateFilter('priority:p2', task)).toBe(false)
    })

    it('should filter by status active', () => {
      const task = createTask({ completed: false })
      expect(parseAndEvaluateFilter('status:active', task)).toBe(true)
      expect(parseAndEvaluateFilter('status:completed', task)).toBe(false)
    })

    it('should filter by status completed', () => {
      const task = createTask({ completed: true })
      expect(parseAndEvaluateFilter('status:completed', task)).toBe(true)
      expect(parseAndEvaluateFilter('status:active', task)).toBe(false)
    })

    it('should filter by search text in content', () => {
      const task = createTask({ content: 'buy groceries' })
      expect(parseAndEvaluateFilter('search:groceries', task)).toBe(true)
      expect(parseAndEvaluateFilter('search:milk', task)).toBe(false)
    })

    it('should filter by search text in description', () => {
      const task = createTask({ description: 'this is important' })
      expect(parseAndEvaluateFilter('search:important', task)).toBe(true)
      expect(parseAndEvaluateFilter('search:urgent', task)).toBe(false)
    })

    it('should filter by label', () => {
      const task = createTask({ labels: ['urgent', 'work'] })
      expect(parseAndEvaluateFilter('label:urgent', task)).toBe(true)
      expect(parseAndEvaluateFilter('label:personal', task)).toBe(false)
    })

    it('should filter by project', () => {
      const task = createTask({ projectId: 'project-engineering' })
      expect(parseAndEvaluateFilter('project:engineering', task)).toBe(true)
      expect(parseAndEvaluateFilter('project:marketing', task)).toBe(false)
    })

    it('should filter by due date - today', () => {
      const today = new Date()
      const task = createTask({ dueDate: today })
      expect(parseAndEvaluateFilter('due:today', task)).toBe(true)
    })

    it('should filter by due date - overdue', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const task = createTask({ dueDate: yesterday })
      expect(parseAndEvaluateFilter('due:overdue', task)).toBe(true)
    })

    it('should filter by due date - upcoming', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const task = createTask({ dueDate: tomorrow })
      expect(parseAndEvaluateFilter('due:upcoming', task)).toBe(true)
    })

    it('should filter by assigned unassigned', () => {
      const task = createTask({ assigneeIds: [] })
      expect(parseAndEvaluateFilter('assigned:unassigned', task)).toBe(true)
    })

    it('should filter by assignee with ID', () => {
      const task = createTask({ assigneeIds: ['user-123'] })
      expect(parseAndEvaluateFilter('assigned:user-123', task)).toBe(true)
      expect(parseAndEvaluateFilter('assigned:user-456', task)).toBe(false)
    })

    it('should filter by subtask child', () => {
      const task = createTask({ parentTaskId: 'parent-1' })
      expect(parseAndEvaluateFilter('subtask:child', task)).toBe(true)
      expect(parseAndEvaluateFilter('subtask:parent', task)).toBe(false)
    })

    it('should filter by subtask parent', () => {
      const task = createTask({ parentTaskId: undefined })
      expect(parseAndEvaluateFilter('subtask:parent', task)).toBe(true)
    })

    it('should handle AND operator', () => {
      const task = createTask({ priority: 'p1', completed: false })
      expect(parseAndEvaluateFilter('priority:p1 AND status:active', task)).toBe(true)
      expect(parseAndEvaluateFilter('priority:p1 AND status:completed', task)).toBe(false)
    })

    it('should handle OR operator', () => {
      const task = createTask({ priority: 'p1' })
      expect(parseAndEvaluateFilter('priority:p1 OR priority:p2', task)).toBe(true)
      expect(parseAndEvaluateFilter('priority:p3 OR priority:p4', task)).toBe(false)
    })

    it('should handle NOT operator', () => {
      const task = createTask({ completed: false })
      expect(parseAndEvaluateFilter('NOT status:completed', task)).toBe(true)
      expect(parseAndEvaluateFilter('NOT status:active', task)).toBe(false)
    })

    it('should handle parentheses', () => {
      const task = createTask({ priority: 'p1', completed: false })
      expect(parseAndEvaluateFilter('(priority:p1 OR priority:p2) AND status:active', task)).toBe(true)
    })

    it('should handle complex queries', () => {
      const task = createTask({
        priority: 'p1',
        completed: false,
        labels: ['urgent'],
      })
      expect(parseAndEvaluateFilter('(priority:p1 OR priority:p2) AND status:active AND label:urgent', task)).toBe(true)
    })

    it('should handle case-insensitive operators', () => {
      const task = createTask({ priority: 'p1', completed: false })
      expect(parseAndEvaluateFilter('priority:p1 and status:active', task)).toBe(true)
    })
  })

  describe('applyAdvancedFilter', () => {
    it('should filter multiple tasks', () => {
      const tasks = [
        createTask({ id: 'task-1', priority: 'p1' }),
        createTask({ id: 'task-2', priority: 'p2' }),
        createTask({ id: 'task-3', priority: 'p1' }),
      ]

      const result = applyAdvancedFilter('priority:p1', tasks)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('task-1')
      expect(result[1].id).toBe('task-3')
    })

    it('should return all tasks for empty query', () => {
      const tasks = [
        createTask({ id: 'task-1' }),
        createTask({ id: 'task-2' }),
      ]

      const result = applyAdvancedFilter('', tasks)
      expect(result).toEqual(tasks)
    })

    it('should apply complex filter to multiple tasks', () => {
      const tasks = [
        createTask({ id: 'task-1', priority: 'p1', completed: false, labels: ['urgent'] }),
        createTask({ id: 'task-2', priority: 'p1', completed: true, labels: ['urgent'] }),
        createTask({ id: 'task-3', priority: 'p2', completed: false, labels: ['urgent'] }),
      ]

      const result = applyAdvancedFilter('priority:p1 AND status:active', tasks)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('task-1')
    })
  })

  describe('getFilterSuggestions', () => {
    it('should return array of filter suggestions', () => {
      const suggestions = getFilterSuggestions()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions).toContain('priority:p1')
      expect(suggestions).toContain('status:active')
      expect(suggestions).toContain('priority:p1 AND status:active')
    })
  })

  describe('getFieldNameSuggestions', () => {
    it('should return array of field names', () => {
      const suggestions = getFieldNameSuggestions()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions).toContain('priority')
      expect(suggestions).toContain('status')
      expect(suggestions).toContain('due')
      expect(suggestions).toContain('label')
      expect(suggestions).toContain('project')
    })
  })

  describe('getValueSuggestions', () => {
    it('should return values for priority field', () => {
      const suggestions = getValueSuggestions('priority')
      expect(suggestions).toEqual(['p1', 'p2', 'p3', 'p4'])
    })

    it('should return values for status field', () => {
      const suggestions = getValueSuggestions('status')
      expect(suggestions).toContain('active')
      expect(suggestions).toContain('completed')
    })

    it('should return values for due field', () => {
      const suggestions = getValueSuggestions('due')
      expect(suggestions).toContain('today')
      expect(suggestions).toContain('overdue')
      expect(suggestions).toContain('upcoming')
    })

    it('should return values for assigned field', () => {
      const suggestions = getValueSuggestions('assigned')
      expect(suggestions).toContain('me')
      expect(suggestions).toContain('unassigned')
    })

    it('should return empty array for unknown field', () => {
      const suggestions = getValueSuggestions('unknown')
      expect(suggestions).toEqual([])
    })
  })

  describe('formatFilterQuery', () => {
    it('should format AND keyword', () => {
      const result = formatFilterQuery('priority:p1 AND status:active')
      expect(result).toContain('<strong>AND</strong>')
    })

    it('should format OR keyword', () => {
      const result = formatFilterQuery('priority:p1 OR priority:p2')
      expect(result).toContain('<strong>OR</strong>')
    })

    it('should format NOT keyword', () => {
      const result = formatFilterQuery('NOT status:completed')
      expect(result).toContain('<strong>NOT</strong>')
    })

    it('should format multiple keywords', () => {
      const result = formatFilterQuery('priority:p1 AND status:active OR label:urgent')
      expect(result).toContain('<strong>AND</strong>')
      expect(result).toContain('<strong>OR</strong>')
    })

    it('should preserve original text for non-keywords', () => {
      const result = formatFilterQuery('priority:p1')
      expect(result).toBe('priority:p1')
    })
  })
})
