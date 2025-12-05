import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
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
} from 'recharts'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface ProductivityChartProps {
  granularity?: 'daily' | 'weekly' | 'monthly'
  className?: string
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  granularity = 'weekly',
  className,
}) => {
  const user = useAuthStore((state) => state.user)
  const { productivityData, getProductivityTimeline, isLoading } = useAnalyticsStore()

  useEffect(() => {
    if (user?.id) {
      getProductivityTimeline(user.id, granularity)
    }
  }, [user?.id, granularity, getProductivityTimeline])

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

  if (!productivityData || productivityData.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 p-8 text-center', className)}>
        <p className="text-sm text-gray-600">No productivity data available</p>
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Line Chart - Trend */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Completion Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Comparison */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Tasks Created vs Completed</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="created" fill="#3b82f6" name="Created" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Distribution */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Distribution</h3>
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
