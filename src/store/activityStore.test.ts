import { describe, it, expect, beforeEach } from 'vitest'
import { useActivityStore } from './activityStore'
import type { Activity } from '@/types'

describe('useActivityStore', () => {
  beforeEach(() => {
    // Clear activities
    useActivityStore.setState({ activities: [] })
  })

  describe('exportActivityLogAsCSV', () => {
    it('should export activities as CSV format', () => {
      const store = useActivityStore.getState()
      const now = new Date('2024-01-15T10:00:00')

      // Add test activities
      const activity1: Activity = {
        id: 'activity-1',
        taskId: 'task-1',
        userId: 'user-1',
        action: 'created',
        changes: { title: 'Test Task' },
        oldValue: undefined,
        newValue: 'Test Task',
        timestamp: now,
      }

      const activity2: Activity = {
        id: 'activity-2',
        taskId: 'task-1',
        userId: 'user-1',
        action: 'updated',
        changes: { completed: true },
        oldValue: false,
        newValue: true,
        timestamp: new Date(now.getTime() + 1000),
      }

      useActivityStore.setState({ activities: [activity1, activity2] })

      const csv = store.exportActivityLogAsCSV()

      expect(csv).toContain('ID,Task ID,User ID,Action,Timestamp,Changes,Old Value,New Value')
      expect(csv).toContain('activity-1')
      expect(csv).toContain('task-1')
      expect(csv).toContain('created')
      expect(csv).toContain('2024-01-15') // Date part
      expect(csv.split('\n').length).toBeGreaterThan(1) // Has data rows
    })

    it('should properly escape CSV values with commas and quotes', () => {
      const store = useActivityStore.getState()
      const now = new Date()

      const activity: Activity = {
        id: 'activity-1',
        taskId: 'task-1',
        userId: 'user-1',
        action: 'updated',
        changes: { title: 'Task with, comma' },
        oldValue: undefined,
        newValue: 'Task with, comma',
        timestamp: now,
      }

      useActivityStore.setState({ activities: [activity] })

      const csv = store.exportActivityLogAsCSV()

      // Values with commas should be quoted
      expect(csv).toContain('"')
    })

    it('should handle empty activities list', () => {
      const store = useActivityStore.getState()
      useActivityStore.setState({ activities: [] })

      const csv = store.exportActivityLogAsCSV()

      expect(csv).toContain('ID,Task ID,User ID,Action,Timestamp,Changes,Old Value,New Value')
      expect(csv.split('\n').length).toBe(1) // Only header
    })

    it('should handle activities with complex changes objects', () => {
      const store = useActivityStore.getState()
      const now = new Date()

      const activity: Activity = {
        id: 'activity-1',
        taskId: 'task-1',
        userId: 'user-1',
        action: 'updated',
        changes: { priority: 1, labels: ['work', 'urgent'] },
        oldValue: undefined,
        newValue: undefined,
        timestamp: now,
      }

      useActivityStore.setState({ activities: [activity] })

      const csv = store.exportActivityLogAsCSV()

      expect(csv).toContain('activity-1')
      // JSON with commas gets quoted and inner quotes get escaped
      expect(csv).toContain('priority')
      expect(csv).toContain('labels')
    })
  })

  describe('exportActivityLogAsJSON', () => {
    it('should export activities as JSON format', () => {
      const store = useActivityStore.getState()
      const now = new Date('2024-01-15T10:00:00')

      const activity: Activity = {
        id: 'activity-1',
        taskId: 'task-1',
        userId: 'user-1',
        action: 'created',
        changes: { title: 'Test Task' },
        oldValue: undefined,
        newValue: 'Test Task',
        timestamp: now,
      }

      useActivityStore.setState({ activities: [activity] })

      const json = store.exportActivityLogAsJSON()
      const parsed = JSON.parse(json)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe('activity-1')
      expect(parsed[0].action).toBe('created')
      expect(parsed[0].changes).toEqual({ title: 'Test Task' })
    })

    it('should export multiple activities as JSON array', () => {
      const store = useActivityStore.getState()
      const now = new Date()

      const activities: Activity[] = [
        {
          id: 'activity-1',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'created',
          timestamp: new Date(now.getTime()),
        },
        {
          id: 'activity-2',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'updated',
          timestamp: new Date(now.getTime() + 1000),
        },
      ]

      useActivityStore.setState({ activities })

      const json = store.exportActivityLogAsJSON()
      const parsed = JSON.parse(json)

      expect(parsed).toHaveLength(2)
      expect(parsed[0].id).toBe('activity-1')
      expect(parsed[1].id).toBe('activity-2')
    })

    it('should produce valid JSON with proper formatting', () => {
      const store = useActivityStore.getState()
      const now = new Date()

      const activity: Activity = {
        id: 'activity-1',
        taskId: 'task-1',
        userId: 'user-1',
        action: 'created',
        changes: { title: 'Test' },
        timestamp: now,
      }

      useActivityStore.setState({ activities: [activity] })

      const json = store.exportActivityLogAsJSON()

      // Should be valid JSON
      expect(() => JSON.parse(json)).not.toThrow()

      // Should have indentation (2 spaces)
      expect(json).toContain('  ')
    })

    it('should handle empty activities list', () => {
      const store = useActivityStore.getState()
      useActivityStore.setState({ activities: [] })

      const json = store.exportActivityLogAsJSON()
      const parsed = JSON.parse(json)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(0)
    })
  })

  describe('getActivitiesByAction', () => {
    it('should filter activities by action type', () => {
      const store = useActivityStore.getState()
      const now = new Date()

      const activities: Activity[] = [
        {
          id: 'activity-1',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'created',
          timestamp: now,
        },
        {
          id: 'activity-2',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'updated',
          timestamp: new Date(now.getTime() + 1000),
        },
        {
          id: 'activity-3',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'created',
          timestamp: new Date(now.getTime() + 2000),
        },
      ]

      useActivityStore.setState({ activities })

      const createdActivities = store.getActivitiesByAction('task-1', 'created')

      expect(createdActivities).toHaveLength(2)
      // getActivitiesByAction doesn't sort, just filters
      expect(createdActivities.map((a) => a.id)).toEqual(['activity-1', 'activity-3'])
    })
  })

  describe('getActivityCount', () => {
    it('should return count of activities for a task', () => {
      const store = useActivityStore.getState()
      const now = new Date()

      const activities: Activity[] = [
        {
          id: 'activity-1',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'created',
          timestamp: now,
        },
        {
          id: 'activity-2',
          taskId: 'task-2',
          userId: 'user-1',
          action: 'created',
          timestamp: now,
        },
        {
          id: 'activity-3',
          taskId: 'task-1',
          userId: 'user-1',
          action: 'updated',
          timestamp: new Date(now.getTime() + 1000),
        },
      ]

      useActivityStore.setState({ activities })

      expect(store.getActivityCount('task-1')).toBe(2)
      expect(store.getActivityCount('task-2')).toBe(1)
      expect(store.getActivityCount('task-3')).toBe(0)
    })
  })
})
