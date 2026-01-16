import React, { useMemo, useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import type { Task, Priority } from '@/types'
import { MobileTaskDetail } from './MobileTaskDetail'
import { cn } from '@/utils/cn'

interface MobileInboxViewProps {
  onCreateTask?: () => void
  onTaskSelect?: (task: Task) => void
  className?: string
}

type InboxFilter = 'all' | 'active' | 'completed'

/**
 * MobileInboxView - Full-screen task list optimized for mobile
 * Displays tasks with swipe actions and touch-friendly interface
 */
export const MobileInboxView: React.FC<MobileInboxViewProps> = ({
  onCreateTask,
  onTaskSelect,
  className,
}) => {
  const { getFilteredTasks, toggleTask } = useTaskStore()
  const [filter, setFilter] = useState<InboxFilter>('active')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filteredTasks = useMemo(() => {
    const allTasks = getFilteredTasks()
    return allTasks.filter((task) => {
      if (filter === 'all') return true
      if (filter === 'active') return !task.completed
      if (filter === 'completed') return task.completed
      return true
    })
  }, [filter, getFilteredTasks])

  const activeTasks = filteredTasks.filter((t) => !t.completed)
  const completedTasks = filteredTasks.filter((t) => t.completed)

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowDetail(true)
    onTaskSelect?.(task)
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'p1':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'p2':
        return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'p3':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-l-4 border-gray-300 dark:border-gray-600'
    }
  }

  const priorityLabel = (priority: Priority | undefined) => {
    const labels: Record<string, string> = {
      p1: 'High',
      p2: 'Med',
      p3: 'Low',
      p4: 'V.Low',
    }
    return priority ? labels[priority] || '' : ''
  }

  return (
    <div className={cn('flex flex-col h-screen bg-surface-primary', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-content-primary">Inbox</span>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
            {activeTasks.length}
          </span>
        </div>

        <button
          onClick={onCreateTask}
          className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
        >
          <Plus className="w-6 h-6 text-content-primary" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-border flex gap-2">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-surface-tertiary text-content-secondary'
            )}
          >
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pb-4">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-content-tertiary">
              {filter === 'completed' ? 'No completed tasks' : 'No tasks'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Active Tasks Section */}
            {filter !== 'completed' && activeTasks.length > 0 && (
              <>
                <div className="sticky top-0 px-4 py-2 bg-surface-secondary border-b border-border">
                  <span className="text-xs font-semibold text-content-secondary uppercase">
                    Active Tasks
                  </span>
                </div>
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={cn(
                      'p-4 transition-colors cursor-pointer',
                      getPriorityColor(task.priority),
                      'hover:bg-surface-tertiary active:bg-surface-tertiary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleTask(task.id)
                        }}
                        className={cn(
                          'mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                          task.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-border hover:border-blue-500'
                        )}
                      >
                        {task.completed && <span className="text-white text-sm">✓</span>}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-medium break-words',
                            task.completed
                              ? 'line-through text-content-tertiary'
                              : 'text-content-primary'
                          )}
                        >
                          {task.content}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-content-secondary">
                          {task.priority && (
                            <span className="px-2 py-0.5 bg-surface-primary rounded">
                              {priorityLabel(task.priority)}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="px-2 py-0.5 bg-surface-primary rounded">
                              {new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      <ChevronDown className="w-5 h-5 text-content-tertiary flex-shrink-0 -rotate-90" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Completed Tasks Section */}
            {(filter === 'all' || filter === 'completed') && completedTasks.length > 0 && (
              <>
                <div className="sticky top-0 px-4 py-2 bg-surface-secondary border-b border-border">
                  <span className="text-xs font-semibold text-content-secondary uppercase">
                    Completed ({completedTasks.length})
                  </span>
                </div>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={cn(
                      'p-4 transition-colors cursor-pointer',
                      'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500',
                      'hover:bg-green-100 dark:hover:bg-green-900/30 active:opacity-75'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium break-words line-through text-content-tertiary">
                          {task.content}
                        </p>
                        {task.completedAt && (
                          <p className="text-xs text-content-tertiary mt-1">
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <ChevronDown className="w-5 h-5 text-content-tertiary flex-shrink-0 -rotate-90" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Task Detail Modal */}
      <MobileTaskDetail
        task={selectedTask}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false)
          setSelectedTask(null)
        }}
        onEdit={() => {
          // Would trigger edit modal in parent
        }}
        onDelete={() => {
          setShowDetail(false)
          setSelectedTask(null)
        }}
      />
    </div>
  )
}
