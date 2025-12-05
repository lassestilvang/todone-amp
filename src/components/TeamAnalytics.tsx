import React, { useEffect, useState } from 'react'
import { Loader2, Users, TrendingUp, CheckCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { cn } from '@/utils/cn'

interface TeamAnalyticsProps {
  teamId?: string
  className?: string
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ teamId, className }) => {
  const { memberStats, getMemberStats, isLoading } = useAnalyticsStore()
  const [dateRange, setDateRange] = useState<{
    start: Date
    end: Date
  } | null>(null)

  useEffect(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (teamId) {
      getMemberStats(teamId, {
        start: thirtyDaysAgo,
        end: now,
      })
    }

    setDateRange({
      start: thirtyDaysAgo,
      end: now,
    })
  }, [teamId, getMemberStats])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 p-12',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!memberStats || memberStats.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 p-8 text-center', className)}>
        <Users className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-3 text-sm text-gray-600">No team data available</p>
      </div>
    )
  }

  const chartData = memberStats.map((stat) => ({
    name: stat.name.split(' ')[0],
    completed: stat.tasksCompleted,
    created: stat.tasksCreated,
  }))

  const topPerformer = memberStats.reduce((prev, current) =>
    current.completionRate > prev.completionRate ? current : prev
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Members */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Team Members</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{memberStats.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-100" />
          </div>
        </div>

        {/* Total Completed */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Completed</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {memberStats.reduce((sum, stat) => sum + stat.tasksCompleted, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-100" />
          </div>
        </div>

        {/* Avg Completion Rate */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Completion Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {(
                  memberStats.reduce((sum, stat) => sum + stat.completionRate, 0) /
                  memberStats.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-100" />
          </div>
        </div>
      </div>

      {/* Member Comparison Chart */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Member Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="created" fill="#3b82f6" name="Created" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Member Details Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Member</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Completed</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Created</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Completion Rate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Avg Time (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {memberStats.map((stat) => (
                <tr key={stat.userId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {stat.avatar && (
                        <img src={stat.avatar} alt={stat.name} className="h-6 w-6 rounded-full" />
                      )}
                      <span className="font-medium text-gray-900">{stat.name}</span>
                      {stat.userId === topPerformer.userId && (
                        <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                          🏆 Top
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{stat.tasksCompleted}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.tasksCreated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 rounded-full bg-gray-200 h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, stat.completionRate)}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {stat.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{stat.averageCompletionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dateRange && (
        <p className="text-xs text-gray-600">
          Data from {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
