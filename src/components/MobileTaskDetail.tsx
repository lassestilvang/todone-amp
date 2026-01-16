import React from 'react'
import { Edit2, Trash2, Share2, CheckCircle2, Circle } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import type { Task } from '@/types'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'

interface MobileTaskDetailProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

/**
 * Mobile-optimized task detail view using BottomSheet
 * Supports viewing, editing, and managing task actions via context menu
 */
export const MobileTaskDetail: React.FC<MobileTaskDetailProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { toggleTask, deleteTask } = useTaskStore()

  if (!task) return null

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'toggle',
      label: task.completed ? 'Mark Incomplete' : 'Mark Complete',
      icon: task.completed ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />,
      action: () => {
        toggleTask(task.id)
        onClose()
      },
    },
    {
      id: 'edit',
      label: 'Edit Task',
      icon: <Edit2 className="w-4 h-4" />,
      action: () => {
        onEdit?.(task)
        onClose()
      },
    },
    {
      id: 'share',
      label: 'Share Task',
      icon: <Share2 className="w-4 h-4" />,
      action: () => {
        // Share functionality would be implemented here
      },
    },
    {
      id: 'delete',
      label: 'Delete Task',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => {
        deleteTask(task.id)
        onDelete?.(task.id)
        onClose()
      },
      isDangerous: true,
    },
  ]

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'p1':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'p2':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      case 'p3':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'text-content-secondary bg-surface-secondary'
    }
  }

  const priorityLabel = {
    p1: 'High',
    p2: 'Medium',
    p3: 'Low',
    p4: 'Very Low',
  }[task.priority || 'p3'] || 'No Priority'

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Task Details" fullHeight={false}>
      <ContextMenu items={contextMenuItems}>
        <div className="space-y-4">
          {/* Task Content */}
          <div
            className={cn(
              'p-4 rounded-lg border-l-4',
              task.completed
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 line-through text-content-tertiary'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            )}
          >
            <h2 className="text-lg font-bold text-content-primary break-words">
              {task.content}
            </h2>
          </div>

          {/* Priority */}
          {task.priority && (
            <div>
              <label className="block text-xs font-semibold text-content-secondary uppercase mb-1">
                Priority
              </label>
              <span className={cn('inline-block px-3 py-1 rounded-full text-sm font-medium', getPriorityColor(task.priority))}>
                {priorityLabel}
              </span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div>
              <label className="block text-xs font-semibold text-content-secondary uppercase mb-1">
                Due Date
              </label>
              <p className="text-content-primary">
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-xs font-semibold text-content-secondary uppercase mb-2">
                Description
              </label>
              <p className="text-content-secondary leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-content-secondary uppercase mb-2">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <span
                    key={label}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-content-secondary uppercase mb-1">
              Status
            </label>
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-sm font-medium',
                task.completed
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
              )}
            >
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>

          {/* Created/Updated Date */}
          <div className="pt-2 border-t border-border text-xs text-content-tertiary">
            <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(task.updatedAt).toLocaleDateString()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => toggleTask(task.id)}
              className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-interactive-secondary text-content-primary rounded-lg font-medium hover:bg-surface-tertiary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </ContextMenu>
    </BottomSheet>
  )
}
