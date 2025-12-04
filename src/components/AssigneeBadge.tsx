import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTeamMemberStore } from '@/store/teamMemberStore'

export interface AssigneeBadgeProps {
  assigneeId: string
  onRemove?: (assigneeId: string) => void
  className?: string
  showRemove?: boolean
}

export function AssigneeBadge({
  assigneeId,
  onRemove,
  className,
  showRemove = true,
}: AssigneeBadgeProps) {
  const { members } = useTeamMemberStore()
  const assignee = members.find((m) => m.userId === assigneeId)

  if (!assignee) {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full',
        'bg-brand-50 text-brand-700 text-sm font-medium',
        'border border-brand-200',
        className
      )}
    >
      {assignee.avatar ? (
        <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-brand-300 flex items-center justify-center text-xs font-bold text-white">
          {assignee.name?.charAt(0).toUpperCase() || '?'}
        </div>
      )}

      <span>{assignee.name || assignee.email}</span>

      {showRemove && onRemove && (
        <button
          onClick={() => onRemove(assigneeId)}
          className="hover:text-brand-900 transition-colors ml-0.5"
          title={`Remove ${assignee.name}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
