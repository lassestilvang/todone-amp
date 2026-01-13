import { create } from 'zustand'
import { db } from '@/db/database'
import type { Habit, HabitCompletion, HabitFrequency } from '@/types'
import { useGamificationStore } from './gamificationStore'

interface HabitState {
  habits: Habit[]
  completions: HabitCompletion[]
  loading: boolean
  error: string | null
  selectedHabitId: string | null
}

interface HabitActions {
  loadHabits: (userId: string) => Promise<void>
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<Habit>
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>
  archiveHabit: (habitId: string) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  logCompletion: (habitId: string, date: string, note?: string) => Promise<void>
  removeCompletion: (habitId: string, date: string) => Promise<void>
  getCompletionsForHabit: (habitId: string) => HabitCompletion[]
  getCompletionForDate: (habitId: string, date: string) => HabitCompletion | undefined
  getStreak: (habitId: string) => number
  getBestStreak: (habitId: string) => number
  getCompletionRate: (habitId: string, days: number) => number
  isHabitDueToday: (habit: Habit) => boolean
  getTodayCompletionCount: (habitId: string) => number
  selectHabit: (habitId: string | null) => void
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const getDayOfWeek = (date: Date): number => {
  return date.getDay()
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const useHabitStore = create<HabitState & HabitActions>((set, get) => ({
  habits: [],
  completions: [],
  loading: false,
  error: null,
  selectedHabitId: null,

  loadHabits: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const habits = await db.habits?.where('userId').equals(userId).toArray()
      const habitIds = habits?.map((h) => h.id) || []

      let completions: HabitCompletion[] = []
      if (habitIds.length > 0) {
        completions = await db.habitCompletions?.where('habitId').anyOf(habitIds).toArray() || []
      }

      set({ habits: habits || [], completions, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load habits',
        loading: false,
      })
    }
  },

  addHabit: async (habitData) => {
    const habit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date(),
    }

    try {
      await db.habits?.add(habit)
      set((state) => ({ habits: [...state.habits, habit] }))
      return habit
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add habit' })
      throw error
    }
  },

  updateHabit: async (habitId: string, updates: Partial<Habit>) => {
    const state = get()
    const habit = state.habits.find((h) => h.id === habitId)
    if (!habit) return

    const updatedHabit = { ...habit, ...updates }

    try {
      await db.habits?.put(updatedHabit)
      set((state) => ({
        habits: state.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update habit' })
    }
  },

  archiveHabit: async (habitId: string) => {
    await get().updateHabit(habitId, { archivedAt: new Date() })
  },

  deleteHabit: async (habitId: string) => {
    try {
      await db.habits?.delete(habitId)
      await db.habitCompletions?.where('habitId').equals(habitId).delete()
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== habitId),
        completions: state.completions.filter((c) => c.habitId !== habitId),
        selectedHabitId: state.selectedHabitId === habitId ? null : state.selectedHabitId,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete habit' })
    }
  },

  logCompletion: async (habitId: string, date: string, note?: string) => {
    const state = get()
    const habit = state.habits.find((h) => h.id === habitId)
    if (!habit) return

    const existingCompletion = state.completions.find(
      (c) => c.habitId === habitId && c.date === date
    )

    if (existingCompletion) {
      const newCount = existingCompletion.count + 1
      const updatedCompletion: HabitCompletion = {
        ...existingCompletion,
        count: newCount,
        note: note || existingCompletion.note,
        completedAt: new Date(),
      }

      try {
        await db.habitCompletions?.put(updatedCompletion)
        set((state) => ({
          completions: state.completions.map((c) =>
            c.id === existingCompletion.id ? updatedCompletion : c
          ),
        }))

        if (newCount <= habit.targetCount) {
          await awardHabitKarma(habit.userId, get().getStreak(habitId))
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to log completion' })
      }
    } else {
      const completion: HabitCompletion = {
        id: `completion-${Date.now()}`,
        habitId,
        date,
        count: 1,
        note,
        completedAt: new Date(),
      }

      try {
        await db.habitCompletions?.add(completion)
        set((state) => ({ completions: [...state.completions, completion] }))
        await awardHabitKarma(habit.userId, get().getStreak(habitId))
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to log completion' })
      }
    }
  },

  removeCompletion: async (habitId: string, date: string) => {
    const state = get()
    const completion = state.completions.find(
      (c) => c.habitId === habitId && c.date === date
    )
    if (!completion) return

    if (completion.count > 1) {
      const updatedCompletion: HabitCompletion = {
        ...completion,
        count: completion.count - 1,
      }

      try {
        await db.habitCompletions?.put(updatedCompletion)
        set((state) => ({
          completions: state.completions.map((c) =>
            c.id === completion.id ? updatedCompletion : c
          ),
        }))
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to remove completion' })
      }
    } else {
      try {
        await db.habitCompletions?.delete(completion.id)
        set((state) => ({
          completions: state.completions.filter((c) => c.id !== completion.id),
        }))
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to remove completion' })
      }
    }
  },

  getCompletionsForHabit: (habitId: string) => {
    return get().completions.filter((c) => c.habitId === habitId)
  },

  getCompletionForDate: (habitId: string, date: string) => {
    return get().completions.find((c) => c.habitId === habitId && c.date === date)
  },

  getStreak: (habitId: string) => {
    const state = get()
    const habit = state.habits.find((h) => h.id === habitId)
    if (!habit) return 0

    const completions = state.completions
      .filter((c) => c.habitId === habitId && c.count >= habit.targetCount)
      .map((c) => c.date)
      .sort()
      .reverse()

    if (completions.length === 0) return 0

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const today = formatDate(currentDate)
    const yesterday = formatDate(addDays(currentDate, -1))

    if (!completions.includes(today) && !completions.includes(yesterday)) {
      return 0
    }

    let checkDate = completions.includes(today) ? currentDate : addDays(currentDate, -1)

    for (let i = 0; i < 400; i++) {
      const dateStr = formatDate(checkDate)
      if (isDueDate(habit, checkDate)) {
        if (completions.includes(dateStr)) {
          streak++
        } else {
          break
        }
      }
      checkDate = addDays(checkDate, -1)
      if (streak > 365) break
    }

    return streak
  },

  getBestStreak: (habitId: string) => {
    const state = get()
    const habit = state.habits.find((h) => h.id === habitId)
    if (!habit) return 0

    const completions = state.completions
      .filter((c) => c.habitId === habitId && c.count >= habit.targetCount)
      .map((c) => c.date)
      .sort()

    if (completions.length === 0) return 0

    let bestStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null

    for (const dateStr of completions) {
      const date = new Date(dateStr)

      if (lastDate === null) {
        currentStreak = 1
      } else {
        let expectedDays = 1
        if (habit.frequency === 'weekly') {
          expectedDays = 7
        } else if (habit.frequency === 'custom' && habit.customDays) {
          let tempDate = new Date(lastDate)
          expectedDays = 0
          do {
            tempDate = addDays(tempDate, 1)
            expectedDays++
          } while (!habit.customDays.includes(getDayOfWeek(tempDate)))
        }

        const daysDiff = Math.round((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff <= expectedDays) {
          currentStreak++
        } else {
          currentStreak = 1
        }
      }

      bestStreak = Math.max(bestStreak, currentStreak)
      lastDate = date
    }

    return bestStreak
  },

  getCompletionRate: (habitId: string, days: number) => {
    const state = get()
    const habit = state.habits.find((h) => h.id === habitId)
    if (!habit) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let dueDays = 0
    let completedDays = 0

    for (let i = 0; i < days; i++) {
      const checkDate = addDays(today, -i)
      if (isDueDate(habit, checkDate)) {
        dueDays++
        const dateStr = formatDate(checkDate)
        const completion = state.completions.find(
          (c) => c.habitId === habitId && c.date === dateStr && c.count >= habit.targetCount
        )
        if (completion) {
          completedDays++
        }
      }
    }

    if (dueDays === 0) return 0
    return Math.round((completedDays / dueDays) * 100)
  },

  isHabitDueToday: (habit: Habit) => {
    return isDueDate(habit, new Date())
  },

  getTodayCompletionCount: (habitId: string) => {
    const today = formatDate(new Date())
    const completion = get().completions.find(
      (c) => c.habitId === habitId && c.date === today
    )
    return completion?.count || 0
  },

  selectHabit: (habitId: string | null) => {
    set({ selectedHabitId: habitId })
  },
}))

function isDueDate(habit: Habit, date: Date): boolean {
  const dayOfWeek = getDayOfWeek(date)

  switch (habit.frequency) {
    case 'daily':
      return true
    case 'weekly':
      return dayOfWeek === 0
    case 'custom':
      return habit.customDays?.includes(dayOfWeek) ?? false
    default:
      return false
  }
}

async function awardHabitKarma(userId: string, streak: number): Promise<void> {
  const gamificationStore = useGamificationStore.getState()
  const baseKarma = 10
  const streakBonus = Math.min(streak * 5, 50)
  await gamificationStore.addKarma(userId, baseKarma + streakBonus)
}

export function isHabitDueOnDate(
  frequency: HabitFrequency,
  customDays: number[] | undefined,
  date: Date
): boolean {
  const dayOfWeek = getDayOfWeek(date)

  switch (frequency) {
    case 'daily':
      return true
    case 'weekly':
      return dayOfWeek === 0
    case 'custom':
      return customDays?.includes(dayOfWeek) ?? false
    default:
      return false
  }
}
