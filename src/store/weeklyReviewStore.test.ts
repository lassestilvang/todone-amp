import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { useWeeklyReviewStore } from './weeklyReviewStore'
import type { Task, Project } from '@/types'

mock.module('@/db/database', () => ({
  db: {
    tasks: {
      toArray: mock(() => Promise.resolve([])),
    },
    projects: {
      where: mock(function (this: unknown) { return this }),
      equals: mock(function (this: unknown) { return this }),
      toArray: mock(() => Promise.resolve([])),
    },
    userStats: {
      get: mock(() => Promise.resolve(null)),
    },
  },
}))

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  content: 'Test Task',
  priority: 'p4',
  completed: false,
  createdAt: new Date('2025-01-13'),
  updatedAt: new Date('2025-01-13'),
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
  ...overrides,
})

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project-1',
  name: 'Test Project',
  color: '#3b82f6',
  viewType: 'list',
  isFavorite: false,
  isShared: false,
  ownerId: 'user-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  order: 0,
  archived: false,
  ...overrides,
})

describe('weeklyReviewStore', () => {
  beforeEach(() => {
    useWeeklyReviewStore.setState({
      metrics: null,
      completedTasks: [],
      slippedTasks: [],
      upcomingTasks: [],
      topProjects: [],
      loading: false,
      error: null,
      weekStart: new Date(),
      weekEnd: new Date(),
    })
  })

  describe('getWeekBoundaries', () => {
    it('returns start on Monday and end on Sunday for current week', () => {
      const store = useWeeklyReviewStore.getState()
      const { start, end } = store.getWeekBoundaries(0)

      expect(start.getDay()).toBe(1)
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)

      expect(end.getDay()).toBe(0)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(end.getSeconds()).toBe(59)
    })

    it('returns correct week for negative offset (previous week)', () => {
      const store = useWeeklyReviewStore.getState()
      const { start: currentStart } = store.getWeekBoundaries(0)
      const { start: prevStart } = store.getWeekBoundaries(-1)

      const diffDays =
        (currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(7)
    })

    it('returns correct week for positive offset (next week)', () => {
      const store = useWeeklyReviewStore.getState()
      const { start: currentStart } = store.getWeekBoundaries(0)
      const { start: nextStart } = store.getWeekBoundaries(1)

      const diffDays =
        (nextStart.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(7)
    })

    it('week span is exactly 7 days', () => {
      const store = useWeeklyReviewStore.getState()
      const { start, end } = store.getWeekBoundaries(0)

      const diffMs = end.getTime() - start.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      expect(diffDays).toBeCloseTo(7, 0)
    })
  })

  describe('calculateMetrics', () => {
    const weekStart = new Date('2025-01-13T00:00:00')
    const weekEnd = new Date('2025-01-19T23:59:59')

    it('calculates tasksCompleted count correctly', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          completedAt: new Date('2025-01-15'),
        }),
        createMockTask({
          id: 'task-3',
          completed: true,
          completedAt: new Date('2025-01-10'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.tasksCompleted).toBe(2)
    })

    it('calculates tasksCreated count correctly', () => {
      const tasks = [
        createMockTask({ id: 'task-1', createdAt: new Date('2025-01-14') }),
        createMockTask({ id: 'task-2', createdAt: new Date('2025-01-15') }),
        createMockTask({ id: 'task-3', createdAt: new Date('2025-01-10') }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.tasksCreated).toBe(2)
    })

    it('calculates completionRate percentage correctly', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          completedAt: new Date('2025-01-15'),
        }),
        createMockTask({
          id: 'task-3',
          completed: false,
          dueDate: new Date('2025-01-16'),
        }),
        createMockTask({
          id: 'task-4',
          completed: false,
          dueDate: new Date('2025-01-17'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.completionRate).toBe(50)
    })

    it('calculates averageCompletionTime in hours', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          createdAt: new Date('2025-01-14T10:00:00'),
          completedAt: new Date('2025-01-14T14:00:00'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          createdAt: new Date('2025-01-15T08:00:00'),
          completedAt: new Date('2025-01-15T10:00:00'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.averageCompletionTime).toBe(3)
    })

    it('identifies busiestDay correctly', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-14T10:00:00'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          completedAt: new Date('2025-01-14T14:00:00'),
        }),
        createMockTask({
          id: 'task-3',
          completed: true,
          completedAt: new Date('2025-01-14T16:00:00'),
        }),
        createMockTask({
          id: 'task-4',
          completed: true,
          completedAt: new Date('2025-01-15T10:00:00'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.busiestDay).toBe('Tuesday')
    })

    it('identifies topProject correctly', () => {
      const projects = [
        createMockProject({ id: 'project-1', name: 'Project A' }),
        createMockProject({ id: 'project-2', name: 'Project B' }),
      ]
      const tasks = [
        createMockTask({
          id: 'task-1',
          projectId: 'project-1',
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          projectId: 'project-1',
          completed: true,
          completedAt: new Date('2025-01-15'),
        }),
        createMockTask({
          id: 'task-3',
          projectId: 'project-2',
          completed: true,
          completedAt: new Date('2025-01-16'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, projects, weekStart, weekEnd)

      expect(metrics.topProject).toEqual({ name: 'Project A', tasksCompleted: 2 })
    })

    it('calculates karmaEarned with priority multipliers', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          priority: 'p1',
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          priority: 'p2',
          completed: true,
          completedAt: new Date('2025-01-15'),
        }),
        createMockTask({
          id: 'task-3',
          priority: 'p3',
          completed: true,
          completedAt: new Date('2025-01-16'),
        }),
        createMockTask({
          id: 'task-4',
          priority: 'p4',
          completed: true,
          completedAt: new Date('2025-01-17'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.karmaEarned).toBe(30 + 20 + 15 + 10)
    })

    it('calculates comparedToLastWeek differences correctly', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          completedAt: new Date('2025-01-15'),
        }),
      ]

      const previousWeekMetrics = { completed: 5, completionRate: 80 }

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(
        tasks,
        [],
        weekStart,
        weekEnd,
        previousWeekMetrics
      )

      expect(metrics.comparedToLastWeek.tasksCompleted).toBe(-3)
      expect(metrics.comparedToLastWeek.completionRate).toBe(100 - 80)
    })

    it('returns tasksCompleted as difference when no previous week metrics', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.comparedToLastWeek.tasksCompleted).toBe(1)
      expect(metrics.comparedToLastWeek.completionRate).toBe(0)
    })
  })

  describe('edge cases', () => {
    const weekStart = new Date('2025-01-13T00:00:00')
    const weekEnd = new Date('2025-01-19T23:59:59')

    it('handles empty task list', () => {
      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics([], [], weekStart, weekEnd)

      expect(metrics.tasksCompleted).toBe(0)
      expect(metrics.tasksCreated).toBe(0)
      expect(metrics.completionRate).toBe(0)
      expect(metrics.averageCompletionTime).toBe(0)
      expect(metrics.busiestDay).toBe('N/A')
      expect(metrics.topProject).toBeNull()
      expect(metrics.karmaEarned).toBe(0)
    })

    it('handles week with no completions', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: false,
          dueDate: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          completed: false,
          dueDate: new Date('2025-01-15'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.tasksCompleted).toBe(0)
      expect(metrics.completionRate).toBe(0)
      expect(metrics.busiestDay).toBe('N/A')
      expect(metrics.karmaEarned).toBe(0)
    })

    it('handles week with all tasks completed', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-14'),
          dueDate: new Date('2025-01-14'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          completedAt: new Date('2025-01-15'),
          dueDate: new Date('2025-01-15'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.tasksCompleted).toBe(2)
      expect(metrics.completionRate).toBe(100)
    })

    it('handles tasks without projectId for topProject', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          projectId: undefined,
          completed: true,
          completedAt: new Date('2025-01-14'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.topProject).toBeNull()
    })

    it('handles tasks completed at week boundaries', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          completed: true,
          completedAt: new Date('2025-01-13T00:00:00'),
        }),
        createMockTask({
          id: 'task-2',
          completed: true,
          completedAt: new Date('2025-01-19T23:59:59'),
        }),
        createMockTask({
          id: 'task-3',
          completed: true,
          completedAt: new Date('2025-01-12T23:59:59'),
        }),
        createMockTask({
          id: 'task-4',
          completed: true,
          completedAt: new Date('2025-01-20T00:00:01'),
        }),
      ]

      const store = useWeeklyReviewStore.getState()
      const metrics = store.calculateMetrics(tasks, [], weekStart, weekEnd)

      expect(metrics.tasksCompleted).toBe(2)
    })
  })
})
