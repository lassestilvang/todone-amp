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
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800',
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
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800',
              metrics?.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{member.name || 'Unnamed'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email || 'No email'}</p>
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
    <div className={cn('space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800', className)}>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name || 'Unnamed'}</h3>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  metrics?.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
          </div>
        </div>

        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', getRoleColor(member.role))}>
          {member.role}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <a href={`mailto:${member.email}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            {member.email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Joined {new Date(member.joinedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-900">
              <p className="text-xs text-gray-600 dark:text-gray-400">Assigned</p>
              <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">{metrics.tasksAssigned}</p>
            </div>
            <div className="rounded-md bg-green-50 p-2 dark:bg-green-900">
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">{metrics.tasksCompleted}</p>
            </div>
            <div className="rounded-md bg-orange-50 p-2 dark:bg-orange-900">
              <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="mt-1 text-lg font-bold text-orange-600 dark:text-orange-400">{metrics.tasksOverdue}</p>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(metrics.completionRate)}%</span>
            </div>
          </div>

          {metrics.status === 'active' && (
            <div className="rounded-md bg-green-50 p-2 dark:bg-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-700 dark:text-green-300">Active {lastActiveText}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {onContact && (
        <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={() => onContact(member.id, 'email')}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={() => onContact(member.id, 'message')}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-3 w-3" />
                Member ID
              </span>
              <code className="rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-700">{member.id.slice(0, 8)}</code>
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
