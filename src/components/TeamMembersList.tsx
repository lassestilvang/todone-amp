import { useState } from 'react'
import { Trash2, UserPlus, Shield, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import { useAuthStore } from '@/store/authStore'
import type { TeamRole } from '@/types'
import { Button } from './Button'

export interface TeamMembersListProps {
  teamId: string
  className?: string
  onAddMember?: () => void
}

export function TeamMembersList({
  teamId,
  className,
  onAddMember,
}: TeamMembersListProps) {
  const { members, removeMember, updateMemberRole } = useTeamMemberStore()
  const { user } = useAuthStore()
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [roleEdit, setRoleEdit] = useState<string | null>(null)

  const teamMembers = members.filter((m) => m.teamId === teamId)
  const isOwner = teamMembers.some((m) => m.userId === user?.id && m.role === 'owner')

  const handleRemove = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (member) {
      await removeMember(teamId, member.userId)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    const member = members.find((m) => m.id === memberId)
    if (member) {
      await updateMemberRole(teamId, member.userId, newRole)
      setRoleEdit(null)
    }
  }

  const roleOptions: TeamRole[] = ['member', 'admin', 'owner']

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-content-primary">Team Members</h3>
        {isOwner && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddMember}
            className="flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Member
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <div className="px-4 py-6 text-center text-content-tertiary">
            <p>No team members yet</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                'hover:bg-surface-tertiary transition-colors',
                selectedMember === member.id ? 'bg-brand-50 border-brand-200' : 'border-border'
              )}
              onClick={() => setSelectedMember(member.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name || 'Avatar'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-interactive-secondary flex items-center justify-center">
                    <User size={16} className="text-content-secondary" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-content-primary">{member.name || 'Unknown'}</p>
                  <p className="text-sm text-content-tertiary">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && member.userId !== user?.id ? (
                  <>
                    {roleEdit === member.id ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as TeamRole)
                        }
                        className={cn(
                          'px-2 py-1 text-sm border border-border rounded bg-surface-primary text-content-primary',
                          'focus:outline-none focus:ring-2 focus:ring-focus'
                        )}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setRoleEdit(member.id)}
                        className={cn(
                          'px-2 py-1 text-sm rounded flex items-center gap-1',
                          'text-content-secondary hover:bg-surface-tertiary transition-colors'
                        )}
                      >
                        <Shield size={14} />
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </button>
                    )}

                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1 text-semantic-error hover:bg-semantic-error-light-hover rounded transition-colors"
                      title="Remove member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-content-secondary flex items-center gap-1">
                    <Shield size={14} />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
