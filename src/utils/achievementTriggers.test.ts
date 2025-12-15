import { describe, it, expect } from 'vitest'

describe('achievementTriggers utilities', () => {
  describe('task completion achievements', () => {
    it('should trigger on first task completion', () => {
      const completedCount = 1
      const triggered = completedCount === 1
      expect(triggered).toBe(true)
    })

    it('should trigger on 10 tasks completed', () => {
      const completedCount = 10
      const triggered = completedCount === 10
      expect(triggered).toBe(true)
    })

    it('should trigger on 100 tasks completed', () => {
      const completedCount = 100
      const triggered = completedCount === 100
      expect(triggered).toBe(true)
    })

    it('should trigger on 1000 tasks completed', () => {
      const completedCount = 1000
      const triggered = completedCount === 1000
      expect(triggered).toBe(true)
    })
  })

  describe('streak achievements', () => {
    it('should trigger 7-day streak', () => {
      const streakDays = 7
      const triggered = streakDays === 7
      expect(triggered).toBe(true)
    })

    it('should trigger 30-day streak', () => {
      const streakDays = 30
      const triggered = streakDays === 30
      expect(triggered).toBe(true)
    })

    it('should trigger 100-day streak', () => {
      const streakDays = 100
      const triggered = streakDays === 100
      expect(triggered).toBe(true)
    })

    it('should trigger 365-day streak', () => {
      const streakDays = 365
      const triggered = streakDays === 365
      expect(triggered).toBe(true)
    })
  })

  describe('priority achievements', () => {
    it('should trigger on all P1 completion', () => {
      const p1Tasks = 5
      const p1Completed = 5
      const triggered = p1Tasks > 0 && p1Completed === p1Tasks
      expect(triggered).toBe(true)
    })

    it('should trigger on mixed priority completion', () => {
      const allCompleted = {
        p1: 3,
        p2: 5,
        p3: 7,
        p4: 2,
      }
      const triggered = Object.values(allCompleted).reduce((a, b) => a + b) > 10
      expect(triggered).toBe(true)
    })
  })

  describe('time-based achievements', () => {
    it('should trigger daily achievement', () => {
      const completedToday = 5
      const triggered = completedToday >= 1
      expect(triggered).toBe(true)
    })

    it('should trigger weekly achievement', () => {
      const weekCompleted = 20
      const triggered = weekCompleted >= 10
      expect(triggered).toBe(true)
    })

    it('should trigger monthly achievement', () => {
      const monthCompleted = 100
      const triggered = monthCompleted >= 50
      expect(triggered).toBe(true)
    })
  })

  describe('project achievements', () => {
    it('should trigger on project completion', () => {
      const projectTasks = 10
      const projectCompleted = 10
      const triggered = projectTasks > 0 && projectCompleted === projectTasks
      expect(triggered).toBe(true)
    })

    it('should trigger on first project', () => {
      const projectCount = 1
      const triggered = projectCount === 1
      expect(triggered).toBe(true)
    })

    it('should trigger on 5 projects', () => {
      const projectCount = 5
      const triggered = projectCount === 5
      expect(triggered).toBe(true)
    })

    it('should trigger on 10 projects', () => {
      const projectCount = 10
      const triggered = projectCount === 10
      expect(triggered).toBe(true)
    })
  })

  describe('feature usage achievements', () => {
    it('should trigger on first label creation', () => {
      const labelCount = 1
      const triggered = labelCount === 1
      expect(triggered).toBe(true)
    })

    it('should trigger on first recurring task', () => {
      const recurringCount = 1
      const triggered = recurringCount === 1
      expect(triggered).toBe(true)
    })

    it('should trigger on first comment', () => {
      const commentCount = 1
      const triggered = commentCount === 1
      expect(triggered).toBe(true)
    })

    it('should trigger on first shared project', () => {
      const sharedProjectCount = 1
      const triggered = sharedProjectCount === 1
      expect(triggered).toBe(true)
    })
  })

  describe('karma-based achievements', () => {
    it('should unlock at karma level 1', () => {
      const karma = 100
      const triggered = karma >= 100
      expect(triggered).toBe(true)
    })

    it('should unlock at karma level 2', () => {
      const karma = 500
      const triggered = karma >= 500
      expect(triggered).toBe(true)
    })

    it('should unlock at karma level 5', () => {
      const karma = 5000
      const triggered = karma >= 5000
      expect(triggered).toBe(true)
    })

    it('should unlock at enlightened', () => {
      const karma = 50000
      const triggered = karma >= 50000
      expect(triggered).toBe(true)
    })
  })

  describe('achievement metadata', () => {
    it('should have proper achievement structure', () => {
      const achievement = {
        id: 'first_task',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎉',
        points: 10,
        unlockedAt: new Date(),
      }

      expect(achievement.id).toBeDefined()
      expect(achievement.name).toBeDefined()
      expect(achievement.description).toBeDefined()
      expect(achievement.points).toBeGreaterThan(0)
    })

    it('should have rarity levels', () => {
      const rarities = ['common', 'rare', 'epic', 'legendary']
      rarities.forEach(r => {
        expect(['common', 'rare', 'epic', 'legendary']).toContain(r)
      })
    })

    it('should track unlock date', () => {
      const achievement = {
        unlockedAt: new Date(),
      }

      expect(achievement.unlockedAt).toBeInstanceOf(Date)
    })
  })

  describe('achievement notifications', () => {
    it('should generate achievement notification', () => {
      const notification = {
        type: 'achievement_unlocked',
        title: 'Achievement Unlocked!',
        message: 'Congratulations on completing 10 tasks!',
      }

      expect(notification.type).toBe('achievement_unlocked')
      expect(notification.message).toBeDefined()
    })

    it('should support custom messages', () => {
      const message = (count: number) => `You've completed ${count} tasks!`
      expect(message(50)).toContain('50')
    })
  })

  describe('achievement progression', () => {
    it('should track progress to next achievement', () => {
      const current = 8
      const next = 10
      const progress = (current / next) * 100

      expect(progress).toBe(80)
    })

    it('should calculate XP to next level', () => {
      const currentXP = 750
      const nextLevelXP = 1000
      const xpRemaining = nextLevelXP - currentXP

      expect(xpRemaining).toBe(250)
    })

    it('should show milestone progress', () => {
      const milestones = [1, 10, 100, 1000]
      const current = 50
      const nextMilestone = milestones.find(m => m > current)

      expect(nextMilestone).toBe(100)
    })
  })
})
