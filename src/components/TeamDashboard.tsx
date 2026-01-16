import React from 'react'
import { Users, Activity, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { useTeamStore } from '@/store/teamStore'
import type { TeamMember } from '@/types'

interface TeamMemberWithMetrics extends TeamMember {
  tasksAssigned?: number
  tasksCompleted?: number
  tasksOverdue?: number
  status?: 'active' | 'inactive'
  lastActive?: Date | string
}

interface TeamDashboardProps {
  teamId?: string
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ teamId }) => {
  const { teams } = useTeamStore()
  // In a real app, this would come from useTeamMemberStore
  const members: TeamMemberWithMetrics[] = []

  const currentTeam = teamId ? teams.find((t) => t.id === teamId) : teams[0]
  const teamMembers = members.filter((m) => m.teamId === currentTeam?.id)

  const calculateMetrics = () => {
    return {
      totalMembers: teamMembers.length,
      activeToday: teamMembers.filter((m: TeamMemberWithMetrics) => {
        const lastActive = new Date(m.lastActive || 0)
        const today = new Date()
        return (
          lastActive.toDateString() === today.toDateString() && m.status === 'active'
        )
      }).length,
      tasksAssigned: teamMembers.reduce((sum: number, m: TeamMemberWithMetrics) => sum + (m.tasksAssigned || 0), 0),
      completionRate: teamMembers.length
        ? Math.round(
            (teamMembers.reduce((sum: number, m: TeamMemberWithMetrics) => sum + (m.tasksCompleted || 0), 0) /
              teamMembers.reduce((sum: number, m: TeamMemberWithMetrics) => sum + (m.tasksAssigned || 0), 0)) *
              100
          ) || 0
        : 0,
    }
  }

  const metrics = calculateMetrics()

  const getRiskLevel = (member: TeamMemberWithMetrics): 'high' | 'medium' | 'low' => {
    const overdueTasks = member?.tasksOverdue || 0
    const total = member?.tasksAssigned || 0

    if (overdueTasks > total * 0.5) return 'high'
    if (overdueTasks > total * 0.25) return 'medium'
    return 'low'
  }

  const atRiskMembers = teamMembers.filter((m: TeamMemberWithMetrics) => getRiskLevel(m) !== 'low')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-brand-500" />
          <h2 className="text-xl font-semibold text-content-primary">Team Dashboard</h2>
        </div>
        {currentTeam && <p className="text-sm text-content-secondary">{currentTeam.name}</p>}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary">Total Members</p>
          <p className="mt-2 text-2xl font-bold text-content-primary">{metrics.totalMembers}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary">Active Today</p>
          <p className="mt-2 text-2xl font-bold text-semantic-success">{metrics.activeToday}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary">Tasks Assigned</p>
          <p className="mt-2 text-2xl font-bold text-semantic-info">{metrics.tasksAssigned}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-4">
          <p className="text-xs font-medium text-content-secondary">Completion Rate</p>
          <p className="mt-2 text-2xl font-bold text-brand-500">{metrics.completionRate}%</p>
        </div>
      </div>

      {/* Team Members Workload */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-primary p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-500" />
          <h3 className="font-semibold text-content-primary">Team Workload</h3>
        </div>

        <div className="flex flex-col gap-3">
          {teamMembers.length > 0 ? (
            teamMembers.map((member: TeamMemberWithMetrics) => (
              <div key={member.id} className="flex flex-col gap-2 border-b border-surface-tertiary pb-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-content-primary">{member.name}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-content-secondary">
                  <span>
                    {member.tasksCompleted || 0} / {member.tasksAssigned || 0} tasks completed
                  </span>
                  <span className="font-medium">
                    {member.tasksAssigned ? Math.round(((member.tasksCompleted || 0) / member.tasksAssigned) * 100) : 0}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-interactive-secondary">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-300"
                    style={{
                      width: `${member.tasksAssigned ? Math.round(((member.tasksCompleted || 0) / member.tasksAssigned) * 100) : 0}%`,
                    }}
                  />
                </div>

                {member.tasksOverdue ? (
                  <p className="text-xs text-semantic-error">
                    {member.tasksOverdue} overdue task{member.tasksOverdue !== 1 ? 's' : ''}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-content-tertiary">No team members yet</p>
          )}
        </div>
      </div>

      {/* At-Risk Tasks */}
      {atRiskMembers.length > 0 && (
        <div className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">At-Risk Members</h3>
          </div>

          <div className="flex flex-col gap-2">
            {atRiskMembers.map((member: TeamMemberWithMetrics) => (
              <div key={member.id} className="rounded bg-surface-primary p-3">
                <p className="font-medium text-content-primary">{member.name}</p>
                <p className="text-xs text-semantic-error">
                  {member.tasksOverdue} overdue / {member.tasksAssigned} assigned
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Activity */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-primary p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-500" />
          <h3 className="font-semibold text-content-primary">Recent Activity</h3>
        </div>

        <div className="flex flex-col gap-3">
          {teamMembers.slice(0, 5).map((member: TeamMemberWithMetrics) => (
            <div key={member.id} className="flex items-center justify-between border-b border-surface-tertiary pb-2 text-sm">
              <span className="text-content-secondary">{member.name} completed a task</span>
              <span className="text-xs text-content-tertiary">
                {member.lastActive
                  ? new Date(member.lastActive).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-primary p-4 hover:bg-surface-tertiary">
          <Users className="h-5 w-5 text-brand-500" />
          <span className="text-xs font-medium text-content-primary">Members</span>
        </button>

        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-primary p-4 hover:bg-surface-tertiary">
          <Calendar className="h-5 w-5 text-brand-500" />
          <span className="text-xs font-medium text-content-primary">Schedule</span>
        </button>

        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-primary p-4 hover:bg-surface-tertiary">
          <TrendingUp className="h-5 w-5 text-brand-500" />
          <span className="text-xs font-medium text-content-primary">Analytics</span>
        </button>

        <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-primary p-4 hover:bg-surface-tertiary">
          <Activity className="h-5 w-5 text-brand-500" />
          <span className="text-xs font-medium text-content-primary">Reports</span>
        </button>
      </div>
    </div>
  )
}
