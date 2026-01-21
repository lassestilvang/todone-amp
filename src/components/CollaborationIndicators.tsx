import { useState, useEffect } from 'react'
import { useShareStore } from '@/store/shareStore'
import { useTeamMemberStore } from '@/store/teamMemberStore'

interface CollaborationIndicatorsProps {
  projectId: string
  className?: string
}

export function CollaborationIndicators({
  projectId,
  className = '',
}: CollaborationIndicatorsProps) {
  const { projectShares } = useShareStore()
  const { members } = useTeamMemberStore()
  const [viewingUsers, setViewingUsers] = useState<string[]>([])
  const [editingUsers, setEditingUsers] = useState<string[]>([])

  // Simulate real-time presence (future: replace with WebSocket)
  useEffect(() => {
    const timer = setInterval(() => {
      const shares = projectShares.filter((s) => s.projectId === projectId)
      if (shares.length > 0) {
        // Simulate random viewing/editing (for demo purposes)
        setViewingUsers(shares.slice(0, Math.max(1, Math.floor(shares.length / 2))).map((s) => s.userId))
        setEditingUsers(
          shares
            .slice(Math.max(0, Math.floor(shares.length / 2)), Math.floor(shares.length * 0.75))
            .map((s) => s.userId)
        )
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [projectId, projectShares])

  const getMemberDetails = (userId: string) => {
    return members.find((m) => m.userId === userId)
  }

  return (
    <div className={className}>
      {/* Viewing indicator */}
      {viewingUsers.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-content-secondary">Currently viewing:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {viewingUsers.map((userId) => {
              const member = getMemberDetails(userId)
              return (
                <span
                  key={`viewing-${userId}`}
                  className="inline-flex items-center gap-1 rounded-full bg-semantic-info-light px-2 py-1 text-xs text-semantic-info"
                >
                  <span className="h-2 w-2 rounded-full bg-semantic-info"></span>
                  {member?.name || 'Unknown'}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Editing indicator */}
      {editingUsers.length > 0 && (
        <div>
          <p className="text-xs font-medium text-content-secondary">Currently editing:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {editingUsers.map((userId) => {
              const member = getMemberDetails(userId)
              return (
                <span
                  key={`editing-${userId}`}
                  className="inline-flex items-center gap-1 rounded-full bg-semantic-success-light px-2 py-1 text-xs text-semantic-success"
                >
                  <span className="h-2 w-2 rounded-full bg-semantic-success animate-pulse"></span>
                  {member?.name || 'Unknown'}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Permission indicators */}
      {projectShares.filter((s) => s.projectId === projectId).length > 0 && (
        <div className="mt-3 rounded bg-surface-secondary p-2">
          <p className="mb-1 text-xs font-medium text-content-secondary">
            Collaborators ({projectShares.filter((s) => s.projectId === projectId).length})
          </p>
          <div className="space-y-1">
            {projectShares
              .filter((s) => s.projectId === projectId)
              .map((share) => {
                const member = getMemberDetails(share.userId)
                return (
                  <div key={share.id} className="flex items-center justify-between text-xs">
                    <span className="text-content-secondary">{member?.name || 'Unknown'}</span>
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-medium ${
                        share.role === 'owner'
                          ? 'bg-accent-purple-subtle text-accent-purple'
                          : share.role === 'admin'
                            ? 'bg-accent-orange-subtle text-accent-orange'
                            : 'bg-semantic-info-light text-semantic-info'
                      }`}
                    >
                      {share.role.charAt(0).toUpperCase() + share.role.slice(1)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
