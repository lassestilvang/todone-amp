import { useState } from 'react'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import type { Comment } from '@/types'
import { Button } from './Button'
import { logger } from '@/utils/logger'

export interface CommentItemProps {
  comment: Comment
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

export function CommentItem({ comment, className }: CommentItemProps) {
  const { user: currentUser } = useAuthStore()
  const { members } = useTeamMemberStore()
  const { updateComment, deleteComment } = useCommentStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isLoading, setIsLoading] = useState(false)

  const author = members.find((m) => m.userId === comment.userId)
  const isOwner = currentUser?.id === comment.userId

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    setIsLoading(true)
    try {
      await updateComment(comment.id, editContent.trim())
      setIsEditing(false)
    } catch (error) {
      logger.error('Failed to update comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return

    setIsLoading(true)
    try {
      await deleteComment(comment.id)
    } catch (error) {
      logger.error('Failed to delete comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex gap-3 py-3', className)}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {author?.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-interactive-secondary flex items-center justify-center">
            <span className="text-xs font-bold text-content-secondary">
              {author?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-content-primary">{author?.name || 'Unknown'}</p>
          <p className="text-xs text-content-tertiary">{formatRelativeTime(comment.createdAt)}</p>
          {comment.updatedAt > comment.createdAt && (
            <p className="text-xs text-content-tertiary">(edited)</p>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className={cn(
                'w-full px-3 py-2 border border-border rounded-lg',
                'text-sm placeholder-content-tertiary resize-none',
                'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
              )}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!editContent.trim() || isLoading}
                onClick={handleSaveEdit}
                className="flex items-center gap-1"
              >
                <Check size={14} />
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <X size={14} />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-content-secondary whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Actions */}
            {isOwner && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1',
                    'text-content-secondary hover:bg-surface-tertiary rounded transition-colors',
                  )}
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1',
                    'text-semantic-error hover:bg-red-50 rounded transition-colors',
                  )}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
