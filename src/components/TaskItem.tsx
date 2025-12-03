import React from 'react'
import { Task } from '@/types'
import { formatDueDate, isTaskOverdue } from '@/utils/date'
import { cn } from '@/utils/cn'
import { ChevronRight } from 'lucide-react'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onSelect: (id: string) => void
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

  return (
    <div
      onClick={() => onSelect(task.id)}
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
          onToggle(task.id)
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
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            task.completed && 'line-through text-gray-400'
          )}
        >
          {task.content}
        </p>
      </div>

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
