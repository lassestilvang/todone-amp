import React, { useState } from 'react'
import { Share2, UserPlus, Trash2, Lock, Eye, Edit3 } from 'lucide-react'
import { Button } from './Button'
import { useAuthStore } from '@/store/authStore'
import { logger } from '@/utils/logger'

interface ProjectSharingProps {
  projectId: string
  onClose?: () => void
}

export const ProjectSharing: React.FC<ProjectSharingProps> = ({ projectId, onClose }) => {
  const { user } = useAuthStore()
  const shares: Array<{ id: string; projectId: string; email: string; role: string }> = []
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'viewer'>('member')
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState('')

  const projectShares = shares.filter((s) => s.projectId === projectId)

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      setError('Email is required')
      return
    }
    if (!inviteEmail.includes('@')) {
      setError('Invalid email format')
      return
    }

    logger.info('Adding collaborator:', { projectId, inviteEmail, inviteRole })

    setInviteEmail('')
    setInviteRole('member')
    setShowInvite(false)
    setError('')
  }

  const handleRoleChange = (shareId: string, newRole: 'member' | 'admin' | 'viewer') => {
    logger.info('Update role logic here', { shareId, newRole })
  }

  const handleRemove = (shareId: string) => {
    if (confirm('Remove this collaborator?')) {
      logger.info('Remove logic here', { shareId })
    }
  }

  const canManageAccess = user && (user as { role?: string }).role === 'admin'

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-primary p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-brand-500" />
          <h3 className="font-medium text-content-primary">Project Sharing</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-content-tertiary hover:text-content-secondary">
            ×
          </button>
        )}
      </div>

      {/* Collaborators list */}
      {projectShares.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          <p className="text-xs font-medium text-content-secondary">Collaborators</p>
          {projectShares.map((share) => {
            const s = share as { id: string; email: string; role: string }
            return (
            <div key={s.id} className="flex items-center justify-between rounded bg-surface-secondary p-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-content-primary">{s.email}</p>
                <p className="text-xs text-content-tertiary">
                  {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                </p>
              </div>

              {canManageAccess && (
                <div className="flex items-center gap-2">
                  <select
                    value={s.role}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(s.id, e.target.value as 'member' | 'admin' | 'viewer')}
                    className="rounded border border-border px-2 py-1 text-xs text-content-secondary"
                  >
                    <option value="member">Member - Can edit</option>
                    <option value="admin">Admin - Full access</option>
                    <option value="viewer">Viewer - View only</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(s.id)}
                    title="Remove collaborator"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          )})}
        </div>
      ) : (
        <p className="text-sm text-content-tertiary">No collaborators yet</p>
      )}

      {/* Invite section */}
      {canManageAccess && (
        <div className="border-t border-border pt-3">
          {!showInvite ? (
            <Button variant="secondary" size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4" />
              Invite collaborator
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value)
                  setError('')
                }}
                className="rounded border border-border px-3 py-2 text-sm text-content-primary placeholder-content-tertiary"
              />

              <div className="flex items-center gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin' | 'viewer')}
                  className="flex-1 rounded border border-border px-3 py-2 text-sm text-content-secondary"
                >
                  <option value="viewer">Viewer - Can only view</option>
                  <option value="member">Member - Can edit</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>

              {error && <p className="text-xs text-semantic-error">{error}</p>}

              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handleInvite}>
                  Invite
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowInvite(false)
                    setInviteEmail('')
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permission summary */}
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-xs font-medium text-content-secondary">Roles & Permissions</p>
        <div className="flex flex-col gap-2 text-xs text-content-secondary">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Viewer: View only</span>
          </div>
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            <span>Member: View & edit tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Admin: Manage project & members</span>
          </div>
        </div>
      </div>
    </div>
  )
}
