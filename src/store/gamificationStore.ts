import { create } from 'zustand'
import type { KarmaLevel, UserStats as DBUserStats, AchievementRecord } from '@/types'
import { db } from '@/db/database'
import { checkAchievementsToUnlock } from '@/utils/achievementTriggers'

export type UserStats = DBUserStats

export interface AchievementWithUnlockedAt extends AchievementRecord {
  unlockedAt?: Date
}

interface GamificationState {
  userStats: UserStats | null
  achievements: AchievementRecord[]
  leaderboard: Array<{ userId: string; name: string; karma: number }>
  loading: boolean
  error: string | null
}

interface GamificationActions {
  initializeStats: (userId: string) => Promise<void>
  addKarma: (userId: string, points: number, priority?: string | null) => Promise<void>
  updateStreak: (userId: string) => Promise<void>
  unlockAchievement: (userId: string, achievementId: string) => Promise<void>
  getLeaderboard: (limit?: number) => Promise<void>
  calculateKarmaLevel: (karma: number) => KarmaLevel
  resetStreakIfNeeded: (userId: string, lastCompletedAt?: Date) => Promise<void>
}

// Karma multipliers for different priority levels
export const KARMA_MULTIPLIERS = {
  p1: 3,
  p2: 2,
  p3: 1.5,
  p4: 1,
  null: 0.5,
} as const

const KARMA_THRESHOLDS: Record<KarmaLevel, number> = {
  beginner: 0,
  novice: 100,
  intermediate: 300,
  advanced: 700,
  professional: 1300,
  expert: 2000,
  master: 3000,
  grandmaster: 4500,
  enlightened: 6000,
}

const createDate = () => new Date()

const DEFAULT_ACHIEVEMENTS: AchievementRecord[] = [
  {
    id: 'first-task',
    name: 'First Step',
    description: 'Complete your first task',
    icon: '🎯',
    points: 50,
    createdAt: createDate(),
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day completion streak',
    icon: '🔥',
    points: 100,
    createdAt: createDate(),
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day completion streak',
    icon: '🌟',
    points: 500,
    createdAt: createDate(),
  },
  {
    id: 'priority-10',
    name: 'Priority Master',
    description: 'Complete 10 high-priority (P1) tasks',
    icon: '⚡',
    points: 200,
    createdAt: createDate(),
  },
  {
    id: 'team-5',
    name: 'Collaborator',
    description: 'Add 5 team members to your projects',
    icon: '👥',
    points: 150,
    createdAt: createDate(),
  },
  {
    id: 'tasks-50',
    name: 'Productive Pro',
    description: 'Complete 50 tasks',
    icon: '📊',
    points: 300,
    createdAt: createDate(),
  },
  {
    id: 'tasks-100',
    name: 'Completion Champion',
    description: 'Complete 100 tasks',
    icon: '🏆',
    points: 500,
    createdAt: createDate(),
  },
  {
    id: 'daily-login',
    name: 'Daily Visitor',
    description: 'Log in every day for a week',
    icon: '📅',
    points: 75,
    createdAt: createDate(),
  },
]

export const useGamificationStore = create<GamificationState & GamificationActions>(
  (set, get) => ({
    userStats: null,
    achievements: DEFAULT_ACHIEVEMENTS,
    leaderboard: [],
    loading: false,
    error: null,

    calculateKarmaLevel: (karma: number): KarmaLevel => {
      const levels = Object.entries(KARMA_THRESHOLDS)
        .sort(([, a], [, b]) => b - a)
        .find(([, threshold]) => karma >= threshold)
      return (levels?.[0] as KarmaLevel) || 'beginner'
    },

    initializeStats: async (userId: string) => {
      set({ loading: true, error: null })
      try {
        let stats = await db.userStats?.get(userId)

        if (!stats) {
          stats = {
            userId,
            karma: 0,
            karmaLevel: 'beginner',
            currentStreak: 0,
            longestStreak: 0,
            totalCompleted: 0,
            achievements: [],
            updatedAt: new Date(),
          }
          await db.userStats?.add(stats)
        }

        set({ userStats: stats, loading: false })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to initialize stats',
          loading: false,
        })
      }
    },

    addKarma: async (_userId: string, points: number, priority?: string | null) => {
      const state = get()
      if (!state.userStats) return

      // Apply priority multiplier if provided
      let karmaPoints = points
      if (priority) {
        const multiplier = KARMA_MULTIPLIERS[priority as keyof typeof KARMA_MULTIPLIERS] ?? KARMA_MULTIPLIERS.null
        karmaPoints = Math.round(points * multiplier)
      }

      const newKarma = state.userStats.karma + karmaPoints
      const newLevel = get().calculateKarmaLevel(newKarma)

      const updatedStats = {
        ...state.userStats,
        karma: newKarma,
        karmaLevel: newLevel,
        updatedAt: new Date(),
      }

      try {
        await db.userStats?.put(updatedStats)
        set({ userStats: updatedStats })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add karma' })
      }
    },

    updateStreak: async (userId?: string) => {
      const state = get()
      if (!state.userStats) return

      const now = new Date()
      const lastCompleted = state.userStats.lastCompletedAt
      const isConsecutiveDay = lastCompleted
        ? new Date(now).toDateString() !==
          new Date(lastCompleted).toDateString() &&
          (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24) < 2
        : true

      const newStreak = isConsecutiveDay ? state.userStats.currentStreak + 1 : 1
      const newLongest = Math.max(newStreak, state.userStats.longestStreak)
      const previousStats = state.userStats

      const updatedStats = {
        ...state.userStats,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastCompletedAt: now,
        totalCompleted: state.userStats.totalCompleted + 1,
        updatedAt: new Date(),
      }

      try {
        await db.userStats?.put(updatedStats)
        set({ userStats: updatedStats })

        // Check for achievement unlocks after streak/completion update
        const unlockedIds = (updatedStats.achievements as string[]) || []
        const achievementsToUnlock = checkAchievementsToUnlock(
          updatedStats,
          unlockedIds,
          previousStats
        )

        // Unlock any newly earned achievements
        const id = userId || state.userStats.userId
        for (const achievementId of achievementsToUnlock) {
          await get().unlockAchievement(id, achievementId)
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update streak' })
      }
    },

    resetStreakIfNeeded: async (_userId: string, lastCompletedAt?: Date) => {
      const state = get()
      if (!state.userStats || !lastCompletedAt) return

      const daysSinceCompletion =
        (new Date().getTime() - new Date(lastCompletedAt).getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceCompletion > 1) {
        const updatedStats = {
          ...state.userStats,
          currentStreak: 0,
          updatedAt: new Date(),
        }

        try {
          await db.userStats?.put(updatedStats)
          set({ userStats: updatedStats })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reset streak' })
        }
      }
    },

    unlockAchievement: async (_userId: string, achievementId: string) => {
      const state = get()
      if (!state.userStats) return

      const achievement = DEFAULT_ACHIEVEMENTS.find((a) => a.id === achievementId)
      if (!achievement) return

      const alreadyUnlocked = state.userStats.achievements.some(
        (id) => (typeof id === 'string' ? id : id.id) === achievementId
      )
      if (alreadyUnlocked) return

      const updatedStats: UserStats = {
        ...state.userStats,
        achievements: [...(state.userStats.achievements as string[]), achievementId],
        updatedAt: new Date(),
      }

      try {
        await db.userStats?.put(updatedStats)
        await get().addKarma(_userId, achievement.points)
        set({ userStats: updatedStats })

        // Emit achievement unlock notification
        if (typeof window !== 'undefined') {
          const windowType = window as unknown as Record<string, unknown>
          const notifier = windowType.__addAchievementNotification as
            | ((data: {
                id: string
                name: string
                icon: string
                points: number
              }) => void)
            | undefined
          notifier?.({
            id: achievement.id,
            name: achievement.name,
            icon: achievement.icon,
            points: achievement.points,
          })
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to unlock achievement' })
      }
    },

    getLeaderboard: async (limit = 10) => {
      set({ loading: true, error: null })
      try {
        const stats = await db.userStats?.toArray()
        if (!stats) {
          set({ leaderboard: [], loading: false })
          return
        }

        const leaderboard = await Promise.all(
          stats
            .sort((a, b) => b.karma - a.karma)
            .slice(0, limit)
            .map(async (stat) => {
              const user = await db.users.get(stat.userId)
              return {
                userId: stat.userId,
                name: user?.name || 'Unknown',
                karma: stat.karma,
              }
            })
        )

        set({ leaderboard, loading: false })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
          loading: false,
        })
      }
    },
  })
)
