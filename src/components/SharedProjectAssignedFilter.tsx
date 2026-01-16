import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { useShareStore } from '@/store/shareStore'
import { cn } from '@/utils/cn'

interface SharedProjectAssignedFilterProps {
  projectId: string
  className?: string
}

export function SharedProjectAssignedFilter({ projectId, className }: SharedProjectAssignedFilterProps) {
  const { user } = useAuthStore()
  const { getTasksAssignedToMeInSharedProject } = useTaskStore()
  const { projects } = useProjectStore()
  const { projectShares } = useShareStore()

  if (!user) return null

  const project = projects.find((p) => p.id === projectId)
  if (!project) return null

  // Check if project is shared with user
  const isShared = projectShares.some((s) => s.projectId === projectId && s.userId === user.id)
  if (!isShared && project.ownerId !== user.id) {
    return (
      <div className={cn('rounded border border-dashed border-border p-4 text-center', className)}>
        <p className="text-sm text-content-tertiary">You don't have access to this project</p>
      </div>
    )
  }

  const assignedTasks = getTasksAssignedToMeInSharedProject(projectId, user.id)
  const activeTasks = assignedTasks.filter((t) => !t.completed)
  const completedTasks = assignedTasks.filter((t) => t.completed)

  if (assignedTasks.length === 0) {
    return (
      <div
        className={cn('rounded border border-dashed border-border p-4 text-center', className)}
      >
        <p className="text-sm text-content-tertiary">No tasks assigned to you in this project</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded border border-border bg-surface-primary p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-content-primary">Assigned to Me</h3>
          <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            {activeTasks.length} active
          </span>
        </div>

        {/* Active tasks */}
        {activeTasks.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-medium text-content-secondary">
              Active ({activeTasks.length})
            </h4>
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded border border-border p-2"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled
                    className="h-4 w-4 rounded border-border text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-content-primary">{task.content}</p>
                    {task.dueDate && (
                      <p className="text-xs text-content-tertiary">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {task.priority && (
                    <span
                      className={cn('rounded px-2 py-0.5 text-xs font-medium', {
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300':
                          task.priority === 'p1',
                        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300':
                          task.priority === 'p2',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300':
                          task.priority === 'p3',
                        'bg-surface-tertiary text-content-secondary':
                          task.priority === 'p4',
                      })}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-medium text-content-secondary">
              Completed ({completedTasks.length})
            </h4>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded border border-border p-2"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled
                    className="h-4 w-4 rounded border-border text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="line-through text-sm text-content-tertiary">
                      {task.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
