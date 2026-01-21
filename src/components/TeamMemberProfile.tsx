import React, { useState } from 'react'
import { Mail, Calendar, User, MessageSquare, Activity, Zap } from 'lucide-react'
import type { TeamMember } from '@/types'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface TeamMemberMetrics {
  tasksAssigned: number
  tasksCompleted: number
  tasksOverdue: number
  completionRate: number
  status: 'active' | 'inactive'
  lastActive: Date | string
  karmaPoints?: number
}

interface TeamMemberProfileProps {
  member: TeamMember
  metrics?: TeamMemberMetrics
  className?: string
  compact?: boolean
  onContact?: (memberId: string, type: 'email' | 'message') => void
}

export const TeamMemberProfile: React.FC<TeamMemberProfileProps> = ({
  member,
  metrics,
  className,
  compact = false,
  onContact,
}) => {
  const [showDetails, setShowDetails] = useState(false)

  const getInitials = (name: string | undefined): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const lastActiveText = metrics?.lastActive
    ? formatDistanceToNow(new Date(metrics.lastActive), { addSuffix: true })
    : 'Never'

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'owner':
        return 'bg-priority-p1-bg text-priority-p1'
      case 'admin':
        return 'bg-accent-purple-subtle text-accent-purple'
      default:
        return 'bg-semantic-info-light text-semantic-info'
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border bg-surface-primary p-3',
          className
        )}
      >
        <div className="relative">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-white text-sm font-bold">
              {getInitials(member.name)}
            </div>
          )}
          <div
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-primary',
              metrics?.status === 'active' ? 'bg-semantic-success' : 'bg-content-tertiary'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-content-primary truncate">{member.name || 'Unnamed'}</p>
          <p className="text-xs text-content-tertiary truncate">{member.email || 'No email'}</p>
        </div>

        <div className="flex items-center gap-1">
          <span className={cn('text-xs font-medium px-2 py-1 rounded', getRoleColor(member.role))}>
            {member.role}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4 rounded-lg border border-border bg-surface-primary p-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 text-white text-2xl font-bold">
              {getInitials(member.name)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-content-primary">{member.name || 'Unnamed'}</h3>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  metrics?.status === 'active' ? 'bg-semantic-success' : 'bg-content-tertiary'
                )}
              />
            </div>
            <p className="text-sm text-content-secondary">{member.email}</p>
          </div>
        </div>

        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', getRoleColor(member.role))}>
          {member.role}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-content-tertiary" />
          <a href={`mailto:${member.email}`} className="text-sm text-semantic-info hover:underline">
            {member.email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-content-tertiary" />
          <span className="text-sm text-content-secondary">
            Joined {new Date(member.joinedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-semantic-info-light p-2">
              <p className="text-xs text-content-secondary">Assigned</p>
              <p className="mt-1 text-lg font-bold text-semantic-info">{metrics.tasksAssigned}</p>
            </div>
            <div className="rounded-md bg-semantic-success-light p-2">
              <p className="text-xs text-content-secondary">Completed</p>
              <p className="mt-1 text-lg font-bold text-icon-success">{metrics.tasksCompleted}</p>
            </div>
            <div className="rounded-md bg-accent-orange-subtle p-2">
              <p className="text-xs text-content-secondary">Overdue</p>
              <p className="mt-1 text-lg font-bold text-icon-orange">{metrics.tasksOverdue}</p>
            </div>
          </div>

          <div className="rounded-md bg-surface-secondary p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-content-tertiary" />
                <span className="text-xs text-content-secondary">Completion Rate</span>
              </div>
              <span className="text-sm font-bold text-content-primary">{Math.round(metrics.completionRate)}%</span>
            </div>
          </div>

          {metrics.status === 'active' && (
            <div className="rounded-md bg-semantic-success-light p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-icon-success" />
                  <span className="text-xs text-semantic-success">Active {lastActiveText}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {onContact && (
        <div className="flex gap-2 border-t border-border pt-4">
          <button
            onClick={() => onContact(member.id, 'email')}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-content-secondary hover:bg-surface-tertiary"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={() => onContact(member.id, 'message')}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-content-secondary hover:bg-surface-tertiary"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-center text-xs text-semantic-info hover:text-semantic-info"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-border pt-4">
          <div className="space-y-2 text-xs text-content-secondary">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-3 w-3" />
                Member ID
              </span>
              <code className="rounded bg-surface-tertiary px-2 py-1 font-mono">{member.id.slice(0, 8)}</code>
            </div>
            <div className="flex items-center justify-between">
              <span>Role</span>
              <span className="capitalize font-medium">{member.role}</span>
            </div>
            {metrics?.karmaPoints !== undefined && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Karma Points
                </span>
                <span className="font-medium">{metrics.karmaPoints}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
