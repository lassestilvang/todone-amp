import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHabitStore, isHabitDueOnDate } from './habitStore'
import type { Habit, HabitCompletion } from '@/types'

vi.mock('@/db/database', () => ({
  db: {
    habits: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    habitCompletions: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      anyOf: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

vi.mock('./gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      addKarma: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

const createMockHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'habit-1',
  userId: 'user-1',
  name: 'Test Habit',
  icon: '💪',
  color: '#3b82f6',
  frequency: 'daily',
  targetCount: 1,
  createdAt: new Date('2025-01-01'),
  ...overrides,
})

const createMockCompletion = (overrides: Partial<HabitCompletion> = {}): HabitCompletion => ({
  id: 'completion-1',
  habitId: 'habit-1',
  date: '2025-01-13',
  count: 1,
  completedAt: new Date('2025-01-13'),
  ...overrides,
})

describe('habitStore', () => {
  beforeEach(() => {
    useHabitStore.setState({
      habits: [],
      completions: [],
      loading: false,
      error: null,
      selectedHabitId: null,
    })
  })

  describe('addHabit', () => {
    it('adds a habit to the store', async () => {
      const habitData = {
        userId: 'user-1',
        name: 'New Habit',
        icon: '💪',
        color: '#3b82f6',
        frequency: 'daily' as const,
        targetCount: 1,
      }

      const store = useHabitStore.getState()
      const result = await store.addHabit(habitData)

      expect(result.name).toBe('New Habit')
      expect(result.id).toMatch(/^habit-/)
      expect(useHabitStore.getState().habits).toHaveLength(1)
    })
  })

  describe('updateHabit', () => {
    it('updates a habit in the store', async () => {
      const habit = createMockHabit()
      useHabitStore.setState({ habits: [habit] })

      await useHabitStore.getState().updateHabit(habit.id, { name: 'Updated Name' })

      const updatedHabit = useHabitStore.getState().habits.find((h) => h.id === habit.id)
      expect(updatedHabit?.name).toBe('Updated Name')
    })

    it('does nothing if habit not found', async () => {
      useHabitStore.setState({ habits: [] })
      await useHabitStore.getState().updateHabit('non-existent', { name: 'Updated' })
      expect(useHabitStore.getState().habits).toHaveLength(0)
    })
  })

  describe('archiveHabit', () => {
    it('sets archivedAt on the habit', async () => {
      const habit = createMockHabit()
      useHabitStore.setState({ habits: [habit] })

      await useHabitStore.getState().archiveHabit(habit.id)

      const archivedHabit = useHabitStore.getState().habits.find((h) => h.id === habit.id)
      expect(archivedHabit?.archivedAt).toBeDefined()
    })
  })

  describe('logCompletion', () => {
    it('creates a new completion entry', async () => {
      const habit = createMockHabit()
      useHabitStore.setState({ habits: [habit], completions: [] })

      await useHabitStore.getState().logCompletion(habit.id, '2025-01-13')

      const completions = useHabitStore.getState().completions
      expect(completions).toHaveLength(1)
      expect(completions[0].habitId).toBe(habit.id)
      expect(completions[0].count).toBe(1)
    })

    it('increments existing completion count', async () => {
      const habit = createMockHabit({ targetCount: 3 })
      const completion = createMockCompletion({ count: 1 })
      useHabitStore.setState({ habits: [habit], completions: [completion] })

      await useHabitStore.getState().logCompletion(habit.id, '2025-01-13')

      const updatedCompletion = useHabitStore.getState().completions.find(
        (c) => c.habitId === habit.id && c.date === '2025-01-13'
      )
      expect(updatedCompletion?.count).toBe(2)
    })
  })

  describe('removeCompletion', () => {
    it('decrements completion count when count > 1', async () => {
      const habit = createMockHabit()
      const completion = createMockCompletion({ count: 2 })
      useHabitStore.setState({ habits: [habit], completions: [completion] })

      await useHabitStore.getState().removeCompletion(habit.id, '2025-01-13')

      const updatedCompletion = useHabitStore.getState().completions.find(
        (c) => c.habitId === habit.id
      )
      expect(updatedCompletion?.count).toBe(1)
    })

    it('removes completion when count is 1', async () => {
      const habit = createMockHabit()
      const completion = createMockCompletion({ count: 1 })
      useHabitStore.setState({ habits: [habit], completions: [completion] })

      await useHabitStore.getState().removeCompletion(habit.id, '2025-01-13')

      expect(useHabitStore.getState().completions).toHaveLength(0)
    })
  })

  describe('getStreak', () => {
    it('returns 0 when no completions', () => {
      const habit = createMockHabit()
      useHabitStore.setState({ habits: [habit], completions: [] })

      const streak = useHabitStore.getState().getStreak(habit.id)
      expect(streak).toBe(0)
    })

    it('returns current streak count', () => {
      const habit = createMockHabit()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const dayBefore = new Date(today)
      dayBefore.setDate(dayBefore.getDate() - 2)

      const completions = [
        createMockCompletion({ id: 'c1', date: today.toISOString().split('T')[0] }),
        createMockCompletion({ id: 'c2', date: yesterday.toISOString().split('T')[0] }),
        createMockCompletion({ id: 'c3', date: dayBefore.toISOString().split('T')[0] }),
      ]

      useHabitStore.setState({ habits: [habit], completions })

      const streak = useHabitStore.getState().getStreak(habit.id)
      expect(streak).toBeGreaterThanOrEqual(2)
      expect(streak).toBeLessThanOrEqual(3)
    })

    it('returns 0 when no recent completions', () => {
      const habit = createMockHabit()
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const completions = [
        createMockCompletion({ id: 'c1', date: threeDaysAgo.toISOString().split('T')[0] }),
      ]

      useHabitStore.setState({ habits: [habit], completions })

      const streak = useHabitStore.getState().getStreak(habit.id)
      expect(streak).toBe(0)
    })
  })

  describe('getBestStreak', () => {
    it('returns 0 when no completions', () => {
      const habit = createMockHabit()
      useHabitStore.setState({ habits: [habit], completions: [] })

      const bestStreak = useHabitStore.getState().getBestStreak(habit.id)
      expect(bestStreak).toBe(0)
    })

    it('returns best streak from history', () => {
      const habit = createMockHabit()
      const completions = [
        createMockCompletion({ id: 'c1', date: '2025-01-01' }),
        createMockCompletion({ id: 'c2', date: '2025-01-02' }),
        createMockCompletion({ id: 'c3', date: '2025-01-03' }),
        createMockCompletion({ id: 'c4', date: '2025-01-10' }),
        createMockCompletion({ id: 'c5', date: '2025-01-11' }),
      ]

      useHabitStore.setState({ habits: [habit], completions })

      const bestStreak = useHabitStore.getState().getBestStreak(habit.id)
      expect(bestStreak).toBe(3)
    })
  })

  describe('getCompletionRate', () => {
    it('returns 0 when no completions', () => {
      const habit = createMockHabit()
      useHabitStore.setState({ habits: [habit], completions: [] })

      const rate = useHabitStore.getState().getCompletionRate(habit.id, 7)
      expect(rate).toBe(0)
    })

    it('calculates completion rate correctly', () => {
      const habit = createMockHabit()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const completions: HabitCompletion[] = []
      for (let i = 0; i < 4; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        completions.push(
          createMockCompletion({
            id: `c${i}`,
            date: date.toISOString().split('T')[0],
          })
        )
      }

      useHabitStore.setState({ habits: [habit], completions })

      const rate = useHabitStore.getState().getCompletionRate(habit.id, 7)
      expect(rate).toBeGreaterThanOrEqual(40)
      expect(rate).toBeLessThanOrEqual(60)
    })
  })

  describe('isHabitDueToday', () => {
    it('returns true for daily habit', () => {
      const habit = createMockHabit({ frequency: 'daily' })
      useHabitStore.setState({ habits: [habit] })

      const isDue = useHabitStore.getState().isHabitDueToday(habit)
      expect(isDue).toBe(true)
    })

    it('returns true for weekly habit on Sunday', () => {
      const habit = createMockHabit({ frequency: 'weekly' })
      useHabitStore.setState({ habits: [habit] })

      const isDue = useHabitStore.getState().isHabitDueToday(habit)
      const today = new Date().getDay()
      expect(isDue).toBe(today === 0)
    })

    it('returns correct value for custom days', () => {
      const today = new Date().getDay()
      const habit = createMockHabit({
        frequency: 'custom',
        customDays: [1, 3, 5],
      })
      useHabitStore.setState({ habits: [habit] })

      const isDue = useHabitStore.getState().isHabitDueToday(habit)
      expect(isDue).toBe([1, 3, 5].includes(today))
    })
  })

  describe('isHabitDueOnDate helper', () => {
    it('returns true for daily frequency on any date', () => {
      expect(isHabitDueOnDate('daily', undefined, new Date('2025-01-13'))).toBe(true)
      expect(isHabitDueOnDate('daily', undefined, new Date('2025-01-14'))).toBe(true)
    })

    it('returns true for weekly frequency only on Sunday', () => {
      expect(isHabitDueOnDate('weekly', undefined, new Date('2025-01-12'))).toBe(true)
      expect(isHabitDueOnDate('weekly', undefined, new Date('2025-01-13'))).toBe(false)
    })

    it('returns correct value for custom days', () => {
      const customDays = [1, 3, 5]
      expect(isHabitDueOnDate('custom', customDays, new Date('2025-01-13'))).toBe(true)
      expect(isHabitDueOnDate('custom', customDays, new Date('2025-01-14'))).toBe(false)
      expect(isHabitDueOnDate('custom', customDays, new Date('2025-01-15'))).toBe(true)
    })
  })

  describe('selectHabit', () => {
    it('sets selectedHabitId', () => {
      useHabitStore.getState().selectHabit('habit-1')
      expect(useHabitStore.getState().selectedHabitId).toBe('habit-1')
    })

    it('clears selectedHabitId when null', () => {
      useHabitStore.setState({ selectedHabitId: 'habit-1' })
      useHabitStore.getState().selectHabit(null)
      expect(useHabitStore.getState().selectedHabitId).toBeNull()
    })
  })

  describe('getCompletionsForHabit', () => {
    it('returns completions for specific habit', () => {
      const completions = [
        createMockCompletion({ id: 'c1', habitId: 'habit-1', date: '2025-01-13' }),
        createMockCompletion({ id: 'c2', habitId: 'habit-2', date: '2025-01-13' }),
        createMockCompletion({ id: 'c3', habitId: 'habit-1', date: '2025-01-12' }),
      ]
      useHabitStore.setState({ completions })

      const result = useHabitStore.getState().getCompletionsForHabit('habit-1')
      expect(result).toHaveLength(2)
      expect(result.every((c) => c.habitId === 'habit-1')).toBe(true)
    })
  })

  describe('getCompletionForDate', () => {
    it('returns completion for specific habit and date', () => {
      const completions = [
        createMockCompletion({ id: 'c1', habitId: 'habit-1', date: '2025-01-13' }),
        createMockCompletion({ id: 'c2', habitId: 'habit-1', date: '2025-01-12' }),
      ]
      useHabitStore.setState({ completions })

      const result = useHabitStore.getState().getCompletionForDate('habit-1', '2025-01-13')
      expect(result?.id).toBe('c1')
    })

    it('returns undefined when not found', () => {
      useHabitStore.setState({ completions: [] })

      const result = useHabitStore.getState().getCompletionForDate('habit-1', '2025-01-13')
      expect(result).toBeUndefined()
    })
  })

  describe('getTodayCompletionCount', () => {
    it('returns count for today', () => {
      const today = new Date().toISOString().split('T')[0]
      const completions = [createMockCompletion({ habitId: 'habit-1', date: today, count: 3 })]
      useHabitStore.setState({ completions })

      const count = useHabitStore.getState().getTodayCompletionCount('habit-1')
      expect(count).toBe(3)
    })

    it('returns 0 when no completion for today', () => {
      useHabitStore.setState({ completions: [] })

      const count = useHabitStore.getState().getTodayCompletionCount('habit-1')
      expect(count).toBe(0)
    })
  })
})
