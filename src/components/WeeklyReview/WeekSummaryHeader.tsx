import React from 'react'
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WeeklyMetrics } from '@/store/weeklyReviewStore'

interface WeekSummaryHeaderProps {
  weekStart: Date
  weekEnd: Date
  metrics: WeeklyMetrics
}

export const WeekSummaryHeader: React.FC<WeekSummaryHeaderProps> = ({
  weekStart,
  weekEnd,
  metrics,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const year = weekEnd.getFullYear()

  const TrendIcon =
    metrics.comparedToLastWeek.tasksCompleted > 0
      ? TrendingUp
      : metrics.comparedToLastWeek.tasksCompleted < 0
        ? TrendingDown
        : Minus

  const trendColor =
    metrics.comparedToLastWeek.tasksCompleted > 0
      ? 'text-green-500'
      : metrics.comparedToLastWeek.tasksCompleted < 0
        ? 'text-red-500'
        : 'text-gray-500'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
            <Calendar className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {formatDate(weekStart)} - {formatDate(weekEnd)}, {year}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Review</p>
          </div>
        </div>
        <div className={cn('flex items-center gap-1', trendColor)}>
          <TrendIcon className="w-5 h-5" />
          <span className="text-sm font-medium">
            {metrics.comparedToLastWeek.tasksCompleted > 0 ? '+' : ''}
            {metrics.comparedToLastWeek.tasksCompleted} vs last week
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tasks Completed"
          value={metrics.tasksCompleted}
          subtext={`${metrics.tasksCreated} created`}
        />
        <StatCard
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          subtext={
            metrics.comparedToLastWeek.completionRate !== 0
              ? `${metrics.comparedToLastWeek.completionRate > 0 ? '+' : ''}${metrics.comparedToLastWeek.completionRate}% vs last week`
              : 'Same as last week'
          }
        />
        <StatCard
          label="Avg Completion Time"
          value={metrics.averageCompletionTime > 24 ? `${Math.round(metrics.averageCompletionTime / 24)}d` : `${metrics.averageCompletionTime}h`}
          subtext="from creation"
        />
        <StatCard label="Busiest Day" value={metrics.busiestDay} subtext="most tasks completed" />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  subtext: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
  </div>
)
