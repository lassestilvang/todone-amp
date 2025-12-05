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
      <div className={cn('rounded border border-dashed border-gray-300 p-4 text-center', className)}>
        <p className="text-sm text-gray-500">You don't have access to this project</p>
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
        className={cn('rounded border border-dashed border-gray-300 p-4 text-center', className)}
      >
        <p className="text-sm text-gray-500">You haven't created any tasks in this project</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white">My Contributions</h3>
          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {completedCount}/{totalCount} completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Completion</span>
            <span>{completionRate}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {myTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded border border-gray-100 p-2 dark:border-gray-800"
            >
              <input
                type="checkbox"
                checked={task.completed}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <div className="flex-1">
                <p
                  className={cn('text-sm', {
                    'line-through text-gray-400 dark:text-gray-600': task.completed,
                    'text-gray-900 dark:text-white': !task.completed,
                  })}
                >
                  {task.content}
                </p>
              </div>
              {task.priority && (
                <span
                  className={cn('rounded px-2 py-0.5 text-xs font-medium', {
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': task.priority === 'p1',
                    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300':
                      task.priority === 'p2',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300':
                      task.priority === 'p3',
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300':
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
    </div>
  )
}
