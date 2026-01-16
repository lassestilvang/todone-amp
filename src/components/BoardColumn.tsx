import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { BoardCard } from './BoardCard'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types'

interface BoardColumnProps {
  columnId: string
  title: string
  tasks: Task[]
  expandedTaskIds: Set<string>
  onToggleExpanded: (taskId: string) => void
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, task: Task) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop?: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void
  onAddTask?: (columnId: string) => void
  color?: string
  count?: number
}

export function BoardColumn({
  columnId,
  title,
  tasks,
  expandedTaskIds,
  onToggleExpanded,
  onDragStart,
  onDragOver,
  onDrop,
  onAddTask,
  color = 'gray',
  count,
}: BoardColumnProps) {
  const { getSubtasks } = useTaskStore()

  const colorClasses: Record<string, string> = {
    red: 'border-t-red-500 bg-red-50',
    orange: 'border-t-orange-500 bg-orange-50',
    blue: 'border-t-blue-500 bg-blue-50',
    green: 'border-t-green-500 bg-green-50',
    purple: 'border-t-purple-500 bg-purple-50',
    pink: 'border-t-pink-500 bg-pink-50',
    indigo: 'border-t-indigo-500 bg-indigo-50',
    yellow: 'border-t-yellow-500 bg-yellow-50',
    gray: 'border-t-gray-500 bg-gray-50',
  }

  const columnColor = colorClasses[color] || colorClasses.gray

  return (
    <div
      className={cn('flex flex-col h-full bg-surface-primary rounded-lg border border-border overflow-hidden')}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, columnId)}
    >
      {/* Column Header */}
      <div className={cn('px-4 py-3 border-t-4 font-semibold text-content-primary flex items-center justify-between', columnColor)}>
        <div className="flex items-center gap-2">
          <span className="text-sm">{title}</span>
          {count !== undefined && <span className="text-xs px-2 py-0.5 bg-interactive-secondary text-content-secondary rounded-full">{count}</span>}
        </div>
        <button
          onClick={() => onAddTask?.(columnId)}
          className="p-1 hover:bg-interactive-secondary rounded transition-colors"
          title="Add task"
        >
          <Plus size={18} className="text-content-secondary" />
        </button>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-content-tertiary text-sm">Empty column</div>
        ) : (
          tasks.map((task) => {
            const subtasksCount = getSubtasks(task.id).length
            const isExpanded = expandedTaskIds.has(task.id)

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart?.(e, task)}
                className="select-none"
              >
                <BoardCard
                  task={task}
                  hasSubtasks={subtasksCount}
                  isExpanded={isExpanded}
                  onToggleExpanded={onToggleExpanded}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
