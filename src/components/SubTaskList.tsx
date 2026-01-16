import { useTaskStore } from '@/store/taskStore'
import { SubTaskItem } from './SubTaskItem'

interface SubTaskListProps {
  parentTaskId: string
  onSelectTask: (taskId: string) => void
  onTaskDeleted?: (taskId: string) => void
}

export function SubTaskList({ parentTaskId, onSelectTask, onTaskDeleted }: SubTaskListProps) {
  const { getSubtasks, toggleTaskExpanded, deleteTaskAndSubtasks, expandedTaskIds } = useTaskStore()
  const subtasks = getSubtasks(parentTaskId)

  const handleToggleExpanded = (taskId: string) => {
    toggleTaskExpanded(taskId)
  }

  const handleDelete = async (taskId: string) => {
    if (confirm('Delete this task and all its subtasks?')) {
      await deleteTaskAndSubtasks(taskId)
      onTaskDeleted?.(taskId)
    }
  }

  const handleAddSubtask = (parentId: string) => {
    // Trigger quick add with parent context
    const event = new CustomEvent('openQuickAddForSubtask', { detail: { parentId } })
    window.dispatchEvent(event)
  }

  if (subtasks.length === 0) {
    return null
  }

  return (
    <div className="space-y-1 mt-3 border-t border-border pt-3">
      <div className="text-xs font-semibold text-content-secondary px-3 mb-2">SUBTASKS</div>
      <div className="space-y-1">
        {subtasks.map((subtask) => {
          const subtaskChildren = getSubtasks(subtask.id)
          return (
            <SubTaskItem
              key={subtask.id}
              task={subtask}
              depth={0}
              isExpanded={expandedTaskIds.has(subtask.id)}
              hasSubtasks={subtaskChildren.length > 0}
              subtasks={subtaskChildren}
              onToggleExpanded={handleToggleExpanded}
              onDelete={handleDelete}
              onAddSubtask={handleAddSubtask}
              onSelectTask={onSelectTask}
              getSubtasks={getSubtasks}
              expandedTaskIds={expandedTaskIds}
            />
          )
        })}
      </div>
    </div>
  )
}
