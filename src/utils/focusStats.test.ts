import { describe, it, expect } from 'bun:test'
import { calculateFocusStats, getDailyStats, formatDuration, getTaskFocusTime } from './focusStats'
import type { FocusSession } from '@/types'

function createSession(overrides: Partial<FocusSession> = {}): FocusSession {
  return {
    id: 'session-1',
    userId: 'user-1',
    taskId: 'task-1',
    startTime: new Date(),
    endTime: null,
    duration: 1500,
    type: 'focus',
    completed: false,
    interruptions: 0,
    ...overrides,
  }
}

describe('focusStats utilities', () => {
  describe('calculateFocusStats', () => {
    it('should return zero stats for empty sessions', () => {
      const stats = calculateFocusStats([])

      expect(stats.totalSessions).toBe(0)
      expect(stats.completedSessions).toBe(0)
      expect(stats.totalFocusTime).toBe(0)
      expect(stats.totalBreakTime).toBe(0)
      expect(stats.averageSessionLength).toBe(0)
      expect(stats.totalInterruptions).toBe(0)
      expect(stats.completionRate).toBe(0)
      expect(stats.currentStreak).toBe(0)
    })

    it('should count only focus sessions for totalSessions', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus' }),
        createSession({ id: '2', type: 'short-break' }),
        createSession({ id: '3', type: 'focus' }),
        createSession({ id: '4', type: 'long-break' }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.totalSessions).toBe(2)
    })

    it('should count completed focus sessions', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', completed: true }),
        createSession({ id: '2', type: 'focus', completed: false }),
        createSession({ id: '3', type: 'focus', completed: true }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.completedSessions).toBe(2)
    })

    it('should calculate total focus time from endTime when available', () => {
      const startTime = new Date('2024-01-15T10:00:00Z')
      const endTime = new Date('2024-01-15T10:25:00Z')

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime, endTime, duration: 1500 }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.totalFocusTime).toBe(1500)
    })

    it('should use duration when endTime is null', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', endTime: null, duration: 1800 }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.totalFocusTime).toBe(1800)
    })

    it('should calculate total break time', () => {
      const startTime = new Date('2024-01-15T10:00:00Z')
      const shortBreakEnd = new Date('2024-01-15T10:05:00Z')
      const longBreakEnd = new Date('2024-01-15T10:15:00Z')

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'short-break', startTime, endTime: shortBreakEnd }),
        createSession({ id: '2', type: 'long-break', startTime, endTime: longBreakEnd }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.totalBreakTime).toBe(1200)
    })

    it('should calculate average session length', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', endTime: null, duration: 1500 }),
        createSession({ id: '2', type: 'focus', endTime: null, duration: 1800 }),
        createSession({ id: '3', type: 'focus', endTime: null, duration: 2100 }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.averageSessionLength).toBe(1800)
    })

    it('should sum total interruptions', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', interruptions: 2 }),
        createSession({ id: '2', type: 'focus', interruptions: 3 }),
        createSession({ id: '3', type: 'short-break', interruptions: 5 }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.totalInterruptions).toBe(5)
    })

    it('should calculate completion rate', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', completed: true }),
        createSession({ id: '2', type: 'focus', completed: true }),
        createSession({ id: '3', type: 'focus', completed: false }),
        createSession({ id: '4', type: 'focus', completed: true }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.completionRate).toBe(0.75)
    })

    it('should count sessions today', () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today }),
        createSession({ id: '2', type: 'focus', startTime: today }),
        createSession({ id: '3', type: 'focus', startTime: yesterday }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.sessionsToday).toBe(2)
    })

    it('should calculate focus time today', () => {
      const today = new Date()
      today.setHours(10, 0, 0, 0)
      const todayEnd = new Date(today)
      todayEnd.setMinutes(25)

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today, endTime: todayEnd }),
        createSession({ id: '2', type: 'focus', startTime: yesterday, endTime: null, duration: 3600 }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.focusTimeToday).toBe(1500)
    })

    it('should calculate current streak', () => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(today.getDate() - 2)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today, completed: true }),
        createSession({ id: '2', type: 'focus', startTime: yesterday, completed: true }),
        createSession({ id: '3', type: 'focus', startTime: twoDaysAgo, completed: true }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.currentStreak).toBe(3)
    })

    it('should break streak on missed day', () => {
      const today = new Date()
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(today.getDate() - 3)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today, completed: true }),
        createSession({ id: '2', type: 'focus', startTime: threeDaysAgo, completed: true }),
      ]

      const stats = calculateFocusStats(sessions)

      expect(stats.currentStreak).toBe(1)
    })
  })

  describe('getDailyStats', () => {
    it('should return stats for the specified number of days', () => {
      const stats = getDailyStats([], 7)

      expect(stats).toHaveLength(7)
    })

    it('should return stats for default 7 days', () => {
      const stats = getDailyStats([])

      expect(stats).toHaveLength(7)
    })

    it('should return dates in ascending order', () => {
      const stats = getDailyStats([], 3)

      const dates = stats.map((s) => new Date(s.date).getTime())
      expect(dates[0]).toBeLessThan(dates[1])
      expect(dates[1]).toBeLessThan(dates[2])
    })

    it('should calculate focus sessions per day', () => {
      const today = new Date()
      today.setHours(12, 0, 0, 0)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today }),
        createSession({ id: '2', type: 'focus', startTime: today }),
        createSession({ id: '3', type: 'short-break', startTime: today }),
      ]

      const stats = getDailyStats(sessions, 1)

      expect(stats[0].focusSessions).toBe(2)
    })

    it('should calculate focus minutes per day', () => {
      const today = new Date()
      today.setHours(10, 0, 0, 0)
      const endTime = new Date(today)
      endTime.setMinutes(30)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today, endTime, duration: 1800 }),
      ]

      const stats = getDailyStats(sessions, 1)

      expect(stats[0].focusMinutes).toBe(30)
    })

    it('should calculate break minutes per day', () => {
      const today = new Date()
      today.setHours(10, 0, 0, 0)
      const endTime = new Date(today)
      endTime.setMinutes(15)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'short-break', startTime: today, endTime }),
        createSession({ id: '2', type: 'long-break', startTime: today, endTime: null, duration: 600 }),
      ]

      const stats = getDailyStats(sessions, 1)

      expect(stats[0].breakMinutes).toBe(25)
    })

    it('should sum interruptions per day', () => {
      const today = new Date()
      today.setHours(12, 0, 0, 0)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today, interruptions: 2 }),
        createSession({ id: '2', type: 'focus', startTime: today, interruptions: 3 }),
      ]

      const stats = getDailyStats(sessions, 1)

      expect(stats[0].interruptions).toBe(5)
    })

    it('should use duration when endTime is null', () => {
      const today = new Date()
      today.setHours(12, 0, 0, 0)

      const sessions: FocusSession[] = [
        createSession({ id: '1', type: 'focus', startTime: today, endTime: null, duration: 1800 }),
      ]

      const stats = getDailyStats(sessions, 1)

      expect(stats[0].focusMinutes).toBe(30)
    })

    it('should format date as ISO string', () => {
      const stats = getDailyStats([], 1)

      expect(stats[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('formatDuration', () => {
    it('should format zero seconds', () => {
      expect(formatDuration(0)).toBe('0m')
    })

    it('should format seconds to minutes only', () => {
      expect(formatDuration(300)).toBe('5m')
      expect(formatDuration(1500)).toBe('25m')
      expect(formatDuration(2700)).toBe('45m')
    })

    it('should format to hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h 0m')
      expect(formatDuration(3900)).toBe('1h 5m')
      expect(formatDuration(7500)).toBe('2h 5m')
    })

    it('should handle large durations', () => {
      expect(formatDuration(36000)).toBe('10h 0m')
      expect(formatDuration(86400)).toBe('24h 0m')
    })

    it('should floor partial minutes', () => {
      expect(formatDuration(90)).toBe('1m')
      expect(formatDuration(119)).toBe('1m')
      expect(formatDuration(121)).toBe('2m')
    })
  })

  describe('getTaskFocusTime', () => {
    it('should return zero for empty sessions', () => {
      expect(getTaskFocusTime([], 'task-1')).toBe(0)
    })

    it('should return zero for non-matching task', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', taskId: 'task-1', type: 'focus', duration: 1500 }),
      ]

      expect(getTaskFocusTime(sessions, 'task-2')).toBe(0)
    })

    it('should calculate focus time for specific task', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', taskId: 'task-1', type: 'focus', endTime: null, duration: 1500 }),
        createSession({ id: '2', taskId: 'task-1', type: 'focus', endTime: null, duration: 1800 }),
        createSession({ id: '3', taskId: 'task-2', type: 'focus', endTime: null, duration: 2000 }),
      ]

      expect(getTaskFocusTime(sessions, 'task-1')).toBe(3300)
    })

    it('should only count focus sessions, not breaks', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', taskId: 'task-1', type: 'focus', endTime: null, duration: 1500 }),
        createSession({ id: '2', taskId: 'task-1', type: 'short-break', endTime: null, duration: 300 }),
        createSession({ id: '3', taskId: 'task-1', type: 'long-break', endTime: null, duration: 900 }),
      ]

      expect(getTaskFocusTime(sessions, 'task-1')).toBe(1500)
    })

    it('should use endTime when available', () => {
      const startTime = new Date('2024-01-15T10:00:00Z')
      const endTime = new Date('2024-01-15T10:30:00Z')

      const sessions: FocusSession[] = [
        createSession({ id: '1', taskId: 'task-1', type: 'focus', startTime, endTime, duration: 1500 }),
      ]

      expect(getTaskFocusTime(sessions, 'task-1')).toBe(1800)
    })

    it('should handle null taskId', () => {
      const sessions: FocusSession[] = [
        createSession({ id: '1', taskId: null, type: 'focus', duration: 1500 }),
      ]

      expect(getTaskFocusTime(sessions, 'task-1')).toBe(0)
    })
  })
})
