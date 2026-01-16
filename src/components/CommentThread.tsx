import { useEffect, useState } from 'react'
import { Loader, MessageSquare } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCommentStore } from '@/store/commentStore'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'

export interface CommentThreadProps {
  taskId: string
  className?: string
}

export function CommentThread({ taskId, className }: CommentThreadProps) {
  const { isLoading, loadTaskComments, getTaskComments } = useCommentStore()
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded) {
      loadTaskComments(taskId).then(() => setHasLoaded(true))
    }
  }, [taskId, hasLoaded, loadTaskComments])

  const taskComments = getTaskComments(taskId)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-content-secondary" />
        <h3 className="font-semibold text-content-primary">
          Comments
          {taskComments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-content-tertiary">
              ({taskComments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comment Form */}
      <div className="border-b border-border pb-4">
        <CommentForm
          taskId={taskId}
          onSuccess={() => {
            // Comments will be updated automatically via store
          }}
        />
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={20} className="text-content-tertiary animate-spin" />
        </div>
      ) : taskComments.length === 0 ? (
        <div className="py-8 text-center text-content-tertiary">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-0 border-t border-border">
          {taskComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}
