import React from 'react'
import { Calendar, X, Sparkles, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import type { DueDateSuggestion as DueDateSuggestionType } from '@/services/ai'

export interface DueDateSuggestionProps {
  suggestion: DueDateSuggestionType
  onAccept: (date: Date) => void
  onDismiss: () => void
  className?: string
}

function formatDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function getUrgencyColor(urgencyScore: number): string {
  if (urgencyScore >= 0.8) return 'text-semantic-error'
  if (urgencyScore >= 0.6) return 'text-semantic-warning'
  return 'text-semantic-info'
}

function getUrgencyBg(urgencyScore: number): string {
  if (urgencyScore >= 0.8) return 'bg-semantic-error-light'
  if (urgencyScore >= 0.6) return 'bg-semantic-warning-light'
  return 'bg-semantic-info-light'
}

export const DueDateSuggestion: React.FC<DueDateSuggestionProps> = ({
  suggestion,
  onAccept,
  onDismiss,
  className,
}) => {
  const { date, isDeadline, urgencyScore } = suggestion.value
  const formattedDate = formatDate(date)
  const confidencePercent = Math.round(suggestion.confidence * 100)

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
        getUrgencyBg(urgencyScore),
        'border-border',
        className
      )}
      role="region"
      aria-label="Due date suggestion"
    >
      <Sparkles className="w-4 h-4 text-accent-purple flex-shrink-0" aria-hidden="true" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Calendar className={clsx('w-4 h-4', getUrgencyColor(urgencyScore))} aria-hidden="true" />
          <span className={clsx('font-medium text-sm', getUrgencyColor(urgencyScore))}>
            {formattedDate}
          </span>
          {isDeadline && (
            <span className="flex items-center gap-1 text-xs text-semantic-warning">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              Deadline
            </span>
          )}
        </div>
        <p className="text-xs text-content-secondary mt-0.5 truncate" title={suggestion.reasoning}>
          {suggestion.reasoning} ({confidencePercent}% confidence)
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onAccept(date)}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-interactive-primary hover:bg-interactive-primary-hover text-white transition-colors"
          aria-label={`Set due date to ${formattedDate}`}
        >
          Use
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-md hover:bg-surface-tertiary text-content-tertiary hover:text-content-primary transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
