import React, { useEffect } from 'react'
import { CheckCircle, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface CompletionStatsProps {
  className?: string
}

export const CompletionStats: React.FC<CompletionStatsProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user)
  const { completionStats, getPersonalAnalytics, isLoading } = useAnalyticsStore()

  useEffect(() => {
    if (user?.id) {
      getPersonalAnalytics(user.id)
    }
  }, [user?.id, getPersonalAnalytics])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 p-6',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!completionStats) {
    return (
      <div className={cn('rounded-lg border border-gray-200 p-6 text-center', className)}>
        <p className="text-sm text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Tasks */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Tasks</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{completionStats.totalTasks}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-100" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Completed</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {completionStats.completedTasks}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-100" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Completion Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {completionStats.completionRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-100" />
          </div>
        </div>

        {/* Average Per Week */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Per Week</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {completionStats.averagePerWeek}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Daily Average */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">Daily Average</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{completionStats.averagePerDay}</p>
          <p className="text-sm text-gray-600">tasks/day</p>
        </div>
      </div>
    </div>
  )
}
