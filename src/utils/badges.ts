import type { UserStats } from '@/store/gamificationStore'

/**
 * Get count of earned badges for a user
 */
export const getEarnedBadgeCount = (userStats: UserStats | null): number => {
  if (!userStats) return 0
  
  // Count badges based on criteria
  let count = 0
  
  // Daily Visitor - placeholder
  // count += 1 if daily streak >= 1
  
  // Weekly Warrior
  if (userStats.totalCompleted >= 15) count++
  
  // Monthly Master
  if (userStats.totalCompleted >= 60) count++
  
  // Streak Champion
  if (userStats.currentStreak >= 7) count++
  
  return count
}

/**
 * Check if user earned a specific badge
 */
export const hasBadge = (userStats: UserStats | null, badgeId: string): boolean => {
  if (!userStats) return false
  
  switch (badgeId) {
    case 'weekly-warrior':
      return userStats.totalCompleted >= 15
    case 'monthly-master':
      return userStats.totalCompleted >= 60
    case 'streak-champion':
      return userStats.currentStreak >= 7
    case 'daily-login':
      return true // Placeholder
    default:
      return false
  }
}
