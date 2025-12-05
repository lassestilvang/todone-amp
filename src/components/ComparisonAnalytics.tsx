import React, { useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'
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
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface ComparisonAnalyticsProps {
  className?: string
}

export const ComparisonAnalytics: React.FC<ComparisonAnalyticsProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user)
  const { comparisonStats, getComparisonAnalytics, isLoading } = useAnalyticsStore()
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week')

  useEffect(() => {
    if (user?.id) {
      const now = new Date()
      let start1: Date
      let end1: Date
      let start2: Date
      let end2: Date

      if (periodType === 'week') {
        // This week vs last week
        const dayOfWeek = now.getDay()
        const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1

        end1 = new Date(now)
        start1 = new Date(now)
        start1.setDate(start1.getDate() - daysBack)

        end2 = new Date(start1)
        start2 = new Date(start1)
        start2.setDate(start2.getDate() - 7)
      } else {
        // This month vs last month
        end1 = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        start1 = new Date(now.getFullYear(), now.getMonth(), 1)

        end2 = new Date(now.getFullYear(), now.getMonth(), 0)
        start2 = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      }

      getComparisonAnalytics(user.id, { start: start1, end: end1 }, { start: start2, end: end2 })
    }
  }, [user?.id, periodType, getComparisonAnalytics])

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

  if (!comparisonStats) {
    return (
      <div className={cn('rounded-lg border border-gray-200 p-8 text-center', className)}>
        <p className="text-sm text-gray-600">No comparison data available</p>
      </div>
    )
  }

  const isImprovement = comparisonStats.changePercentage >= 0
  const chartData = [
    {
      label: comparisonStats.period1.label,
      'Completion Rate': comparisonStats.period1.completionRate,
      'Tasks Completed': comparisonStats.period1.tasksCompleted,
    },
    {
      label: comparisonStats.period2.label,
      'Completion Rate': comparisonStats.period2.completionRate,
      'Tasks Completed': comparisonStats.period2.tasksCompleted,
    },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Period Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriodType('week')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition',
            periodType === 'week'
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          This Week vs Last Week
        </button>
        <button
          onClick={() => setPeriodType('month')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition',
            periodType === 'month'
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          This Month vs Last Month
        </button>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Period 1 */}
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600">Current Period</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {comparisonStats.period1.tasksCompleted}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {comparisonStats.period1.completionRate.toFixed(1)}% completion rate
          </p>
        </div>

        {/* Period 2 */}
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600">Previous Period</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {comparisonStats.period2.tasksCompleted}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {comparisonStats.period2.completionRate.toFixed(1)}% completion rate
          </p>
        </div>
      </div>

      {/* Change Indicator */}
      <div
        className={cn(
          'rounded-lg border p-4',
          isImprovement ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        )}
      >
        <div className="flex items-center gap-3">
          {isImprovement ? (
            <TrendingUp className="h-6 w-6 text-green-600" />
          ) : (
            <TrendingDown className="h-6 w-6 text-red-600" />
          )}
          <div>
            <p
              className={cn(
                'text-sm font-medium',
                isImprovement ? 'text-green-700' : 'text-red-700'
              )}
            >
              {isImprovement ? 'Improvement' : 'Decrease'} of{' '}
              {Math.abs(comparisonStats.changePercentage).toFixed(1)}%
            </p>
            <p className={cn('text-xs', isImprovement ? 'text-green-600' : 'text-red-600')}>
              {isImprovement
                ? 'Great progress! Keep it up.'
                : 'Try to focus more on task completion.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Completion Rate Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Completion Rate" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
