import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/utils/cn'
import { TaskItem } from '@/components/TaskItem'
import type { Task } from '@/types'

interface DraggableTaskItemProps {
  task: Task
  isDragOverlay?: boolean
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
}

export function DraggableTaskItem({
  task,
  isDragOverlay = false,
  onToggle,
  onSelect,
  isSelected,
}: DraggableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all',
        isDragging && 'opacity-50',
        isDragOverlay && 'shadow-xl scale-105 opacity-100'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'cursor-grab active:cursor-grabbing',
          isDragging && 'cursor-grabbing'
        )}
      >
        <TaskItem
          task={task}
          onToggle={onToggle}
          onSelect={onSelect}
          isSelected={isSelected}
        />
      </div>
    </div>
  )
}
