import { describe, it, expect } from 'vitest'
import {
  extractEntities,
  removeEntitiesFromText,
  suggestProjectFromContent,
  suggestLabelsFromContent,
} from './entityExtractor'

describe('entityExtractor', () => {
  const mockProjects = [
    { id: 'p1', name: 'Work' },
    { id: 'p2', name: 'Personal' },
    { id: 'p3', name: 'Shopping' },
  ]

  const mockLabels = [
    { id: 'l1', name: 'urgent' },
    { id: 'l2', name: 'health' },
    { id: 'l3', name: 'finance' },
  ]

  describe('extractEntities', () => {
    describe('priority extraction', () => {
      it('extracts p1 priority', () => {
        const result = extractEntities('fix bug p1', [], [])
        expect(result.priority).toBe('p1')
      })

      it('extracts p2 priority', () => {
        const result = extractEntities('review code p2', [], [])
        expect(result.priority).toBe('p2')
      })

      it('extracts !!! as p1', () => {
        const result = extractEntities('critical fix !!!', [], [])
        expect(result.priority).toBe('p1')
      })

      it('extracts !! as p2', () => {
        const result = extractEntities('important task !!', [], [])
        expect(result.priority).toBe('p2')
      })

      it('extracts "urgent" as p1', () => {
        const result = extractEntities('urgent meeting', [], [])
        expect(result.priority).toBe('p1')
      })

      it('extracts "high priority" as p2', () => {
        const result = extractEntities('high priority task', [], [])
        expect(result.priority).toBe('p2')
      })

      it('extracts "low" as p4', () => {
        const result = extractEntities('low priority cleanup', [], [])
        expect(result.priority).toBe('p4')
      })
    })

    describe('project extraction', () => {
      it('extracts project by hashtag', () => {
        const result = extractEntities('fix bug #work', mockProjects, [])
        expect(result.projectName).toBe('Work')
      })

      it('matches project case-insensitively', () => {
        const result = extractEntities('task #WORK', mockProjects, [])
        expect(result.projectName).toBe('Work')
      })

      it('extracts project by partial match', () => {
        const result = extractEntities('buy items #shop', mockProjects, [])
        expect(result.projectName).toBe('Shopping')
      })

      it('extracts project by "for project" pattern', () => {
        const result = extractEntities('complete task for work', mockProjects, [])
        expect(result.projectName).toBe('Work')
      })
    })

    describe('label extraction', () => {
      it('extracts label by @mention', () => {
        const result = extractEntities('fix bug @urgent', [], mockLabels)
        expect(result.labelNames).toContain('urgent')
      })

      it('extracts multiple labels', () => {
        const result = extractEntities('task @urgent @health', [], mockLabels)
        expect(result.labelNames).toContain('urgent')
        expect(result.labelNames).toContain('health')
      })

      it('matches labels case-insensitively', () => {
        const result = extractEntities('task @URGENT', [], mockLabels)
        expect(result.labelNames).toContain('urgent')
      })
    })

    describe('duration extraction', () => {
      it('extracts "30 minutes"', () => {
        const result = extractEntities('meeting 30 minutes', [], [])
        expect(result.duration).toBe(30)
      })

      it('extracts "2 hours"', () => {
        const result = extractEntities('workshop 2 hours', [], [])
        expect(result.duration).toBe(120)
      })

      it('extracts "quick"', () => {
        const result = extractEntities('quick call', [], [])
        expect(result.duration).toBe(15)
      })

      it('extracts "half hour"', () => {
        const result = extractEntities('half hour meeting', [], [])
        expect(result.duration).toBe(30)
      })
    })

    describe('recurrence extraction', () => {
      it('extracts "daily"', () => {
        const result = extractEntities('standup daily', [], [])
        expect(result.recurrence?.frequency).toBe('daily')
        expect(result.recurrence?.interval).toBe(1)
      })

      it('extracts "weekly"', () => {
        const result = extractEntities('review weekly', [], [])
        expect(result.recurrence?.frequency).toBe('weekly')
      })

      it('extracts "every day"', () => {
        const result = extractEntities('exercise every day', [], [])
        expect(result.recurrence?.frequency).toBe('daily')
      })

      it('extracts "biweekly"', () => {
        const result = extractEntities('meeting biweekly', [], [])
        expect(result.recurrence?.frequency).toBe('biweekly')
      })

      it('extracts "monthly"', () => {
        const result = extractEntities('report monthly', [], [])
        expect(result.recurrence?.frequency).toBe('monthly')
      })
    })
  })

  describe('removeEntitiesFromText', () => {
    it('removes priority markers', () => {
      expect(removeEntitiesFromText('fix bug p1')).toBe('fix bug')
      expect(removeEntitiesFromText('task !!!')).toBe('task')
    })

    it('removes hashtag projects', () => {
      expect(removeEntitiesFromText('task #work')).toBe('task')
    })

    it('removes @mentions', () => {
      expect(removeEntitiesFromText('task @urgent @health')).toBe('task')
    })

    it('removes duration markers', () => {
      expect(removeEntitiesFromText('meeting 30 minutes')).toBe('meeting')
    })

    it('removes recurrence markers', () => {
      expect(removeEntitiesFromText('standup daily')).toBe('standup')
    })

    it('cleans up extra whitespace', () => {
      expect(removeEntitiesFromText('task   #work   p1')).toBe('task')
    })
  })

  describe('suggestProjectFromContent', () => {
    const projectsWithKeywords = [
      { id: 'p1', name: 'Work', keywords: ['office', 'meeting', 'deadline'] },
      { id: 'p2', name: 'Personal', keywords: ['home', 'family', 'self'] },
    ]

    it('suggests project based on name match', () => {
      const result = suggestProjectFromContent('complete work task', projectsWithKeywords)
      expect(result?.projectId).toBe('p1')
    })

    it('suggests project based on keywords', () => {
      const result = suggestProjectFromContent('prepare for office meeting', projectsWithKeywords)
      expect(result?.projectId).toBe('p1')
    })

    it('returns null when no match', () => {
      const result = suggestProjectFromContent('buy groceries', projectsWithKeywords)
      expect(result).toBeNull()
    })
  })

  describe('suggestLabelsFromContent', () => {
    it('suggests labels based on direct mention', () => {
      const result = suggestLabelsFromContent('urgent task', mockLabels)
      expect(result.some((s) => s.labelId === 'l1')).toBe(true)
    })

    it('suggests health label for related content', () => {
      const result = suggestLabelsFromContent('doctor appointment', mockLabels)
      expect(result.some((s) => s.labelId === 'l2')).toBe(true)
    })

    it('suggests finance label for money-related content', () => {
      const result = suggestLabelsFromContent('pay electricity bill', mockLabels)
      expect(result.some((s) => s.labelId === 'l3')).toBe(true)
    })

    it('returns empty for unrelated content', () => {
      const result = suggestLabelsFromContent('buy groceries', mockLabels)
      expect(result.length).toBe(0)
    })
  })
})
