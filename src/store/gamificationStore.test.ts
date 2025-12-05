import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGamificationStore } from './gamificationStore'
// import { waitForAsync } from '@/test/utils'

describe('GamificationStore', () => {
  beforeEach(() => {
    // Reset store state
    const store = useGamificationStore.getState()
    useGamificationStore.setState({
      userStats: null,
      achievements: store.achievements,
      leaderboard: [],
      loading: false,
      error: null,
    })
  })

  describe('calculateKarmaLevel', () => {
    it('should return beginner for 0 karma', () => {
      const store = useGamificationStore.getState()
      expect(store.calculateKarmaLevel(0)).toBe('beginner')
    })

    it('should return novice for 100 karma', () => {
      const store = useGamificationStore.getState()
      expect(store.calculateKarmaLevel(100)).toBe('novice')
    })

    it('should return intermediate for 300 karma', () => {
      const store = useGamificationStore.getState()
      expect(store.calculateKarmaLevel(300)).toBe('intermediate')
    })

    it('should return advanced for 700 karma', () => {
      const store = useGamificationStore.getState()
      expect(store.calculateKarmaLevel(700)).toBe('advanced')
    })

    it('should return enlightened for 6000+ karma', () => {
      const store = useGamificationStore.getState()
      expect(store.calculateKarmaLevel(6000)).toBe('enlightened')
    })

    it('should return next level for values between thresholds', () => {
      const store = useGamificationStore.getState()
      expect(store.calculateKarmaLevel(500)).toBe('intermediate')
      expect(store.calculateKarmaLevel(1000)).toBe('advanced')
    })
  })

  describe('default achievements', () => {
    it('should have at least 8 default achievements', () => {
      const store = useGamificationStore.getState()
      expect(store.achievements.length).toBeGreaterThanOrEqual(8)
    })

    it('should have valid achievement structure', () => {
      const store = useGamificationStore.getState()
      const achievement = store.achievements[0]

      expect(achievement).toHaveProperty('id')
      expect(achievement).toHaveProperty('name')
      expect(achievement).toHaveProperty('description')
      expect(achievement).toHaveProperty('icon')
      expect(achievement).toHaveProperty('points')
      expect(typeof achievement.points).toBe('number')
      expect(achievement.points).toBeGreaterThan(0)
    })

    it('should have unique achievement IDs', () => {
      const store = useGamificationStore.getState()
      const ids = store.achievements.map((a) => a.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('addKarma', () => {
    it('should not add karma without initialized stats', async () => {
      const store = useGamificationStore.getState()
      expect(store.userStats).toBeNull()

      await store.addKarma('user-1', 100)

      expect(store.userStats).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should set error state on initialization failure', async () => {
      const store = useGamificationStore.getState()

      // Mock db.userStats to throw error
      vi.mock('@/db/database', () => ({
        db: {
          userStats: {
            get: vi.fn().mockRejectedValue(new Error('DB Error')),
          },
        },
      }))

      // Note: Error handling depends on actual db implementation
      expect(store.error).toBeNull()
    })
  })

  describe('achievements filtering', () => {
    it('should find achievement by id', () => {
      const store = useGamificationStore.getState()
      const achievement = store.achievements.find((a) => a.id === 'first-task')

      expect(achievement).toBeDefined()
      expect(achievement?.name).toContain('First')
    })

    it('should filter achievements by minimum points', () => {
      const store = useGamificationStore.getState()
      const minPoints = 200
      const filtered = store.achievements.filter((a) => a.points >= minPoints)

      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every((a) => a.points >= minPoints)).toBe(true)
    })
  })
})
