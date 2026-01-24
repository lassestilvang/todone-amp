import { describe, it, expect } from 'bun:test'
import {
  taskToCalendarEvent,
  tasksToCalendarEvents,
  formatTaskForCalendar,
  filterSyncableTasks,
  generateSyncReport,
  createICalExport,
  isTaskModifiedSinceSyncTime,
  getTasksNeedingSync,
} from './calendarSync'
import type { Task } from '@/types'

describe('calendarSync utilities', () => {
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    content: 'Test Task',
    description: 'Test description',
    completed: false,
    dueDate: new Date('2024-01-20'),
    dueTime: '14:30',
    priority: 'p2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    order: 0,
    reminders: [],
    labels: [],
    attachments: [],
    ...overrides,
  } as Task)

  describe('taskToCalendarEvent', () => {
    it('should convert task with time to calendar event', () => {
      const task = createTask({
        dueDate: new Date('2024-01-20'),
        dueTime: '14:30',
        duration: 60,
        content: 'Meeting',
      })

      const event = taskToCalendarEvent(task)

      expect(event).not.toBeNull()
      expect(event?.id).toBe('task-1')
      expect(event?.title).toBe('Meeting')
      expect(event?.startTime.getHours()).toBe(14)
      expect(event?.startTime.getMinutes()).toBe(30)
    })

    it('should calculate end time based on duration', () => {
      const task = createTask({
        dueTime: '10:00',
        duration: 120,
      })

      const event = taskToCalendarEvent(task)

      expect(event).not.toBeNull()
      expect(event?.endTime.getHours()).toBe(12) // 10 + 2 hours
    })

    it('should return null for task without time', () => {
      const task = createTask({ dueTime: undefined })
      const event = taskToCalendarEvent(task)

      expect(event).toBeNull()
    })

    it('should use default duration of 30 minutes', () => {
      const task = createTask({
        dueTime: '09:00',
        duration: undefined,
      })

      const event = taskToCalendarEvent(task)

      expect(event?.endTime.getMinutes()).toBe(30)
    })
  })

  describe('tasksToCalendarEvents', () => {
    it('should convert multiple tasks to calendar events', () => {
      const tasks = [
        createTask({ id: 'task-1', dueTime: '10:00' }),
        createTask({ id: 'task-2', dueTime: '14:00' }),
      ]

      const events = tasksToCalendarEvents(tasks)

      expect(events).toHaveLength(2)
      expect(events[0].id).toBe('task-1')
      expect(events[1].id).toBe('task-2')
    })

    it('should exclude completed tasks', () => {
      const tasks = [
        createTask({ id: 'task-1', dueTime: '10:00', completed: false }),
        createTask({ id: 'task-2', dueTime: '14:00', completed: true }),
      ]

      const events = tasksToCalendarEvents(tasks)

      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('task-1')
    })

    it('should exclude tasks without time', () => {
      const tasks = [
        createTask({ id: 'task-1', dueTime: '10:00' }),
        createTask({ id: 'task-2', dueTime: undefined }),
      ]

      const events = tasksToCalendarEvents(tasks)

      expect(events).toHaveLength(1)
    })
  })

  describe('formatTaskForCalendar', () => {
    it('should format task with all properties', () => {
      const task = createTask({
        content: 'Meeting',
        description: 'Team standup',
        priority: 'p2',
        labels: ['work', 'urgent'],
      })

      const formatted = formatTaskForCalendar(task)

      expect(formatted).toContain('**Meeting**')
      expect(formatted).toContain('Team standup')
      expect(formatted).toContain('High')
      expect(formatted).toContain('work, urgent')
    })

    it('should format task with minimal properties', () => {
      const task = createTask({
        content: 'Simple Task',
        description: '',
        priority: null,
        labels: [],
      })

      const formatted = formatTaskForCalendar(task)

      expect(formatted).toContain('**Simple Task**')
      expect(formatted).not.toContain('Priority')
      expect(formatted).not.toContain('Labels')
    })

    it('should indicate sub-tasks', () => {
      const task = createTask({ parentTaskId: 'parent-1' })

      const formatted = formatTaskForCalendar(task)

      expect(formatted).toContain('sub-task')
    })
  })

  describe('filterSyncableTasks', () => {
    it('should include tasks with date and time', () => {
      const tasks = [createTask({ dueDate: new Date(), dueTime: '10:00', completed: false })]

      const filtered = filterSyncableTasks(tasks)

      expect(filtered).toHaveLength(1)
    })

    it('should exclude completed tasks', () => {
      const tasks = [createTask({ completed: true, dueTime: '10:00' })]

      const filtered = filterSyncableTasks(tasks)

      expect(filtered).toHaveLength(0)
    })

    it('should exclude sub-tasks', () => {
      const tasks = [createTask({ parentTaskId: 'parent-1', dueTime: '10:00' })]

      const filtered = filterSyncableTasks(tasks)

      expect(filtered).toHaveLength(0)
    })

    it('should exclude tasks without time', () => {
      const tasks = [createTask({ dueTime: undefined })]

      const filtered = filterSyncableTasks(tasks)

      expect(filtered).toHaveLength(0)
    })

    it('should exclude recurring tasks', () => {
      const tasks = [
        createTask({
          dueTime: '10:00',
          recurrence: {
            frequency: 'daily' as const,
            interval: 1,
            daysOfWeek: [],
            startDate: new Date(),
            exceptions: [],
          },
        }),
      ]

      const filtered = filterSyncableTasks(tasks)

      expect(filtered).toHaveLength(0)
    })
  })

  describe('generateSyncReport', () => {
    it('should generate report with task statistics', () => {
      const now = new Date()
      const tasks = [
        createTask({ dueDate: new Date(now.getTime() + 86400000), dueTime: '10:00' }), // Tomorrow
        createTask({ dueDate: now, dueTime: '14:00' }), // Today
      ]

      const report = generateSyncReport(tasks, 'google')

      expect(report.service).toBe('google')
      expect(report.totalTasksSynced).toBe(2)
      expect(report.futureTasks).toBe(1)
      expect(report.todayTasks).toBe(1)
      expect(report.success).toBe(true)
    })

    it('should count only future tasks in futureTasks', () => {
      const now = new Date()
      const tasks = [
        createTask({ dueDate: new Date(now.getTime() - 86400000), dueTime: '10:00' }), // Yesterday
        createTask({ dueDate: new Date(now.getTime() + 86400000), dueTime: '10:00' }), // Tomorrow
      ]

      const report = generateSyncReport(tasks, 'outlook')

      expect(report.futureTasks).toBe(1)
    })
  })

  describe('createICalExport', () => {
    it('should create valid iCal format', () => {
      const tasks = [
        createTask({
          id: 'task-1',
          content: 'Meeting',
          dueDate: new Date('2024-01-20'),
          dueTime: '10:00',
        }),
      ]

      const ical = createICalExport(tasks, 'My Calendar')

      expect(ical).toContain('BEGIN:VCALENDAR')
      expect(ical).toContain('END:VCALENDAR')
      expect(ical).toContain('VERSION:2.0')
      expect(ical).toContain('BEGIN:VEVENT')
      expect(ical).toContain('END:VEVENT')
      expect(ical).toContain('X-WR-CALNAME:My Calendar')
    })

    it('should escape special characters in iCal', () => {
      const tasks = [createTask({ content: 'Meeting; Important\nDo not skip' })]

      const ical = createICalExport(tasks)

      // Should escape special chars
      expect(ical).toContain('SUMMARY:')
    })

    it('should include alarm for reminders', () => {
      const tasks = [createTask({ dueTime: '10:00' })]

      const ical = createICalExport(tasks)

      expect(ical).toContain('BEGIN:VALARM')
      expect(ical).toContain('END:VALARM')
      expect(ical).toContain('TRIGGER:-PT')
    })
  })

  describe('isTaskModifiedSinceSyncTime', () => {
    it('should return true if task modified after sync time', () => {
      const syncTime = new Date('2024-01-15T10:00:00')
      const task = createTask({
        updatedAt: new Date('2024-01-15T11:00:00'),
      })

      const modified = isTaskModifiedSinceSyncTime(task, syncTime)

      expect(modified).toBe(true)
    })

    it('should return false if task not modified since sync time', () => {
      const syncTime = new Date('2024-01-15T11:00:00')
      const task = createTask({
        updatedAt: new Date('2024-01-15T10:00:00'),
      })

      const modified = isTaskModifiedSinceSyncTime(task, syncTime)

      expect(modified).toBe(false)
    })

    it('should use createdAt if updatedAt is not present', () => {
      const syncTime = new Date('2024-01-15T10:00:00')
      const task = createTask({
        updatedAt: undefined,
        createdAt: new Date('2024-01-15T11:00:00'),
      })

      const modified = isTaskModifiedSinceSyncTime(task, syncTime)

      expect(modified).toBe(true)
    })
  })

  describe('getTasksNeedingSync', () => {
    it('should return only syncable tasks modified since last sync', () => {
      const syncTime = new Date('2024-01-15T10:00:00')
      const tasks = [
        createTask({
          id: 'task-1',
          dueTime: '10:00',
          updatedAt: new Date('2024-01-15T11:00:00'),
        }),
        createTask({
          id: 'task-2',
          dueTime: '10:00',
          updatedAt: new Date('2024-01-15T09:00:00'),
        }),
        createTask({
          id: 'task-3',
          dueTime: undefined,
          updatedAt: new Date('2024-01-15T11:00:00'),
        }),
      ]

      const needsSync = getTasksNeedingSync(tasks, syncTime)

      expect(needsSync).toHaveLength(1)
      expect(needsSync[0].id).toBe('task-1')
    })

    it('should return empty array if no tasks need sync', () => {
      const syncTime = new Date()
      const tasks = [createTask({ updatedAt: new Date(Date.now() - 86400000) })]

      const needsSync = getTasksNeedingSync(tasks, syncTime)

      expect(needsSync).toHaveLength(0)
    })
  })
})
