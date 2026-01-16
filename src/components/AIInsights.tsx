import React, { useEffect, useState } from 'react'
import { Brain, TrendingUp, AlertCircle, Zap } from 'lucide-react'
import { useAIStore } from '@/store/aiStore'
import { useTaskStore } from '@/store/taskStore'

export interface AIInsightsProps {
  className?: string
}

interface Insight {
  id: string
  type: 'suggestion' | 'warning' | 'opportunity'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const AIInsights: React.FC<AIInsightsProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const { getSimilarTasks } = useAIStore()
  const { tasks } = useTaskStore()

  useEffect(() => {
    const generateInsights = async () => {
      const newInsights: Insight[] = []

      // Check for duplicate-like tasks
      const incompleteTasks = tasks.filter((t) => !t.completed)
      if (incompleteTasks.length > 0) {
        const taskContents = incompleteTasks.map((t) => ({ id: t.id, content: t.content }))

        // Find potential duplicates
        const duplicateGroups = new Map<string, string[]>()
        for (const task of incompleteTasks) {
          const similar = getSimilarTasks(task.content, taskContents)
          if (similar.length > 0) {
            duplicateGroups.set(task.id, similar.map((s) => s.taskId))
          }
        }

        if (duplicateGroups.size > 0) {
          newInsights.push({
            id: 'duplicates',
            type: 'suggestion',
            title: 'Potential Duplicate Tasks',
            description: `Found ${duplicateGroups.size} tasks that might be duplicates or related.`,
            action: {
              label: 'Review',
              onClick: () => {
                // Navigate to duplicates or open modal
              },
            },
          })
        }
      }

      // Check for overdue tasks
      const overdueTasks = incompleteTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date()
      )
      if (overdueTasks.length > 0) {
        newInsights.push({
          id: 'overdue',
          type: 'warning',
          title: 'Overdue Tasks',
          description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}.`,
          action: {
            label: 'View',
            onClick: () => {
              // Filter to overdue tasks
            },
          },
        })
      }

      // Check for high-priority uncompleted tasks
      const highPriorityTasks = incompleteTasks.filter(
        (t) => t.priority === 'p1' || t.priority === 'p2'
      )
      if (highPriorityTasks.length > 5) {
        newInsights.push({
          id: 'high-priority',
          type: 'opportunity',
          title: 'Focus on High Priority',
          description: `You have ${highPriorityTasks.length} high-priority tasks. Consider breaking them into smaller subtasks.`,
          action: {
            label: 'Prioritize',
            onClick: () => {
              // Focus mode
            },
          },
        })
      }

      // Completion rate insights
      const totalTasks = tasks.length
      const completedTasks = tasks.filter((t) => t.completed).length
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      if (completionRate < 30 && totalTasks > 10) {
        newInsights.push({
          id: 'low-completion',
          type: 'suggestion',
          title: 'Low Completion Rate',
          description: `Your completion rate is ${Math.round(completionRate)}%. Try breaking tasks into smaller steps.`,
        })
      } else if (completionRate > 70) {
        newInsights.push({
          id: 'high-completion',
          type: 'opportunity',
          title: 'Great Productivity!',
          description: `Your completion rate is ${Math.round(completionRate)}%. Keep up the momentum!`,
        })
      }

      setInsights(newInsights)
      setLoading(false)
    }

    generateInsights()
  }, [tasks, getSimilarTasks])

  if (loading) {
    return (
      <div className={`p-4 bg-surface-primary rounded-lg border border-border ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-content-primary">AI Insights</h3>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-tertiary rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className={`p-4 bg-surface-primary rounded-lg border border-border ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-content-primary">AI Insights</h3>
        </div>
        <p className="text-sm text-content-secondary">No insights at the moment. Keep working!</p>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-surface-primary rounded-lg border border-border ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-content-primary">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-3 rounded-lg border-l-4 ${
              insight.type === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-500'
                : insight.type === 'opportunity'
                  ? 'bg-green-50 dark:bg-green-900 border-green-500'
                  : 'bg-blue-50 dark:bg-blue-900 border-blue-500'
            }`}
          >
            <div className="flex items-start gap-2">
              {insight.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              ) : insight.type === 'opportunity' ? (
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    insight.type === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-100'
                      : insight.type === 'opportunity'
                        ? 'text-green-800 dark:text-green-100'
                        : 'text-blue-800 dark:text-blue-100'
                  }`}
                >
                  {insight.title}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    insight.type === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-200'
                      : insight.type === 'opportunity'
                        ? 'text-green-700 dark:text-green-200'
                        : 'text-blue-700 dark:text-blue-200'
                  }`}
                >
                  {insight.description}
                </p>

                {insight.action && (
                  <button
                    onClick={insight.action.onClick}
                    className={`mt-2 text-xs font-medium px-2 py-1 rounded transition-colors ${
                      insight.type === 'warning'
                        ? 'text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                        : insight.type === 'opportunity'
                          ? 'text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                          : 'text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                    }`}
                  >
                    {insight.action.label} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
