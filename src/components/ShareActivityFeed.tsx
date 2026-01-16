import { useActivityStore } from '@/store/activityStore'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

interface ShareActivityFeedProps {
  projectId: string
  className?: string
  maxItems?: number
}

const shareActionIcons: Record<string, string> = {
  shared: '🔗',
  unshared: '🔓',
  permissionChanged: '🔐',
  memberAdded: '👤',
  memberRemoved: '👥',
}

export function ShareActivityFeed({
  projectId,
  className = '',
  maxItems = 10,
}: ShareActivityFeedProps) {
  const { activities } = useActivityStore()
  const { members } = useTeamMemberStore()

  // Filter activities related to sharing for this project
  const shareActivities = activities
    .filter((a) => a.taskId === projectId || a.action.includes('share'))
    .filter(
      (a) =>
        a.action === 'shared' ||
        a.action === 'unshared' ||
        a.action === 'permissionChanged' ||
        a.action === 'memberAdded' ||
        a.action === 'memberRemoved'
    )
    .slice(0, maxItems)

  if (shareActivities.length === 0) {
    return (
      <div className={`rounded bg-surface-secondary p-3 text-center text-sm text-content-tertiary ${className}`}>
        No sharing activity yet
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-content-secondary">Share Activity</h3>
      <div className="space-y-2 rounded border border-border">
        {shareActivities.map((activity) => {
          const member = members.find((m) => m.userId === activity.userId)
          const icon = shareActionIcons[activity.action] || '📝'

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 border-b border-border p-3 last:border-b-0"
            >
              <span className="text-lg">{icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-content-primary">
                  {member?.name || 'Unknown'} {getActionLabel(activity.action)}
                </p>
                <p className="text-xs text-content-tertiary">
                  {formatRelativeTime(activity.timestamp)}
                </p>
                {activity.newValue && typeof activity.newValue === 'string' ? (
                  <p className="mt-1 text-xs text-content-secondary">
                    Role: <span className="font-medium">{activity.newValue}</span>
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    shared: 'shared the project',
    unshared: 'removed access',
    permissionChanged: 'changed permissions',
    memberAdded: 'added to project',
    memberRemoved: 'removed from project',
  }
  return labels[action] || action
}
