import React, { useEffect, useState } from 'react'
import { Loader2, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useAuthStore } from '@/store/authStore'
import { useGamificationStore } from '@/store/gamificationStore'
import { cn } from '@/utils/cn'
import {
  CHART_PRODUCTIVITY_COLORS,
  CHART_GRADIENTS,
  getChartColorArray,
} from '@/utils/chartColors'

interface ProductivityChartProps {
  granularity?: 'daily' | 'weekly' | 'monthly'
  className?: string
}

const COLORS = getChartColorArray(4)

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  granularity = 'weekly',
  className,
}) => {
  const user = useAuthStore((state) => state.user)
  const { userStats } = useGamificationStore()
  const { productivityData, getProductivityTimeline, isLoading } = useAnalyticsStore()
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'completed' | 'created'>('all')

  useEffect(() => {
    if (user?.id) {
      getProductivityTimeline(user.id, granularity)
    }
  }, [user?.id, granularity, getProductivityTimeline])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-border p-12',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-content-tertiary" />
      </div>
    )
  }

  if (!productivityData || productivityData.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border p-8 text-center', className)}>
        <p className="text-sm text-content-secondary">No productivity data available</p>
      </div>
    )
  }

  const chartData = productivityData.map((d) => ({
    date: d.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    completed: d.tasksCompleted,
    created: d.tasksCreated,
  }))

  const totalCompleted = productivityData.reduce((sum, d) => sum + d.tasksCompleted, 0)
  const totalCreated = productivityData.reduce((sum, d) => sum + d.tasksCreated, 0)
  const completionRate = totalCreated > 0 ? ((totalCompleted / totalCreated) * 100).toFixed(1) : 0
  const avgCompletedPerDay = (totalCompleted / productivityData.length).toFixed(1)

  interface StatCardProps {
    icon: React.FC<{ className?: string }>
    label: string
    value: React.ReactNode
    change?: string
  }

  const StatCard = ({ icon: Icon, label, value, change }: StatCardProps) => (
    <div className="rounded-lg border border-border bg-surface-primary p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-content-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-content-primary">{value}</p>
          {change && <p className="mt-1 text-xs text-semantic-success">↑ {change}</p>}
        </div>
        <Icon className="h-5 w-5 text-content-tertiary" />
      </div>
    </div>
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Key Metrics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-content-primary">Your Productivity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CheckCircle}
            label="Total Completed"
            value={totalCompleted}
            change={`${avgCompletedPerDay}/day`}
          />
          <StatCard
            icon={Clock}
            label="Total Created"
            value={totalCreated}
            change={userStats ? `${userStats.currentStreak} day streak` : undefined}
          />
          <StatCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${completionRate}%`}
            change={totalCreated > totalCompleted ? 'Tasks pending' : 'On track'}
          />
          <StatCard
            icon={Zap}
            label="Total Karma"
            value={userStats?.karma || 0}
            change={`Level ${userStats?.karmaLevel || 'N/A'}`}
          />
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2 border-b border-border">
        {['all', 'completed', 'created'].map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric as 'all' | 'completed' | 'created')}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
              selectedMetric === metric
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            )}
          >
            {metric === 'all' ? 'All Metrics' : metric === 'completed' ? 'Completed' : 'Created'}
          </button>
        ))}
      </div>

      {/* Area Chart - Trend */}
      <div className="rounded-lg border border-border bg-surface-primary p-4">
        <h3 className="mb-4 text-sm font-semibold text-content-primary">Completion Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          {selectedMetric === 'all' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={CHART_GRADIENTS.completed.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_GRADIENTS.completed.color} stopOpacity={CHART_GRADIENTS.completed.startOpacity} />
                  <stop offset="95%" stopColor={CHART_GRADIENTS.completed.color} stopOpacity={CHART_GRADIENTS.completed.endOpacity} />
                </linearGradient>
                <linearGradient id={CHART_GRADIENTS.created.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_GRADIENTS.created.color} stopOpacity={CHART_GRADIENTS.created.startOpacity} />
                  <stop offset="95%" stopColor={CHART_GRADIENTS.created.color} stopOpacity={CHART_GRADIENTS.created.endOpacity} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stroke={CHART_PRODUCTIVITY_COLORS.completed}
                fill={`url(#${CHART_GRADIENTS.completed.id})`}
                name="Completed"
                isAnimationActive
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke={CHART_PRODUCTIVITY_COLORS.created}
                fill={`url(#${CHART_GRADIENTS.created.id})`}
                name="Created"
                isAnimationActive
              />
            </AreaChart>
          ) : selectedMetric === 'completed' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke={CHART_PRODUCTIVITY_COLORS.completed}
                strokeWidth={2}
                name="Completed"
                isAnimationActive
              />
            </LineChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke={CHART_PRODUCTIVITY_COLORS.created}
                strokeWidth={2}
                name="Created"
                isAnimationActive
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Comparison */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-4 text-sm font-medium text-content-primary">Tasks Created vs Completed</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="created" fill={CHART_PRODUCTIVITY_COLORS.created} name="Created" />
            <Bar dataKey="completed" fill={CHART_PRODUCTIVITY_COLORS.completed} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Distribution */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-4 text-sm font-medium text-content-primary">Distribution</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: 'Completed',
                    value: productivityData.reduce((sum, d) => sum + d.tasksCompleted, 0),
                  },
                  {
                    name: 'Created',
                    value: productivityData.reduce((sum, d) => sum + d.tasksCreated, 0),
                  },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
