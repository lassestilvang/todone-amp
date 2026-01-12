import { describe, it, expect } from 'vitest'
import { getQuadrant } from '@/utils/eisenhower'
import type { Task } from '@/types'

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  content: 'Test task',
  priority: 'p4',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
  ...overrides,
})

describe('getQuadrant', () => {
  describe('Do First (Urgent & Important)', () => {
    it('returns do-first for p1 priority tasks', () => {
      const task = createMockTask({ priority: 'p1' })
      expect(getQuadrant(task)).toBe('do-first')
    })

    it('returns do-first for p2 priority tasks', () => {
      const task = createMockTask({ priority: 'p2' })
      expect(getQuadrant(task)).toBe('do-first')
    })

    it('returns do-first for overdue tasks with important label', () => {
      const task = createMockTask({
        priority: 'p3',
        dueDate: new Date('2020-01-01'),
        labels: ['important'],
      })
      expect(getQuadrant(task)).toBe('do-first')
    })

    it('returns do-first for tasks due today with important label', () => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const task = createMockTask({
        priority: 'p3',
        dueDate: today,
        labels: ['important'],
      })
      expect(getQuadrant(task)).toBe('do-first')
    })
  })

  describe('Schedule (Important, Not Urgent)', () => {
    it('returns schedule for important tasks without urgent due date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const task = createMockTask({
        priority: 'p3',
        dueDate: futureDate,
        labels: ['important'],
      })
      expect(getQuadrant(task)).toBe('schedule')
    })

    it('returns schedule for important tasks with no due date', () => {
      const task = createMockTask({
        priority: 'p3',
        dueDate: undefined,
        labels: ['important'],
      })
      expect(getQuadrant(task)).toBe('schedule')
    })
  })

  describe('Delegate (Urgent, Not Important)', () => {
    it('returns delegate for overdue tasks without important label', () => {
      const task = createMockTask({
        priority: 'p3',
        dueDate: new Date('2020-01-01'),
        labels: [],
      })
      expect(getQuadrant(task)).toBe('delegate')
    })

    it('returns delegate for tasks due today without high priority', () => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const task = createMockTask({
        priority: 'p4',
        dueDate: today,
        labels: [],
      })
      expect(getQuadrant(task)).toBe('delegate')
    })
  })

  describe('Eliminate (Not Urgent & Not Important)', () => {
    it('returns eliminate for p4 tasks with no due date', () => {
      const task = createMockTask({
        priority: 'p4',
        dueDate: undefined,
        labels: [],
      })
      expect(getQuadrant(task)).toBe('eliminate')
    })

    it('returns eliminate for p3 tasks with future due date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const task = createMockTask({
        priority: 'p3',
        dueDate: futureDate,
        labels: [],
      })
      expect(getQuadrant(task)).toBe('eliminate')
    })
  })
})
