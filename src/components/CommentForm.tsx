import { useState, useRef, useEffect } from 'react'
import { Send, Loader, AtSign } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamMemberStore } from '@/store/teamMemberStore'
import { useTeamStore } from '@/store/teamStore'
import { Button } from './Button'
import { logger } from '@/utils/logger'

export interface CommentFormProps {
  taskId: string
  onSuccess?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

interface MentionSuggestion {
  userId: string
  name: string
  email: string
}

export function CommentForm({
  taskId,
  onSuccess,
  placeholder = 'Add a comment... (use @ to mention)',
  className,
  autoFocus = true,
}: CommentFormProps) {
  const { addComment } = useCommentStore()
  const { user } = useAuthStore()
  const { members } = useTeamMemberStore()
  const { currentTeamId } = useTeamStore()
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mentions, setMentions] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  if (!user) return null

  const teamMembers = currentTeamId
    ? members.filter((m) => m.teamId === currentTeamId)
    : members

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContent(value)
    setCursorPosition(e.target.selectionStart)

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowSuggestions(true)
      setSuggestions(
        teamMembers.map((m) => ({
          userId: m.userId,
          name: m.name || 'Unknown',
          email: m.email || '',
        })),
      )
    } else if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1)
      if (/^\w*$/.test(afterAt)) {
        const query = afterAt.toLowerCase()
        const filtered = teamMembers.filter(
          (m) =>
            m.name?.toLowerCase().includes(query) || m.email?.toLowerCase().includes(query),
        )
        setSuggestions(
          filtered.map((m) => ({
            userId: m.userId,
            name: m.name || 'Unknown',
            email: m.email || '',
          })),
        )
        setShowSuggestions(true)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const handleMentionSelect = (userId: string, name: string) => {
    const lastAtIndex = content.lastIndexOf('@')
    const beforeAt = content.substring(0, lastAtIndex)
    const afterContent = content.substring(cursorPosition)

    const newContent = `${beforeAt}@${name} ${afterContent}`.trim()
    setContent(newContent)
    setShowSuggestions(false)

    // Add to mentions array if not already there
    if (!mentions.includes(userId)) {
      setMentions([...mentions, userId])
    }

    // Focus textarea after selection
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user?.id) return

    setIsLoading(true)
    try {
      await addComment(taskId, user.id, content.trim(), mentions)
      setContent('')
      setMentions([])
      onSuccess?.()
    } catch (error) {
      logger.error('Failed to add comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className={cn(
            'w-full px-3 py-2 border border-border rounded-lg',
            'text-sm placeholder-content-tertiary resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          )}
        />

        {/* Mention Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute bottom-full left-0 right-0 mb-2 bg-surface-primary border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.userId}
                type="button"
                onClick={() => handleMentionSelect(suggestion.userId, suggestion.name)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm flex items-center gap-2',
                  'hover:bg-surface-tertiary transition-colors',
                )}
              >
                <AtSign size={14} className="text-content-tertiary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-content-primary truncate">{suggestion.name}</p>
                  <p className="text-xs text-content-tertiary truncate">{suggestion.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-content-tertiary">
          {mentions.length > 0 && <span>{mentions.length} mention{mentions.length !== 1 ? 's' : ''}</span>}
        </div>
        <Button
          type="submit"
          disabled={!content.trim() || isLoading}
          size="sm"
          className="flex items-center gap-2"
        >
          {isLoading && <Loader size={14} className="animate-spin" />}
          <Send size={14} />
          Comment
        </Button>
      </div>
    </form>
  )
}
