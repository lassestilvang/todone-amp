import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/utils/cn'
import { DraggableTaskItem } from '@/components/DraggableTaskItem'
import type { Task } from '@/types'

interface DroppableTaskListProps {
  tasks: Task[]
  droppableId: string
  isOver?: boolean
  emptyMessage?: string
  className?: string
  selectedTaskId?: string | null
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
}

export function DroppableTaskList({
  tasks,
  droppableId,
  isOver = false,
  emptyMessage = 'No tasks',
  className = '',
  selectedTaskId,
  onToggle,
  onSelect,
}: DroppableTaskListProps) {
  const { setNodeRef } = useDroppable({
    id: droppableId,
    data: { type: 'task-list' },
  })

  return (
    <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-2 transition-all duration-200 ease-out',
          isOver && 'bg-brand-50 border-2 border-brand-300 rounded-lg p-2 shadow-sm',
          className
        )}
      >
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-content-tertiary">
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onSelect={onSelect}
              isSelected={selectedTaskId === task.id}
            />
          ))
        )}
      </div>
    </SortableContext>
  )
}
