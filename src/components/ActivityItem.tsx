import { CheckCircle, MessageSquare, User, Tag, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import type { Activity } from '@/types'

export interface ActivityItemProps {
  activity: Activity
  className?: string
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'completed':
      return <CheckCircle size={16} className="text-icon-success" />
    case 'commented':
      return <MessageSquare size={16} className="text-icon-info" />
    case 'assigned':
    case 'unassigned':
      return <User size={16} className="text-icon-purple" />
    case 'labeled':
    case 'unlabeled':
      return <Tag size={16} className="text-icon-orange" />
    case 'dateChanged':
      return <Calendar size={16} className="text-icon-teal" />
    case 'priorityChanged':
      return <AlertCircle size={16} className="text-icon-error" />
    default:
      return <AlertCircle size={16} className="text-content-secondary" />
  }
}

function formatActivityMessage(activity: Activity, author: string): string {
  switch (activity.action) {
    case 'created':
      return `${author} created this task`
    case 'completed':
      return `${author} marked this as done`
    case 'commented':
      return `${author} commented`
    case 'assigned':
      return `${author} assigned this task`
    case 'unassigned':
      return `${author} unassigned this task`
    case 'labeled':
      return `${author} added label: ${activity.newValue}`
    case 'unlabeled':
      return `${author} removed label: ${activity.oldValue}`
    case 'priorityChanged':
      return `${author} changed priority to ${activity.newValue}`
    case 'dateChanged':
      return `${author} changed due date to ${activity.newValue}`
    case 'statusChanged':
      return `${author} changed status to ${activity.newValue}`
    case 'deleted':
      return `${author} deleted this task`
    case 'moved':
      return `${author} moved this task`
    case 'updated':
      return `${author} updated this task`
    default:
      return `${author} performed an action`
  }
}

export function ActivityItem({ activity, className }: ActivityItemProps) {
  const { members } = useTeamMemberStore()
  const author = members.find((m) => m.userId === activity.userId)
  const authorName = author?.name || 'Unknown'

  return (
    <div className={cn('flex gap-3 py-2 px-3 hover:bg-surface-tertiary rounded transition-colors', className)}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getActivityIcon(activity.action)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-sm text-content-secondary">
            {formatActivityMessage(activity, authorName)}
          </p>
          <p className="text-xs text-content-tertiary whitespace-nowrap">
            {formatRelativeTime(activity.timestamp)}
          </p>
        </div>

        {/* Additional details */}
        {activity.changes && Object.keys(activity.changes).length > 0 && (
          <div className="text-xs text-content-secondary mt-1 pl-0">
            {Object.entries(activity.changes).map(([key, value]) => (
              <div key={key} className="text-content-tertiary">
                {key}: {String(value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
