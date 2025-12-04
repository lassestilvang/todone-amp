import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTaskStore } from '@/store/taskStore'
import type { Task } from '@/types'

interface SubTaskItemProps {
  task: Task
  depth: number
  isExpanded: boolean
  hasSubtasks: boolean
  subtasks: Task[]
  onToggleExpanded: (taskId: string) => void
  onDelete: (taskId: string) => void
  onAddSubtask: (parentId: string) => void
  onSelectTask: (taskId: string) => void
  getSubtasks: (parentId: string) => Task[]
  expandedTaskIds: Set<string>
}

export function SubTaskItem({
  task,
  depth,
  isExpanded,
  hasSubtasks,
  subtasks,
  onToggleExpanded,
  onDelete,
  onAddSubtask,
  onSelectTask,
  getSubtasks: getSubtasksFn,
  expandedTaskIds,
}: SubTaskItemProps) {
  const { toggleTask } = useTaskStore()

  const handleToggleComplete = async (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('stopPropagation' in e) {
      e.stopPropagation()
    }
    await toggleTask(task.id)
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'hover:bg-gray-100 group',
          task.completed && 'opacity-60',
          depth > 0 && 'ml-4'
        )}
      >
        {/* Expand/Collapse Button */}
        {hasSubtasks && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded(task.id)
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!hasSubtasks && <div className="w-6" />}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="w-5 h-5 rounded cursor-pointer accent-brand-600"
        />

        {/* Task Content */}
        <div
          onClick={() => onSelectTask(task.id)}
          className="flex-1 cursor-pointer"
        >
          <div className={cn('text-sm font-medium', task.completed && 'line-through text-gray-500')}>
            {task.content}
          </div>
          {task.description && (
            <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">{task.description}</div>
          )}
        </div>

        {/* Priority Badge */}
        {task.priority && !task.completed && (
          <div
            className={cn('text-xs font-bold rounded px-2 py-1', {
              'bg-red-100 text-red-700': task.priority === 'p1',
              'bg-orange-100 text-orange-700': task.priority === 'p2',
              'bg-blue-100 text-blue-700': task.priority === 'p3',
              'bg-gray-100 text-gray-700': task.priority === 'p4',
            })}
          >
            {task.priority.toUpperCase()}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddSubtask(task.id)
            }}
            className="p-1 hover:bg-brand-100 text-brand-600 rounded transition-colors"
            title="Add subtask"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {isExpanded && subtasks.length > 0 && (
        <div>
          {subtasks.map((subtask) => {
            const isSubtaskExpanded = expandedTaskIds.has(subtask.id)
            const subtaskChildren = getSubtasksFn(subtask.id)
            return (
              <SubTaskItem
                key={subtask.id}
                task={subtask}
                depth={depth + 1}
                isExpanded={isSubtaskExpanded}
                hasSubtasks={subtaskChildren.length > 0}
                subtasks={subtaskChildren}
                onToggleExpanded={onToggleExpanded}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                onSelectTask={onSelectTask}
                getSubtasks={getSubtasksFn}
                expandedTaskIds={expandedTaskIds}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
