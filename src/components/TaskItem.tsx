import React from 'react'
import { Task } from '@/types'
import { formatDueDate, isTaskOverdue } from '@/utils/date'
import { cn } from '@/utils/cn'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { useTaskDetailStore } from '@/store/taskDetailStore'
import { useTaskStore } from '@/store/taskStore'
import { RecurrenceBadge } from '@/components/RecurrenceBadge'

interface TaskItemProps {
  task: Task
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
}

const priorityConfig: Record<string, { color: string; icon: string }> = {
  p1: { color: 'text-red-600', icon: '!!!' },
  p2: { color: 'text-orange-600', icon: '!!' },
  p3: { color: 'text-blue-600', icon: '!' },
  p4: { color: 'text-gray-400', icon: '-' },
  null: { color: 'text-gray-300', icon: '-' },
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onSelect, isSelected }) => {
  const priorityConfig_ = priorityConfig[task.priority ?? 'null']
  const dueDateOverdue = task.dueDate && isTaskOverdue(task.dueDate)
  const openTaskDetail = useTaskDetailStore((state) => state.openTaskDetail)
  const { getSubtasks } = useTaskStore()
  const subtasks = getSubtasks(task.id)
  const completedSubtasks = subtasks.filter((st) => st.completed).length

  const handleTaskClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openTaskDetail(task.id, task)
  }

  return (
    <div
      onClick={() => onSelect?.(task.id)}
      className={cn(
        'flex items-center gap-3 px-4 py-2 border-l-4 cursor-pointer transition-all duration-150',
        isSelected ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-gray-50'
      )}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => {
          e.stopPropagation()
          onToggle?.(task.id)
        }}
        className={cn(
          'w-5 h-5 rounded border-2 cursor-pointer transition-all',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
          task.completed ? 'bg-brand-600 border-brand-600' : 'border-gray-300'
        )}
      />

      {/* Priority */}
      <div className={cn('w-6 text-center font-bold text-xs', priorityConfig_.color)}>
        {priorityConfig_.icon}
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0" onClick={handleTaskClick}>
        <p
          className={cn(
            'text-sm font-medium truncate',
            task.completed && 'line-through text-gray-400'
          )}
        >
          {task.content}
        </p>
      </div>

      {/* Recurrence Badge */}
      {task.recurrence && <RecurrenceBadge pattern={task.recurrence} size="sm" />}

      {/* Subtask Counter */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
          <CheckCircle2 className="w-3 h-3" />
          <span>
            {completedSubtasks}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <span
          className={cn(
            'text-xs font-medium whitespace-nowrap',
            dueDateOverdue ? 'text-red-600' : 'text-gray-600'
          )}
        >
          {formatDueDate(task.dueDate)}
        </span>
      )}

      {/* Expand Icon */}
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  )
}
