import React, { useEffect } from 'react'
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useTaskStore } from '@/store/taskStore'
import { useGamificationStore } from '@/store/gamificationStore'
import { useAuthStore } from '@/store/authStore'
import { KarmaWidget } from './KarmaWidget'
import { AIInsights } from './AIInsights'
import { cn } from '@/utils/cn'

interface PersonalDashboardProps {
  userId: string
  className?: string
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ userId, className }) => {
  const analyticsStore = useAnalyticsStore()
  const taskStore = useTaskStore()
  const initializeStats = useGamificationStore((state) => state.initializeStats)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // Load analytics for the past 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    analyticsStore.getPersonalAnalytics(userId, { start: thirtyDaysAgo, end: now })
    analyticsStore.getAtRiskTasks(userId)
  }, [userId, analyticsStore])

  // Initialize gamification stats
  useEffect(() => {
    if (user) {
      initializeStats(user.id)
    }
  }, [user, initializeStats])

  const stats = analyticsStore.completionStats
  const atRiskTasks = analyticsStore.atRiskTasks
  const tasks = taskStore.tasks

  // Calculate quick metrics
  const todaysTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    )
  })

  const todaysCompleted = todaysTasks.filter((t) => t.completed).length
  const overdueTasks = tasks.filter((task) => {
    if (task.completed || !task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    return dueDate < new Date()
  }).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-content-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-content-secondary">Your productivity at a glance</p>
      </div>

      {/* Karma Widget - Hide on mobile, show on tablet+ */}
      <div className="hidden sm:block">
        <KarmaWidget />
      </div>

      {/* Mobile Karma Stats - Compact version */}
      <div className="sm:hidden space-y-2">
        <KarmaWidget />
      </div>

      {/* AI Insights Widget */}
      <AIInsights />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Tasks */}
        <div className="rounded-lg border border-border bg-surface-primary p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 sm:gap-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-content-secondary">Today's Tasks</p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-content-primary">{todaysCompleted}</p>
              <p className="mt-1 text-xs text-content-tertiary">of {todaysTasks.length}</p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
          </div>
          <div className="mt-4 h-2 bg-interactive-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: `${todaysTasks.length > 0 ? (todaysCompleted / todaysTasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-lg border border-border bg-surface-primary p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-content-secondary">Completion Rate</p>
              <p className="mt-2 text-3xl font-bold text-content-primary">
                {stats ? `${Math.round(stats.completionRate)}%` : '0%'}
              </p>
              <p className="mt-1 text-xs text-content-tertiary">Last 30 days</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-semantic-success" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="rounded-lg border border-border bg-surface-primary p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-content-secondary">Overdue</p>
              <p className="mt-2 text-3xl font-bold text-content-primary">{overdueTasks}</p>
              <p className="mt-1 text-xs text-content-tertiary">Need attention</p>
            </div>
            <AlertCircle className="h-8 w-8 text-semantic-error" />
          </div>
        </div>

        {/* Daily Average */}
        <div className="rounded-lg border border-border bg-surface-primary p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-content-secondary">Daily Average</p>
              <p className="mt-2 text-3xl font-bold text-content-primary">
                {stats ? stats.averagePerDay : 0}
              </p>
              <p className="mt-1 text-xs text-content-tertiary">Tasks/day</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* At-Risk Tasks Section */}
      {atRiskTasks.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-primary p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-content-primary mb-4">
            <AlertCircle className="h-5 w-5 text-semantic-warning" />
            At-Risk Tasks
          </h2>

          <div className="space-y-2">
            {atRiskTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3"
              >
                <Clock className="h-4 w-4 text-semantic-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">{task.content}</p>
                  <p className="text-xs text-semantic-warning">
                    {task.daysOverdue > 0
                      ? `${task.daysOverdue} day${task.daysOverdue > 1 ? 's' : ''} overdue`
                      : `Due in ${Math.abs(task.daysOverdue)} day${Math.abs(task.daysOverdue) > 1 ? 's' : ''}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'flex-shrink-0 text-xs font-medium px-2 py-1 rounded',
                    task.priority === 'p1'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'p2'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {task.priority || 'p3'}
                </span>
              </div>
            ))}
          </div>

          {atRiskTasks.length > 5 && (
            <p className="mt-3 text-xs text-content-tertiary text-center">
              +{atRiskTasks.length - 5} more at-risk task{atRiskTasks.length - 5 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary uppercase">Weekly Average</p>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {stats ? stats.averagePerWeek : 0}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary uppercase">Total Completed</p>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {stats ? stats.completedTasks : 0}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary uppercase">Total Created</p>
          <p className="mt-1 text-2xl font-bold text-content-primary">
            {stats ? stats.totalTasks : 0}
          </p>
        </div>
      </div>
    </div>
  )
}
