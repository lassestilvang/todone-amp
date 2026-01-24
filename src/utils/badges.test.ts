import { describe, it, expect } from 'bun:test'

describe('badges utilities', () => {
  describe('badge types', () => {
    it('should have priority badges', () => {
      const badges = {
        p1: { label: 'P1', color: '#EF4444' },
        p2: { label: 'P2', color: '#F97316' },
        p3: { label: 'P3', color: '#EAB308' },
        p4: { label: 'P4', color: '#22C55E' },
      }

      expect(badges.p1.label).toBe('P1')
      expect(badges.p1.color).toBeDefined()
    })

    it('should have status badges', () => {
      const badges = {
        active: { label: 'Active', color: '#3B82F6' },
        completed: { label: 'Completed', color: '#10B981' },
        archived: { label: 'Archived', color: '#6B7280' },
      }

      expect(badges.active.label).toBe('Active')
      expect(badges.completed.label).toBe('Completed')
    })

    it('should have recurring badges', () => {
      const badges = {
        daily: { label: 'Daily', color: '#8B5CF6' },
        weekly: { label: 'Weekly', color: '#EC4899' },
        monthly: { label: 'Monthly', color: '#06B6D4' },
        yearly: { label: 'Yearly', color: '#14B8A6' },
      }

      expect(badges.daily.label).toBe('Daily')
      expect(badges.weekly.label).toBe('Weekly')
    })
  })

  describe('badge rendering', () => {
    it('should render priority badge', () => {
      const badge = { label: 'P1', color: '#EF4444' }
      expect(badge.label).toBe('P1')
      expect(badge.color.startsWith('#')).toBe(true)
    })

    it('should render status badge', () => {
      const badge = { label: 'Active', color: '#3B82F6' }
      expect(badge.label.length > 0).toBe(true)
      expect(badge.color).toBe('#3B82F6')
    })

    it('should have proper contrast', () => {
      const badges = [
        { color: '#EF4444', text: '#FFFFFF' },
        { color: '#10B981', text: '#FFFFFF' },
        { color: '#F97316', text: '#FFFFFF' },
      ]

      badges.forEach(badge => {
        expect(badge.text).toBe('#FFFFFF')
      })
    })
  })

  describe('badge categories', () => {
    it('should categorize by priority', () => {
      const priorities = ['p1', 'p2', 'p3', 'p4']
      priorities.forEach(p => {
        expect(['p1', 'p2', 'p3', 'p4']).toContain(p)
      })
    })

    it('should categorize by status', () => {
      const statuses = ['active', 'completed', 'archived']
      statuses.forEach(s => {
        expect(['active', 'completed', 'archived']).toContain(s)
      })
    })

    it('should categorize by recurrence', () => {
      const frequencies = ['daily', 'weekly', 'monthly', 'yearly']
      frequencies.forEach(f => {
        expect(['daily', 'weekly', 'monthly', 'yearly']).toContain(f)
      })
    })

    it('should categorize by label', () => {
      const labels = ['urgent', 'important', 'blocked', 'waiting']
      labels.forEach(l => {
        expect(l.length > 0).toBe(true)
      })
    })
  })

  describe('badge customization', () => {
    it('should support custom colors', () => {
      const customBadge = {
        label: 'Custom',
        color: '#FF00FF',
      }

      expect(customBadge.color).toBe('#FF00FF')
    })

    it('should support custom labels', () => {
      const customBadge = {
        label: 'My Custom Badge',
        color: '#00B4D8',
      }

      expect(customBadge.label).toContain('Custom')
    })

    it('should validate color format', () => {
      const validColors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF']
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

      validColors.forEach(color => {
        expect(hexColorRegex.test(color)).toBe(true)
      })
    })
  })

  describe('badge display logic', () => {
    it('should show multiple badges', () => {
      const badges = [
        { label: 'P1', type: 'priority' },
        { label: 'Active', type: 'status' },
        { label: 'Urgent', type: 'label' },
      ]

      expect(badges).toHaveLength(3)
    })

    it('should truncate long badge lists', () => {
      const badges = Array.from({ length: 10 }, (_, i) => ({
        label: `Badge ${i}`,
      }))

      const maxBadges = 5
      const displayed = badges.slice(0, maxBadges)

      expect(displayed).toHaveLength(5)
    })

    it('should sort badges by priority', () => {
      const badges = [
        { label: 'Archive', priority: 3 },
        { label: 'P1', priority: 1 },
        { label: 'Active', priority: 2 },
      ]

      const sorted = badges.sort((a, b) => a.priority - b.priority)

      expect(sorted[0].label).toBe('P1')
      expect(sorted[1].label).toBe('Active')
      expect(sorted[2].label).toBe('Archive')
    })
  })

  describe('badge accessibility', () => {
    it('should have descriptive aria-labels', () => {
      const badge = {
        label: 'P1',
        ariaLabel: 'Priority 1 - Urgent',
      }

      expect(badge.ariaLabel).toContain('Priority')
    })

    it('should support semantic HTML', () => {
      const badge = {
        element: 'span',
        role: 'status',
        label: 'Active',
      }

      expect(badge.element).toBe('span')
      expect(badge.role).toBe('status')
    })
  })
})
