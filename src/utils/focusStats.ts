import type { FocusSession } from '@/types'

export interface FocusStats {
  totalSessions: number
  completedSessions: number
  totalFocusTime: number
  totalBreakTime: number
  averageSessionLength: number
  totalInterruptions: number
  completionRate: number
  sessionsToday: number
  focusTimeToday: number
  currentStreak: number
}

export interface DailyFocusStats {
  date: string
  focusSessions: number
  focusMinutes: number
  breakMinutes: number
  interruptions: number
}

export function calculateFocusStats(sessions: FocusSession[]): FocusStats {
  const focusSessions = sessions.filter((s) => s.type === 'focus')
  const completedFocusSessions = focusSessions.filter((s) => s.completed)

  const totalFocusTime = focusSessions.reduce((acc, s) => {
    if (s.endTime) {
      return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000
    }
    return acc + s.duration
  }, 0)

  const breakSessions = sessions.filter((s) => s.type !== 'focus')
  const totalBreakTime = breakSessions.reduce((acc, s) => {
    if (s.endTime) {
      return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000
    }
    return acc + s.duration
  }, 0)

  const totalInterruptions = focusSessions.reduce((acc, s) => acc + s.interruptions, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sessionsToday = focusSessions.filter((s) => new Date(s.startTime) >= today)
  const focusTimeToday = sessionsToday.reduce((acc, s) => {
    if (s.endTime) {
      return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000
    }
    return acc + s.duration
  }, 0)

  const streak = calculateStreak(focusSessions)

  return {
    totalSessions: focusSessions.length,
    completedSessions: completedFocusSessions.length,
    totalFocusTime,
    totalBreakTime,
    averageSessionLength: focusSessions.length > 0 ? totalFocusTime / focusSessions.length : 0,
    totalInterruptions,
    completionRate: focusSessions.length > 0 ? completedFocusSessions.length / focusSessions.length : 0,
    sessionsToday: sessionsToday.length,
    focusTimeToday,
    currentStreak: streak,
  }
}

function calculateStreak(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0

  const completedByDay = new Map<string, boolean>()

  sessions
    .filter((s) => s.completed)
    .forEach((s) => {
      const dateKey = new Date(s.startTime).toDateString()
      completedByDay.set(dateKey, true)
    })

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateKey = checkDate.toDateString()

    if (completedByDay.has(dateKey)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export function getDailyStats(sessions: FocusSession[], days: number = 7): DailyFocusStats[] {
  const result: DailyFocusStats[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)

    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.startTime)
      return sessionDate >= date && sessionDate < nextDate
    })

    const focusSessions = daySessions.filter((s) => s.type === 'focus')
    const breakSessions = daySessions.filter((s) => s.type !== 'focus')

    const focusMinutes = Math.round(
      focusSessions.reduce((acc, s) => {
        if (s.endTime) {
          return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000 / 60
        }
        return acc + s.duration / 60
      }, 0)
    )

    const breakMinutes = Math.round(
      breakSessions.reduce((acc, s) => {
        if (s.endTime) {
          return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000 / 60
        }
        return acc + s.duration / 60
      }, 0)
    )

    const interruptions = focusSessions.reduce((acc, s) => acc + s.interruptions, 0)

    result.push({
      date: date.toISOString().split('T')[0],
      focusSessions: focusSessions.length,
      focusMinutes,
      breakMinutes,
      interruptions,
    })
  }

  return result
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function getTaskFocusTime(sessions: FocusSession[], taskId: string): number {
  return sessions
    .filter((s) => s.taskId === taskId && s.type === 'focus')
    .reduce((acc, s) => {
      if (s.endTime) {
        return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000
      }
      return acc + s.duration
    }, 0)
}
