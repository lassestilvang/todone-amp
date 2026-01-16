import { useActivityStore } from '@/store/activityStore'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import { useProjectStore } from '@/store/projectStore'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { cn } from '@/utils/cn'

interface TeamActivityOnSharedProjectProps {
  projectId: string
  maxItems?: number
  className?: string
}

const activityIcons: Record<string, string> = {
  created: '✨',
  updated: '✏️',
  completed: '✅',
  deleted: '🗑️',
  moved: '📍',
  assigned: '👤',
  unassigned: '👥',
  commented: '💬',
  labeled: '🏷️',
  unlabeled: '❌',
  priorityChanged: '⚡',
  dateChanged: '📅',
  statusChanged: '🔄',
  shared: '🔗',
  unshared: '🔓',
  permissionChanged: '🔐',
  memberAdded: '➕',
  memberRemoved: '➖',
}

export function TeamActivityOnSharedProject({
  projectId,
  maxItems = 10,
  className,
}: TeamActivityOnSharedProjectProps) {
  const { activities } = useActivityStore()
  const { members } = useTeamMemberStore()
  const { projects } = useProjectStore()

  const project = projects.find((p) => p.id === projectId)
  if (!project) return null

  // Get all tasks in this project
  const projectTasks = activities
    .filter((a) => {
      // Filter activities that are task-related (not share-related)
      // Since we don't have a direct task reference, we filter by action type
      return a.taskId && a.action !== 'shared' && a.action !== 'unshared'
    })
    .slice(0, maxItems)

  if (projectTasks.length === 0) {
    return (
      <div
        className={cn('rounded border border-dashed border-border p-4 text-center', className)}
      >
        <p className="text-sm text-content-tertiary">No team activity yet in this project</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded border border-border bg-surface-primary">
        <div className="border-b border-border p-4">
          <h3 className="font-medium text-content-primary">Team Activity</h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {projectTasks.map((activity, index) => {
            const member = members.find((m) => m.userId === activity.userId)
            const icon = activityIcons[activity.action] || '📝'

            return (
              <div
                key={`${activity.id}-${index}`}
                className="flex items-start gap-3 border-b border-surface-tertiary p-4 last:border-b-0"
              >
                <span className="mt-0.5 text-lg">{icon}</span>

                <div className="flex-1">
                  <p className="text-sm font-medium text-content-primary">
                    {member?.name || 'Unknown'}{' '}
                    <span className="font-normal text-content-secondary">
                      {getActivityLabel(activity.action)}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-content-tertiary">
                    {formatRelativeTime(activity.timestamp)}
                  </p>

                  {/* Show value changes */}
                  {activity.newValue && typeof activity.newValue === 'string' ? (
                    <p className="mt-1 rounded bg-surface-secondary p-2 text-xs text-content-secondary">
                      <span className="font-medium">New: </span>
                      {activity.newValue}
                    </p>
                  ) : null}

                  {/* Show role for permission changes */}
                  {activity.action === 'permissionChanged' && activity.newValue && typeof activity.newValue === 'string' ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Role:
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {activity.newValue.toUpperCase()}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getActivityLabel(action: string): string {
  const labels: Record<string, string> = {
    created: 'created a task',
    updated: 'updated a task',
    completed: 'completed a task',
    deleted: 'deleted a task',
    moved: 'moved a task',
    assigned: 'assigned a task',
    unassigned: 'unassigned a task',
    commented: 'commented on a task',
    labeled: 'added a label',
    unlabeled: 'removed a label',
    priorityChanged: 'changed priority',
    dateChanged: 'changed due date',
    statusChanged: 'changed status',
    shared: 'shared the project',
    unshared: 'removed access',
    permissionChanged: 'changed permissions',
    memberAdded: 'added a member',
    memberRemoved: 'removed a member',
  }
  return labels[action] || action
}
