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
        return 'text-priority-p1 bg-priority-p1-bg'
      case 'p2':
        return 'text-priority-p2 bg-priority-p2-bg'
      case 'p3':
        return 'text-priority-p3 bg-priority-p3-bg'
      case 'p4':
        return 'text-priority-p4 bg-priority-p4-bg'
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
                ? 'bg-semantic-success-light border-semantic-success line-through text-content-tertiary'
                : 'bg-semantic-info-light border-semantic-info'
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
                    className="px-2 py-1 bg-accent-purple-subtle text-accent-purple rounded text-xs font-medium"
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
                  ? 'bg-semantic-success-light text-semantic-success'
                  : 'bg-semantic-warning-light text-semantic-warning'
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
              className="flex-1 px-4 py-3 min-h-[48px] bg-brand-600 dark:bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 dark:hover:bg-brand-600 active:bg-brand-800 transition-colors"
            >
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 min-h-[48px] bg-interactive-secondary text-content-primary rounded-lg font-medium hover:bg-surface-tertiary active:bg-surface-tertiary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </ContextMenu>
    </BottomSheet>
  )
}
