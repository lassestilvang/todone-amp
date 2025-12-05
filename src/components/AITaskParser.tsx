import React, { useState } from 'react'
import { Sparkles, AlertCircle, Check } from 'lucide-react'
import { useAIStore } from '@/store/aiStore'
import type { Priority } from '@/types'
import clsx from 'clsx'

export interface AITaskParserProps {
  onTaskParsed?: (task: {
    content: string
    priority?: Priority
    dueDate?: Date
    dueTime?: string
  }) => void
  placeholder?: string
}

const PRIORITY_LABELS: Record<Exclude<Priority, null>, string> = {
  p1: 'P1 - Urgent',
  p2: 'P2 - High',
  p3: 'P3 - Medium',
  p4: 'P4 - Low',
}

export const AITaskParser: React.FC<AITaskParserProps> = ({
  onTaskParsed,
  placeholder = 'Type or describe your task... (e.g., "urgent meeting tomorrow at 2pm")',
}) => {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { suggestions, loading, error, parseTask, clearSuggestions } = useAIStore()

  const handleInputChange = async (value: string) => {
    setInput(value)

    if (value.trim().length > 2) {
      try {
        await parseTask(value)
        setShowSuggestions(true)
      } catch {
        // Error is handled by the store
      }
    } else {
      clearSuggestions()
      setShowSuggestions(false)
    }
  }

  const handleAcceptSuggestion = (index: number) => {
    const suggestion = suggestions[index]
    if (suggestion) {
      onTaskParsed?.(suggestion.suggestedTask)
      setInput('')
      clearSuggestions()
      setShowSuggestions(false)
    }
  }

  const handleManualAdd = () => {
    if (input.trim()) {
      onTaskParsed?.({
        content: input,
      })
      setInput('')
      clearSuggestions()
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            aria-label="Task input with AI parsing"
            autoComplete="off"
          />
          {input.trim() && (
            <button
              onClick={() => {
                setInput('')
                clearSuggestions()
                setShowSuggestions(false)
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear input"
            >
              ×
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {loading && (
            <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
              Analyzing...
            </div>
          )}

          {!loading &&
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors last:border-b-0"
              >
                {/* Task Content */}
                <div className="mb-2">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {suggestion.suggestedTask.content}
                  </p>
                </div>

                {/* Extracted Properties */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestion.suggestedTask.priority && (
                    <span
                      className={clsx('text-xs font-semibold px-2 py-1 rounded', {
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200':
                          suggestion.suggestedTask.priority === 'p1',
                        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200':
                          suggestion.suggestedTask.priority === 'p2',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200':
                          suggestion.suggestedTask.priority === 'p3',
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200':
                          suggestion.suggestedTask.priority === 'p4',
                      })}
                    >
                      {PRIORITY_LABELS[suggestion.suggestedTask.priority]}
                    </span>
                  )}

                  {suggestion.suggestedTask.dueDate && (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      📅 {suggestion.suggestedTask.dueDate.toLocaleDateString()}
                    </span>
                  )}

                  {suggestion.suggestedTask.dueTime && (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                      🕐 {suggestion.suggestedTask.dueTime}
                    </span>
                  )}

                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptSuggestion(index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      setInput(suggestion.originalText)
                      setShowSuggestions(false)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

          {/* Manual Add */}
          {input.trim() && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleManualAdd}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium text-sm transition-colors"
              >
                Add as written: "{input.slice(0, 40)}
                {input.length > 40 ? '...' : ''}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
