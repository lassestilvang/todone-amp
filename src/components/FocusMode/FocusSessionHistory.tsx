import React, { useEffect, useMemo } from 'react'
import { Clock, Target, AlertCircle, Calendar } from 'lucide-react'
import clsx from 'clsx'
import { useFocusStore } from '@/store/focusStore'
import { useTaskStore } from '@/store/taskStore'
import { calculateFocusStats, getDailyStats, formatDuration } from '@/utils/focusStats'

interface FocusSessionHistoryProps {
  userId: string
}

const SESSION_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  focus: {
    label: 'Focus',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  'short-break': {
    label: 'Short Break',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  'long-break': {
    label: 'Long Break',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
}

export const FocusSessionHistory: React.FC<FocusSessionHistoryProps> = ({ userId }) => {
  const { sessions, loading, loadSessions } = useFocusStore()
  const { tasks } = useTaskStore()

  useEffect(() => {
    loadSessions(userId)
  }, [userId, loadSessions])

  const stats = useMemo(() => calculateFocusStats(sessions), [sessions])
  const dailyStats = useMemo(() => getDailyStats(sessions, 7), [sessions])

  const maxFocusMinutes = useMemo(
    () => Math.max(...dailyStats.map((d) => d.focusMinutes), 1),
    [dailyStats]
  )

  const getTaskName = (taskId: string | null): string | null => {
    if (!taskId) return null
    const task = tasks.find((t) => t.id === taskId)
    return task?.content ?? null
  }

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getSessionDuration = (session: { startTime: Date; endTime: Date | null; duration: number }): number => {
    if (session.endTime) {
      return (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
    }
    return session.duration
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-surface-secondary p-4">
          <div className="flex items-center gap-2 text-content-secondary">
            <Target className="h-4 w-4" />
            <span className="text-sm">Total Sessions</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {stats.totalSessions}
          </p>
        </div>

        <div className="rounded-lg bg-surface-secondary p-4">
          <div className="flex items-center gap-2 text-content-secondary">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Focus Time</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {formatDuration(stats.totalFocusTime)}
          </p>
        </div>

        <div className="rounded-lg bg-surface-secondary p-4">
          <div className="flex items-center gap-2 text-content-secondary">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Interruptions</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {stats.totalInterruptions}
          </p>
        </div>

        <div className="rounded-lg bg-surface-secondary p-4">
          <div className="flex items-center gap-2 text-content-secondary">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Current Streak</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-primary p-4">
        <h3 className="mb-4 text-sm font-medium text-content-primary">Last 7 Days</h3>
        <div className="flex items-end gap-2 h-32">
          {dailyStats.map((day) => {
            const height = (day.focusMinutes / maxFocusMinutes) * 100
            const dayLabel = new Date(day.date).toLocaleDateString([], { weekday: 'short' })
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full flex items-end justify-center h-24">
                  <div
                    className={clsx(
                      'w-full max-w-8 rounded-t transition-all',
                      day.focusMinutes > 0
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-interactive-secondary'
                    )}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.focusMinutes}m focus`}
                  />
                </div>
                <span className="text-xs text-content-tertiary">{dayLabel}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-primary">
        <h3 className="border-b border-border px-4 py-3 text-sm font-medium text-content-primary">
          Recent Sessions
        </h3>
        {sessions.length === 0 ? (
          <p className="p-4 text-sm text-content-tertiary">No sessions yet</p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.slice(0, 10).map((session) => {
              const badge = SESSION_TYPE_BADGES[session.type] ?? SESSION_TYPE_BADGES.focus
              const taskName = getTaskName(session.taskId)
              const duration = getSessionDuration(session)

              return (
                <li key={session.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          badge.className
                        )}
                      >
                        {badge.label}
                      </span>
                      <span className="text-sm text-content-secondary">
                        {formatDate(session.startTime)} at {formatTime(session.startTime)}
                      </span>
                    </div>
                    {taskName && (
                      <span className="truncate text-sm text-content-primary">
                        {taskName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-content-secondary">
                    <span className="whitespace-nowrap">{formatDuration(duration)}</span>
                    {session.type === 'focus' && session.interruptions > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        {session.interruptions}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
