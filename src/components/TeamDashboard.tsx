import React, { useEffect } from 'react'
import { Users, BarChart3, Activity, TrendingUp } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useTeamStore } from '@/store/teamStore'
import { cn } from '@/utils/cn'

interface TeamDashboardProps {
  teamId: string
  className?: string
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ teamId, className }) => {
  const analyticsStore = useAnalyticsStore()
  const teamStore = useTeamStore()

  useEffect(() => {
    // Load team analytics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    analyticsStore.getTeamAnalytics(teamId, { start: thirtyDaysAgo, end: now })
  }, [teamId, analyticsStore])

  const memberStats = analyticsStore.memberStats
  const team = teamStore.teams.find((t) => t.id === teamId)

  // Calculate team totals
  const teamTotal = memberStats.reduce((acc, m) => acc + m.tasksCreated, 0)
  const teamCompleted = memberStats.reduce((acc, m) => acc + m.tasksCompleted, 0)
  const teamCompletionRate = teamTotal > 0 ? (teamCompleted / teamTotal) * 100 : 0

  // Sort by most productive
  const topPerformers = [...memberStats].sort((a, b) => b.tasksCompleted - a.tasksCompleted)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">{team?.name} team performance</p>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* Total Tasks */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{teamTotal}</p>
              <p className="mt-1 text-xs text-gray-500">Last 30 days</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Team Completion Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round(teamCompletionRate)}%</p>
              <p className="mt-1 text-xs text-gray-500">{teamCompleted} completed</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {/* Team Members */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{memberStats.length}</p>
              <p className="mt-1 text-xs text-gray-500">Active contributors</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        {/* Average per Member */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg per Member</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {memberStats.length > 0 ? Math.round(teamTotal / memberStats.length) : 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">Tasks/person</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Member Performance Table */}
      {memberStats.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Member Performance</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {memberStats.map((member, index) => (
              <div
                key={member.userId}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {member.avatar && (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        #{index + 1} • {member.tasksCompleted}/{member.tasksCreated} tasks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {Math.round(member.completionRate)}%
                    </p>
                    <p className="text-xs text-gray-500">completion</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${member.completionRate}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h2>

          <div className="space-y-3">
            {topPerformers.slice(0, 3).map((member, index) => (
              <div
                key={member.userId}
                className="flex items-center gap-4 rounded-lg bg-gray-50 p-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 font-semibold text-yellow-800">
                  {index + 1}
                </span>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.tasksCompleted} completed tasks</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{member.tasksCompleted}</p>
                  <p className="text-xs text-gray-500">tasks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
