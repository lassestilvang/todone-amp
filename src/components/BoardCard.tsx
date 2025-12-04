import { GripHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types'

interface BoardCardProps {
  task: Task
  isDragging?: boolean
  hasSubtasks?: number
  isExpanded?: boolean
  onToggleExpanded?: (taskId: string) => void
}

export function BoardCard({ task, isDragging, hasSubtasks = 0, isExpanded = false, onToggleExpanded }: BoardCardProps) {
  const { openTaskDetail } = useTaskDetailStore()
  const { getSubtasks } = useTaskStore()

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openTaskDetail(task.id, task)
  }

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpanded?.(task.id)
  }

  const subtasks = hasSubtasks > 0 ? getSubtasks(task.id) : []

  return (
    <div
      className={cn(
        'group bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md',
        'transition-all duration-200 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-brand-500',
        task.completed && 'opacity-60'
      )}
    >
      {/* Drag Handle & Header */}
      <div className="flex items-start gap-2 mb-2">
        <GripHorizontal
          size={16}
          className={cn('text-gray-300 flex-shrink-0 mt-1', 'group-hover:text-gray-500 transition-colors')}
        />

        <div className="flex-1 min-w-0">
          {/* Title with Expand/Collapse */}
          <div className="flex items-start gap-1">
            {hasSubtasks > 0 && (
              <button
                onClick={handleToggleExpanded}
                className="p-0.5 hover:bg-gray-100 rounded transition-colors mt-0.5"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronDown
                  size={14}
                  className={cn('text-gray-500 transition-transform', !isExpanded && '-rotate-90')}
                />
              </button>
            )}
            {hasSubtasks === 0 && <div className="w-5" />}

            <h3
              onClick={handleCardClick}
              className={cn(
                'text-sm font-medium text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors',
                task.completed && 'line-through text-gray-500'
              )}
            >
              {task.content}
            </h3>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{task.description}</p>
          )}
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
        {/* Priority Badge */}
        {task.priority && !task.completed && (
          <div
            className={cn('text-xs font-bold rounded px-2 py-0.5 flex-shrink-0', {
              'bg-red-100 text-red-700': task.priority === 'p1',
              'bg-orange-100 text-orange-700': task.priority === 'p2',
              'bg-blue-100 text-blue-700': task.priority === 'p3',
              'bg-gray-100 text-gray-700': task.priority === 'p4',
            })}
          >
            {task.priority.toUpperCase()}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="text-xs text-gray-600 flex-shrink-0">
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}

        {/* Subtask Count */}
        {hasSubtasks > 0 && (
          <div className="text-xs text-gray-500 flex-shrink-0">
            {subtasks.filter((st) => st.completed).length}/{hasSubtasks}
          </div>
        )}
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.slice(0, 3).map((labelId) => (
            <div
              key={labelId}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded"
              title={labelId}
            >
              {labelId.substring(0, 1)}
            </div>
          ))}
          {task.labels.length > 3 && (
            <div className="text-xs px-1.5 py-0.5 text-gray-500">+{task.labels.length - 3}</div>
          )}
        </div>
      )}
    </div>
  )
}
