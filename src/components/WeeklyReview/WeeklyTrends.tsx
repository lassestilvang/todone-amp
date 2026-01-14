import React from 'react'
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WeeklyMetrics } from '@/store/weeklyReviewStore'

interface WeeklyTrendsProps {
  metrics: WeeklyMetrics
}

export const WeeklyTrends: React.FC<WeeklyTrendsProps> = ({ metrics }) => {
  const lastWeekCompleted = metrics.tasksCompleted - metrics.comparedToLastWeek.tasksCompleted
  const lastWeekRate = metrics.completionRate - metrics.comparedToLastWeek.completionRate

  const maxCompleted = Math.max(metrics.tasksCompleted, lastWeekCompleted, 1)

  const currentBarHeight = (metrics.tasksCompleted / maxCompleted) * 100
  const lastBarHeight = (lastWeekCompleted / maxCompleted) * 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-brand-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Trends</h3>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Tasks Completed Comparison */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
            Tasks Completed
          </p>
          <div className="flex items-end justify-center gap-4 h-32">
            <div className="flex flex-col items-center">
              <div
                className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t-lg transition-all duration-500"
                style={{ height: `${lastBarHeight}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last Week</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lastWeekCompleted}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-12 bg-brand-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${currentBarHeight}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">This Week</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metrics.tasksCompleted}
              </span>
            </div>
          </div>
          <TrendIndicator value={metrics.comparedToLastWeek.tasksCompleted} suffix=" tasks" />
        </div>

        {/* Completion Rate Comparison */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
            Completion Rate
          </p>
          <div className="flex items-end justify-center gap-4 h-32">
            <div className="flex flex-col items-center">
              <div
                className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t-lg transition-all duration-500"
                style={{ height: `${lastWeekRate}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Last Week</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lastWeekRate}%
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-12 bg-green-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${metrics.completionRate}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">This Week</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metrics.completionRate}%
              </span>
            </div>
          </div>
          <TrendIndicator value={metrics.comparedToLastWeek.completionRate} suffix="%" />
        </div>
      </div>
    </div>
  )
}

interface TrendIndicatorProps {
  value: number
  suffix: string
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, suffix }) => {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus
  const colorClass =
    value > 0
      ? 'text-green-500'
      : value < 0
        ? 'text-red-500'
        : 'text-gray-500 dark:text-gray-400'

  return (
    <div className={cn('flex items-center justify-center gap-1 mt-4', colorClass)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">
        {value > 0 ? '+' : ''}
        {value}
        {suffix}
      </span>
    </div>
  )
}
