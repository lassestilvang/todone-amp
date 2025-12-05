import { useState } from 'react'
import { useShareStore } from '@/store/shareStore'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import type { UserRole } from '@/types'
import { cn } from '@/utils/cn'

interface ShareProjectModalProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose?: () => void
  currentUserId: string
  teamId?: string
}

export function ShareProjectModal({
  projectId,
  projectName,
  isOpen,
  onClose,
  currentUserId,
  teamId,
}: ShareProjectModalProps) {
  const { projectShares, loadProjectShares, shareProject, unshareProject, shareProjectWithTeam, generateShareLink } = useShareStore()
  const { members } = useTeamMemberStore()
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole>('member')
  const [isSharing, setIsSharing] = useState(false)
  const [showShareLink, setShowShareLink] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  if (!isOpen) return null

  const shares = projectShares.filter((s) => s.projectId === projectId)
  const teamMembers = teamId
    ? members.filter((m) => m.teamId === teamId && m.userId !== currentUserId)
    : []

  const sharedUserIds = shares.map((s) => s.userId)
  const availableUsers = teamMembers.filter((m) => !sharedUserIds.includes(m.userId))

  const handleShare = async () => {
    if (selectedUserIds.length === 0) return

    setIsSharing(true)
    try {
      for (const userId of selectedUserIds) {
        await shareProject(projectId, userId, selectedRole)
      }
      setSelectedUserIds([])
      await loadProjectShares(projectId)
    } finally {
      setIsSharing(false)
    }
  }

  const handleUnshare = async (shareId: string) => {
    await unshareProject(shareId)
    await loadProjectShares(projectId)
  }

  const handleRoleChange = async (shareId: string, newRole: UserRole) => {
    const { updateSharePermission } = useShareStore.getState()
    await updateSharePermission(shareId, newRole)
    await loadProjectShares(projectId)
  }

  const handleShareWithTeam = async () => {
    if (!teamId) return
    setIsSharing(true)
    try {
      await shareProjectWithTeam(projectId, teamId, selectedRole)
      await loadProjectShares(projectId)
    } finally {
      setIsSharing(false)
    }
  }

  const handleGenerateLink = () => {
    const link = generateShareLink(projectId)
    setShareLink(link)
    setShowShareLink(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Fallback: select and copy
      const textarea = document.createElement('textarea')
      textarea.value = shareLink
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share "{projectName}"
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Current shares */}
        {shares.length > 0 && (
          <div className="mb-4 max-h-48 space-y-2 overflow-y-auto rounded bg-gray-50 p-3 dark:bg-gray-700">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300">Shared With</h3>
            {shares.map((share) => {
              const member = teamMembers.find((m) => m.userId === share.userId)
              return (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded bg-white p-2 dark:bg-gray-600"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={share.role}
                      onChange={(e) => handleRoleChange(share.id, e.target.value as UserRole)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button
                      onClick={() => handleUnshare(share.id)}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add new share */}
        {availableUsers.length > 0 && (
          <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Add Team Members
            </h3>

            {/* User selection */}
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-gray-200 dark:border-gray-600">
              {availableUsers.map((member) => (
                <label
                  key={member.userId}
                  className="flex cursor-pointer items-center gap-2 border-b border-gray-100 p-2 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(member.userId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds([...selectedUserIds, member.userId])
                      } else {
                        setSelectedUserIds(selectedUserIds.filter((id) => id !== member.userId))
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Permission Level
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="owner">Owner (full control)</option>
                <option value="admin">Admin (manage access)</option>
                <option value="member">Member (can modify tasks)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                disabled={isSharing || selectedUserIds.length === 0}
                className={cn(
                  'flex-1 rounded px-3 py-2 text-sm font-medium transition',
                  isSharing || selectedUserIds.length === 0
                    ? 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                )}
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </button>
              <button
                onClick={onClose}
                className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Team sharing option */}
        {teamId && (
          <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share with Entire Team
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Share with all members of this team
            </p>
            <button
              onClick={handleShareWithTeam}
              disabled={isSharing}
              className="w-full rounded px-3 py-2 text-sm font-medium transition"
              style={{
                backgroundColor: isSharing ? '#d1d5db' : '#8b5cf6',
                color: isSharing ? '#6b7280' : 'white',
              }}
            >
              {isSharing ? 'Sharing...' : 'Share with Team'}
            </button>
          </div>
        )}

        {/* Link sharing section */}
        <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Public Link
          </h3>
          <button
            onClick={handleGenerateLink}
            className="w-full rounded px-3 py-2 text-sm font-medium transition"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
            }}
          >
            Generate Share Link
          </button>

          {showShareLink && (
            <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
              <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                Share link (read-only)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    'rounded px-3 py-1 text-xs font-medium transition',
                    copySuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  )}
                >
                  {copySuccess ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* No available users message */}
        {availableUsers.length === 0 && shares.length === 0 && !showShareLink && (
          <div className="rounded bg-gray-50 p-3 text-center text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            No team members available to share with
          </div>
        )}
      </div>
    </div>
  )
}
