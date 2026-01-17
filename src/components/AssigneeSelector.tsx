import { useState, useRef, useEffect } from 'react'
import { User, Check, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import { useTeamStore } from '@/store/teamStore'
import { AssigneeBadge } from './AssigneeBadge'

export interface AssigneeSelectorProps {
  assigneeIds?: string[]
  onChange: (assigneeIds: string[]) => void
  teamId?: string
  disabled?: boolean
  className?: string
}

export function AssigneeSelector({
  assigneeIds = [],
  onChange,
  teamId,
  disabled = false,
  className,
}: AssigneeSelectorProps) {
  const { members } = useTeamMemberStore()
  const { currentTeamId } = useTeamStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTeamId = teamId || currentTeamId

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      inputRef.current?.focus()
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const teamMembers = activeTeamId
    ? members.filter((m) => m.teamId === activeTeamId)
    : members

  const filteredMembers = teamMembers.filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      member.name?.toLowerCase().includes(query) || member.email?.toLowerCase().includes(query)
    )
  })

  const selectedMembers = members.filter((m) => assigneeIds.includes(m.userId))

  const handleToggleAssignee = (userId: string) => {
    const newAssigneeIds = assigneeIds.includes(userId)
      ? assigneeIds.filter((id) => id !== userId)
      : [...assigneeIds, userId]

    onChange(newAssigneeIds)
  }

  const handleRemove = (userId: string) => {
    onChange(assigneeIds.filter((id) => id !== userId))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border',
        'text-sm font-medium text-content-secondary bg-surface-primary w-full',
        'hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        'justify-between',
        isOpen && 'ring-2 ring-brand-500'
      )}
      >
        <span className="flex items-center gap-2">
          <User size={16} />
          {assigneeIds.length === 0 ? 'Assign to...' : `${assigneeIds.length} assigned`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface-primary border border-border rounded-lg shadow-lg">
          <div className="p-3 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full px-2 py-1.5 text-sm border border-border rounded',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
              )}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-content-tertiary">No team members found</div>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => handleToggleAssignee(member.userId)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm flex items-center gap-3',
                    'hover:bg-surface-tertiary transition-colors',
                    assigneeIds.includes(member.userId) && 'bg-brand-50 dark:bg-brand-900/30'
                  )}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-interactive-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-content-secondary">
                        {member.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-content-primary">{member.name || 'Unknown'}</p>
                    <p className="text-xs text-content-tertiary truncate">{member.email}</p>
                  </div>

                  {assigneeIds.includes(member.userId) && (
                    <Check size={18} className="text-brand-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {assigneeIds.length > 0 && (
            <>
              <div className="border-t border-border p-2">
                <p className="text-xs font-semibold text-content-tertiary px-2 py-1">Selected</p>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {selectedMembers.map((member) => (
                    <AssigneeBadge
                      key={member.userId}
                      assigneeId={member.userId}
                      onRemove={() => handleRemove(member.userId)}
                      showRemove
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-border px-4 py-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange([])
                    setIsOpen(false)
                  }}
                  className="text-sm text-semantic-error hover:opacity-80 font-medium flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {assigneeIds.length > 0 && !isOpen && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedMembers.map((member) => (
            <AssigneeBadge
              key={member.userId}
              assigneeId={member.userId}
              onRemove={() => handleRemove(member.userId)}
              showRemove
            />
          ))}
        </div>
      )}
    </div>
  )
}
