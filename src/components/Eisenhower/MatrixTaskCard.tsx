import React from 'react'
import { Task } from '@/types'
import { formatDueDate, isTaskOverdue } from '@/utils/date'
import { cn } from '@/utils/cn'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface MatrixTaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  isSelected?: boolean
}

const priorityColors: Record<string, string> = {
  p1: 'border-l-red-500',
  p2: 'border-l-orange-500',
  p3: 'border-l-blue-500',
  p4: 'border-l-gray-300',
}

export const MatrixTaskCard: React.FC<MatrixTaskCardProps> = ({
  task,
  onToggle,
  onSelect,
  isSelected,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDateOverdue = task.dueDate && isTaskOverdue(task.dueDate)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 p-2 bg-white rounded border-l-4 shadow-sm',
        'hover:shadow-md transition-shadow cursor-pointer',
        priorityColors[task.priority ?? 'p4'],
        isSelected && 'ring-2 ring-brand-500',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={() => onSelect(task.id)}
    >
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </button>

      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => {
          e.stopPropagation()
          onToggle(task.id)
        }}
        className={cn(
          'w-4 h-4 rounded border-2 cursor-pointer transition-all flex-shrink-0',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
          task.completed ? 'bg-brand-600 border-brand-600' : 'border-gray-300'
        )}
      />

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

      {task.dueDate && (
        <span
          className={cn(
            'text-xs font-medium whitespace-nowrap',
            dueDateOverdue ? 'text-red-600' : 'text-gray-500'
          )}
        >
          {formatDueDate(task.dueDate)}
        </span>
      )}
    </div>
  )
}
