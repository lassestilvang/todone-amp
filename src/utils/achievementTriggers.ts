import type { UserStats } from '@/types'

/**
 * Achievement unlock trigger conditions
 * Returns true if the achievement should be unlocked based on current user stats
 */
export const achievementTriggers = {
  'first-task': (stats: UserStats, previousStats?: UserStats): boolean => {
    // Unlock on first task completion
    return stats.totalCompleted >= 1 && (!previousStats || previousStats.totalCompleted === 0)
  },

  'streak-7': (stats: UserStats, previousStats?: UserStats): boolean => {
    // Unlock when reaching 7-day streak
    return stats.currentStreak >= 7 && (!previousStats || previousStats.currentStreak < 7)
  },

  'streak-30': (stats: UserStats, previousStats?: UserStats): boolean => {
    // Unlock when reaching 30-day streak
    return stats.currentStreak >= 30 && (!previousStats || previousStats.currentStreak < 30)
  },

  'priority-10': (stats: UserStats): boolean => {
    // This would track P1 completions separately
    // For now, check if user has karma from priority tasks
    // In production, would need to track this separately in database
    return stats.karma >= 100 // Placeholder logic
  },

  'team-5': (): boolean => {
    // Placeholder - would need team member tracking
    // This requires a separate table for team assignments
    return false
  },

  'tasks-50': (stats: UserStats, previousStats?: UserStats): boolean => {
    // Unlock when completing 50 tasks
    return stats.totalCompleted >= 50 && (!previousStats || previousStats.totalCompleted < 50)
  },

  'tasks-100': (stats: UserStats, previousStats?: UserStats): boolean => {
    // Unlock when completing 100 tasks
    return stats.totalCompleted >= 100 && (!previousStats || previousStats.totalCompleted < 100)
  },

  'daily-login': (): boolean => {
    // Placeholder - would need login tracking
    return false
  },
} as const

export type AchievementTriggerKey = keyof typeof achievementTriggers

/**
 * Check which achievements should be unlocked for the given stats
 * Returns array of achievement IDs that were just unlocked
 */
export const checkAchievementsToUnlock = (
  newStats: UserStats,
  unlockedAchievementIds: string[],
  previousStats?: UserStats
): string[] => {
  const achievedIds = Object.entries(achievementTriggers)
    .filter(([id]) => !unlockedAchievementIds.includes(id))
    .filter(([, trigger]) => trigger(newStats, previousStats))
    .map(([id]) => id)

  return achievedIds
}

/**
 * Priority task tracking
 * Would need to be added to database schema
 */
export interface PriorityTaskStats {
  userId: string
  p1Count: number
  p2Count: number
  p3Count: number
  p4Count: number
  updatedAt: Date
}

/**
 * Check if user should unlock "Priority Master" achievement
 * Requires tracking P1 task completions separately
 */
export const checkPriorityMasterUnlock = (p1Count: number): boolean => {
  return p1Count >= 10
}
