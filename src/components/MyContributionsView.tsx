import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { useShareStore } from '@/store/shareStore'
import { cn } from '@/utils/cn'

interface MyContributionsViewProps {
  projectId: string
  className?: string
}

export function MyContributionsView({ projectId, className }: MyContributionsViewProps) {
  const { user } = useAuthStore()
  const { getMyContributionsInSharedProject } = useTaskStore()
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

  const myTasks = getMyContributionsInSharedProject(projectId, user.id)
  const completedCount = myTasks.filter((t) => t.completed).length
  const totalCount = myTasks.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (myTasks.length === 0) {
    return (
      <div
        className={cn('rounded border border-dashed border-border p-4 text-center', className)}
      >
        <p className="text-sm text-content-tertiary">You haven't created any tasks in this project</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded border border-border bg-surface-primary p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-content-primary">My Contributions</h3>
          <span className="rounded bg-info-light px-2 py-1 text-xs font-medium text-info">
            {completedCount}/{totalCount} completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-content-secondary">
            <span>Completion</span>
            <span>{completionRate}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-interactive-secondary">
            <div
              className="h-full bg-info transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {myTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded border border-border p-2"
            >
              <input
                type="checkbox"
                checked={task.completed}
                disabled
                className="h-4 w-4 rounded border-border text-brand-600"
              />
              <div className="flex-1">
                <p
                  className={cn('text-sm', {
                    'line-through text-content-tertiary': task.completed,
                    'text-content-primary': !task.completed,
                  })}
                >
                  {task.content}
                </p>
              </div>
              {task.priority && (
                <span
                  className={cn('rounded px-2 py-0.5 text-xs font-medium', {
                    'bg-priority-p1-bg text-priority-p1': task.priority === 'p1',
                    'bg-priority-p2-bg text-priority-p2': task.priority === 'p2',
                    'bg-priority-p3-bg text-priority-p3': task.priority === 'p3',
                    'bg-surface-tertiary text-content-secondary': task.priority === 'p4',
                  })}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
