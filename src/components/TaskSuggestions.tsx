import React, { useEffect, useState } from 'react'
import { Sparkles, AlertCircle, Check, X } from 'lucide-react'
import { useAIStore } from '@/store/aiStore'
import type { Priority, ParsedTaskSuggestion } from '@/types'
import clsx from 'clsx'

export interface TaskSuggestionsProps {
  text: string
  onSelect?: (suggestion: ParsedTaskSuggestion) => void
  existingTasks?: Array<{ id: string; content: string }>
  isOpen?: boolean
  onClose?: () => void
}

const PRIORITY_LABELS: Record<Exclude<Priority, null>, string> = {
  p1: 'P1 - Urgent',
  p2: 'P2 - High',
  p3: 'P3 - Medium',
  p4: 'P4 - Low',
}

export const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({
  text,
  onSelect,
  existingTasks = [],
  isOpen = true,
  onClose,
}) => {
  const { suggestions, loading, error, getSuggestions, detectAmbiguity, getSimilarTasks } =
    useAIStore()
  const [showAmbiguityWarning, setShowAmbiguityWarning] = useState(false)
  const [similarTasks, setSimilarTasks] = useState<Array<{ taskId: string; similarity: number }>>([])

  useEffect(() => {
    if (text.trim().length > 2 && isOpen) {
      getSuggestions(text).catch(() => {
        // Error handled by store
      })

      // Check for ambiguity
      const isAmbiguous = detectAmbiguity(text)
      setShowAmbiguityWarning(isAmbiguous)

      // Find similar tasks
      const similar = getSimilarTasks(text, existingTasks)
      setSimilarTasks(similar)
    }
  }, [text, isOpen, getSuggestions, detectAmbiguity, getSimilarTasks, existingTasks])

  if (!isOpen || !text.trim()) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-surface-primary border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Ambiguity Warning */}
      {showAmbiguityWarning && (
        <div className="p-3 bg-semantic-warning-light border-b border-semantic-warning flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-icon-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-semantic-warning">Input looks ambiguous</p>
            <p className="text-xs text-semantic-warning">
              Check the suggestions below or clarify your task description
            </p>
          </div>
        </div>
      )}

      {/* Main Suggestions */}
      {loading && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin">
            <Sparkles className="w-5 h-5 text-semantic-info" />
          </div>
          <p className="mt-2 text-sm text-content-secondary">Analyzing task...</p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <>
          <div className="p-3 border-b border-border">
            <p className="text-xs font-semibold text-content-secondary uppercase">
              Suggestions
            </p>
          </div>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 border-b border-border hover:bg-surface-tertiary transition-colors last:border-b-0"
            >
              {/* Task Content */}
              <div className="mb-2">
                <p className="font-medium text-content-primary text-sm">
                  {suggestion.suggestedTask.content}
                </p>
              </div>

              {/* Extracted Properties */}
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestion.suggestedTask.priority && (
                  <span
                    className={clsx('text-xs font-semibold px-2 py-1 rounded', {
                      'bg-priority-p1-bg text-priority-p1':
                        suggestion.suggestedTask.priority === 'p1',
                      'bg-priority-p2-bg text-priority-p2':
                        suggestion.suggestedTask.priority === 'p2',
                      'bg-priority-p3-bg text-priority-p3':
                        suggestion.suggestedTask.priority === 'p3',
                      'bg-surface-tertiary text-content-secondary':
                        suggestion.suggestedTask.priority === 'p4',
                    })}
                  >
                    {PRIORITY_LABELS[suggestion.suggestedTask.priority]}
                  </span>
                )}

                {suggestion.suggestedTask.dueDate && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-semantic-info-light text-semantic-info">
                    📅 {suggestion.suggestedTask.dueDate.toLocaleDateString()}
                  </span>
                )}

                {suggestion.suggestedTask.dueTime && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-accent-purple-subtle text-accent-purple">
                    🕐 {suggestion.suggestedTask.dueTime}
                  </span>
                )}

                <span className="text-xs text-content-tertiary px-2 py-1">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  onSelect?.({
                    ...suggestion.suggestedTask,
                    confidence: suggestion.confidence,
                  } as ParsedTaskSuggestion)
                  onClose?.()
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-interactive-primary hover:bg-interactive-primary-hover text-white font-medium text-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                Use This
              </button>
            </div>
          ))}
        </>
      )}

      {/* Similar Tasks Warning */}
      {!loading && similarTasks.length > 0 && (
        <div className="p-3 bg-semantic-info-light border-t border-semantic-info">
          <p className="text-xs font-semibold text-semantic-info mb-2">
            Similar Tasks Found
          </p>
          <div className="space-y-1">
            {similarTasks.map((similar) => {
              const task = existingTasks.find((t) => t.id === similar.taskId)
              return (
                <div key={similar.taskId} className="text-xs text-semantic-info">
                  • {task?.content} ({Math.round(similar.similarity * 100)}% match)
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-semantic-error-light border-t border-semantic-error text-semantic-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="p-2 border-t border-border">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-1 rounded text-content-secondary hover:bg-surface-tertiary text-sm transition-colors"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      )}
    </div>
  )
}
