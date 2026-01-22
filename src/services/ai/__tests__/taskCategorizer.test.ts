import { describe, it, expect } from 'vitest'
import {
  suggestCategory,
  suggestProject,
  suggestLabels,
  suggestTaskGrouping,
  groupTasksByCategory,
  findSimilarTasks,
} from '../taskCategorizer'
import type { Task } from '@/types'

describe('taskCategorizer', () => {
  describe('suggestCategory', () => {
    it('returns null for empty content', () => {
      expect(suggestCategory('')).toBeNull()
      expect(suggestCategory('   ')).toBeNull()
    })

    it('detects work-related tasks', () => {
      const result = suggestCategory('Prepare slides for the meeting tomorrow')
      expect(result).not.toBeNull()
      expect(result?.category).toBe('work')
      expect(result?.confidence).toBeGreaterThan(0.7)
    })

    it('detects development work tasks', () => {
      const result = suggestCategory('Fix bug in user authentication API')
      expect(result?.category).toBe('work')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects health and fitness tasks', () => {
      const result = suggestCategory('Go to the gym for workout')
      expect(result?.category).toBe('health')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects medical appointments', () => {
      const result = suggestCategory('Schedule dentist appointment for checkup')
      expect(result?.category).toBe('health')
      expect(result?.confidence).toBeGreaterThan(0.9)
    })

    it('detects finance tasks', () => {
      const result = suggestCategory('Pay electricity bill')
      expect(result?.category).toBe('finance')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects home chores', () => {
      const result = suggestCategory('Do laundry and vacuum the living room')
      expect(result?.category).toBe('home')
      expect(result?.confidence).toBeGreaterThan(0.85)
    })

    it('detects learning tasks', () => {
      const result = suggestCategory('Study for the certification exam')
      expect(result?.category).toBe('learning')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects social tasks', () => {
      const result = suggestCategory('Dinner with friends on Saturday')
      expect(result?.category).toBe('social')
      expect(result?.confidence).toBeGreaterThan(0.75)
    })

    it('detects errands', () => {
      const result = suggestCategory('Buy groceries at the store')
      expect(result?.category).toBe('errands')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects creative tasks', () => {
      const result = suggestCategory('Edit video for YouTube channel')
      expect(result?.category).toBe('creative')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects admin tasks', () => {
      const result = suggestCategory('Renew passport application')
      expect(result?.category).toBe('admin')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('detects personal tasks', () => {
      const result = suggestCategory('Buy birthday gift for mom')
      expect(result?.category).toBe('personal')
      expect(result?.confidence).toBeGreaterThan(0.8)
    })

    it('combines confidences for multiple pattern matches', () => {
      const result = suggestCategory('Meeting with client to review presentation')
      expect(result?.category).toBe('work')
      // Should have higher confidence due to multiple matches
      expect(result?.matchedPatterns.length).toBeGreaterThan(1)
    })
  })

  describe('suggestProject', () => {
    const projects = [
      { id: 'proj-1', name: 'Website Redesign' },
      { id: 'proj-2', name: 'Mobile App' },
      { id: 'proj-3', name: 'Home Renovation' },
      { id: 'proj-4', name: 'Q1 Marketing' },
    ]

    it('returns null for empty content', () => {
      const result = suggestProject({ taskContent: '' }, projects)
      expect(result).toBeNull()
    })

    it('returns null when no projects provided', () => {
      const result = suggestProject({ taskContent: 'Fix website bug' }, [])
      expect(result).toBeNull()
    })

    it('matches project by name', () => {
      const result = suggestProject({ taskContent: 'Update website redesign homepage' }, projects)
      expect(result).not.toBeNull()
      expect(result?.value.projectId).toBe('proj-1')
      expect(result?.value.projectName).toBe('Website Redesign')
    })

    it('matches project by keyword', () => {
      const result = suggestProject({ taskContent: 'Fix mobile navigation issue' }, projects)
      expect(result?.value.projectId).toBe('proj-2')
    })

    it('matches project with word boundary', () => {
      const result = suggestProject({ taskContent: 'Plan marketing campaign for Q1' }, projects)
      expect(result?.value.projectId).toBe('proj-4')
    })

    it('returns matched keywords', () => {
      const result = suggestProject(
        { taskContent: 'Redesign the website header' },
        projects
      )
      expect(result?.value.matchedKeywords.length).toBeGreaterThan(0)
    })

    it('provides reasoning', () => {
      const result = suggestProject({ taskContent: 'Mobile app login screen' }, projects)
      expect(result?.reasoning).toContain('mobile')
    })
  })

  describe('suggestLabels', () => {
    const existingLabels = ['urgent', 'work', 'personal']

    it('returns null for empty content', () => {
      const result = suggestLabels({ taskContent: '' })
      expect(result).toBeNull()
    })

    it('suggests communication labels', () => {
      const result = suggestLabels({ taskContent: 'Reply to email from client' })
      expect(result?.value.labels).toContain('communication')
    })

    it('suggests call labels', () => {
      const result = suggestLabels({ taskContent: 'Schedule video call with team' })
      expect(result?.value.labels).toContain('call')
    })

    it('suggests quick-task label', () => {
      const result = suggestLabels({ taskContent: 'Quick 5 min review of PR' })
      expect(result?.value.labels).toContain('quick-task')
    })

    it('suggests deep-work label', () => {
      const result = suggestLabels({ taskContent: 'Deep work session on architecture' })
      expect(result?.value.labels).toContain('deep-work')
    })

    it('suggests waiting label', () => {
      const result = suggestLabels({ taskContent: 'Waiting for approval from manager' })
      expect(result?.value.labels).toContain('waiting')
    })

    it('suggests urgent label', () => {
      const result = suggestLabels({ taskContent: 'Urgent: Fix production bug ASAP' })
      expect(result?.value.labels).toContain('urgent')
    })

    it('suggests research label', () => {
      const result = suggestLabels({ taskContent: 'Research new authentication libraries' })
      expect(result?.value.labels).toContain('research')
    })

    it('suggests context labels', () => {
      const result = suggestLabels({ taskContent: 'Something I can only do at home' })
      expect(result?.value.labels).toContain('@home')
    })

    it('extracts hashtag labels', () => {
      const result = suggestLabels({ taskContent: 'Review docs #important #review' })
      expect(result?.value.labels).toContain('important')
      expect(result?.value.labels).toContain('review')
    })

    it('identifies new labels', () => {
      const result = suggestLabels(
        { taskContent: 'Research new tools #newtag' },
        existingLabels
      )
      expect(result?.value.newLabelsDetected).toContain('newtag')
      expect(result?.value.newLabelsDetected).toContain('research')
    })

    it('does not mark existing labels as new', () => {
      const result = suggestLabels(
        { taskContent: 'Urgent task for work' },
        existingLabels
      )
      expect(result?.value.newLabelsDetected).not.toContain('urgent')
    })

    it('includes category as label when confidence is high', () => {
      const result = suggestLabels({ taskContent: 'Go to gym for workout session' })
      expect(result?.value.labels).toContain('health')
    })
  })

  describe('suggestTaskGrouping', () => {
    const projects = [
      { id: 'proj-1', name: 'Website' },
      { id: 'proj-2', name: 'Marketing' },
    ]
    const existingLabels = ['urgent', 'review']

    it('returns all suggestion types', () => {
      const result = suggestTaskGrouping(
        { content: 'Update website homepage #urgent', description: 'Quick fix needed' },
        { projects, existingLabels }
      )

      expect(result.category).not.toBeNull()
      expect(result.project).not.toBeNull()
      expect(result.labels).not.toBeNull()
    })

    it('combines content and description', () => {
      const result = suggestTaskGrouping(
        { content: 'Task', description: 'Go to gym for workout' },
        { projects, existingLabels }
      )

      expect(result.category?.category).toBe('health')
    })
  })

  describe('groupTasksByCategory', () => {
    const tasks: Task[] = [
      createMockTask('1', 'Fix bug in API'),
      createMockTask('2', 'Go to gym'),
      createMockTask('3', 'Pay rent'),
      createMockTask('4', 'Random task without clear category'),
      createMockTask('5', 'Team meeting tomorrow'),
    ]

    it('groups tasks by detected category', () => {
      const groups = groupTasksByCategory(tasks)

      expect(groups.get('work')?.length).toBeGreaterThanOrEqual(2)
      expect(groups.get('health')?.length).toBe(1)
      expect(groups.get('finance')?.length).toBe(1)
    })

    it('puts unclear tasks in uncategorized', () => {
      const groups = groupTasksByCategory(tasks)
      const uncategorized = groups.get('uncategorized')
      expect(uncategorized?.some((t) => t.content.includes('Random'))).toBe(true)
    })
  })

  describe('findSimilarTasks', () => {
    const tasks: Task[] = [
      createMockTask('1', 'Fix login bug', ['bug', 'auth'], 'proj-1'),
      createMockTask('2', 'Fix logout bug', ['bug', 'auth'], 'proj-1'),
      createMockTask('3', 'Add new feature', ['feature'], 'proj-2'),
      createMockTask('4', 'Fix authentication issue', ['bug'], 'proj-1'),
      createMockTask('5', 'Update login page design', ['design'], 'proj-1'),
    ]

    it('finds similar tasks based on content', () => {
      const target = { content: 'Fix login issue', labels: [], projectId: undefined }
      const similar = findSimilarTasks(target, tasks)

      expect(similar.length).toBeGreaterThan(0)
      expect(similar[0].task.content).toContain('login')
    })

    it('considers label overlap', () => {
      const target = { content: 'Something', labels: ['bug', 'auth'], projectId: undefined }
      const similar = findSimilarTasks(target, tasks)

      const hasAuthBugTasks = similar.some(
        (s) => s.task.labels.includes('bug') && s.task.labels.includes('auth')
      )
      expect(hasAuthBugTasks).toBe(true)
    })

    it('gives bonus for same project', () => {
      const target = { content: 'Work on something', labels: [], projectId: 'proj-1' }
      const similar = findSimilarTasks(target, tasks)

      const proj1Tasks = similar.filter((s) => s.task.projectId === 'proj-1')
      expect(proj1Tasks.length).toBeGreaterThan(0)
    })

    it('respects limit parameter', () => {
      const target = { content: 'Fix bug', labels: ['bug'], projectId: 'proj-1' }
      const similar = findSimilarTasks(target, tasks, 2)

      expect(similar.length).toBeLessThanOrEqual(2)
    })

    it('excludes exact same content', () => {
      const target = { content: 'Fix login bug', labels: [], projectId: undefined }
      const similar = findSimilarTasks(target, tasks)

      expect(similar.every((s) => s.task.content !== target.content)).toBe(true)
    })
  })
})

function createMockTask(
  id: string,
  content: string,
  labels: string[] = [],
  projectId?: string
): Task {
  return {
    id,
    content,
    labels,
    projectId,
    priority: null,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0,
    reminders: [],
    attachments: [],
  }
}
