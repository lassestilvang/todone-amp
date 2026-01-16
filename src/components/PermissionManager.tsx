import type { ProjectShare, UserRole } from '@/types'
import { cn } from '@/utils/cn'

interface PermissionManagerProps {
  share: ProjectShare
  onRoleChange: (shareId: string, role: UserRole) => Promise<void>
  onRemove: (shareId: string) => Promise<void>
  memberName: string
  memberEmail?: string
  isLoading?: boolean
  className?: string
}

export function PermissionManager({
  share,
  onRoleChange,
  onRemove,
  memberName,
  memberEmail,
  isLoading = false,
  className,
}: PermissionManagerProps) {
  const permissions: Array<{ value: UserRole; label: string; description: string; icon: string }> =
    [
      {
        value: 'member',
        label: 'Member',
        description: 'Can modify tasks and details',
        icon: '✏️',
      },
      {
        value: 'admin',
        label: 'Admin',
        description: 'Can manage access and settings',
        icon: '⚙️',
      },
      {
        value: 'owner',
        label: 'Owner',
        description: 'Full control and ownership',
        icon: '👑',
      },
    ]

  const currentPermission = permissions.find((p) => p.value === share.role)

  return (
    <div
      className={cn('space-y-3 rounded border border-border p-4', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-content-primary">{memberName}</p>
          {memberEmail && <p className="text-xs text-content-tertiary">{memberEmail}</p>}
        </div>
        <button
          onClick={() => onRemove(share.id)}
          disabled={isLoading}
          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
        >
          Remove
        </button>
      </div>

      {/* Permission selector */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-content-secondary">Permission Level</p>
        <div className="grid gap-2">
          {permissions.map((perm) => (
            <button
              key={perm.value}
              onClick={() => onRoleChange(share.id, perm.value)}
              disabled={isLoading}
              className={cn(
                'flex items-start gap-3 rounded border p-2 transition disabled:opacity-50',
                share.role === perm.value
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900'
                  : 'border-border hover:border-border'
              )}
            >
              <span className="text-lg">{perm.icon}</span>
              <div className="flex-1 text-left">
                <p
                  className={cn(
                    'font-medium',
                    share.role === perm.value
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-content-primary'
                  )}
                >
                  {perm.label}
                </p>
                <p className="text-xs text-content-secondary">{perm.description}</p>
              </div>
              {share.role === perm.value && (
                <div className="mt-1 text-blue-600 dark:text-blue-300">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Permission details */}
      <div className="rounded bg-surface-secondary p-2 text-xs text-content-secondary">
        {currentPermission && (
          <>
            <p className="font-medium">{currentPermission.label} access includes:</p>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              {share.role === 'member' && (
                <>
                  <li>View all tasks and sections</li>
                  <li>Create and modify tasks</li>
                  <li>Add comments and mentions</li>
                  <li>Cannot change project settings</li>
                </>
              )}
              {share.role === 'admin' && (
                <>
                  <li>Full project access</li>
                  <li>Create, modify, and delete tasks</li>
                  <li>Manage project settings</li>
                  <li>Share and manage permissions</li>
                </>
              )}
              {share.role === 'owner' && (
                <>
                  <li>Full project ownership</li>
                  <li>Create, modify, and delete tasks</li>
                  <li>Manage all project settings</li>
                  <li>Transfer or delete project</li>
                </>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
