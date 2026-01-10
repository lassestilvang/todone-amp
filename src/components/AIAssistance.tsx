import { useState } from 'react'
import { useAIStore } from '@/store/aiStore'
import { Sparkles, Copy, RefreshCw, ThumbsUp, ThumbsDown, Loader } from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/utils/cn'
import { logger } from '@/utils/logger'

export interface AISuggestion {
  id: string
  type: 'suggestion' | 'breakdown' | 'actionable' | 'tips'
  content: string
  confidence: number
}

interface AIAssistanceProps {
  taskTitle: string
  taskDescription?: string
  onAccept?: (suggestion: AISuggestion) => void
  className?: string
}

export function AIAssistance({
  taskTitle,
  taskDescription,
  onAccept,
  className,
}: AIAssistanceProps) {
  const [activeTab, setActiveTab] = useState<'suggest' | 'breakdown' | 'tips'>('suggest')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [feedback, setFeedback] = useState<Record<string, 'helpful' | 'not-helpful'>>({})

  const aiStore = useAIStore()

  const generateSuggestion = async (type: 'suggestion' | 'breakdown' | 'tips') => {
    setIsLoading(true)
    try {
      const suggestions = await aiStore.getSuggestions(
        `${taskTitle}${taskDescription ? ': ' + taskDescription : ''}`
      )

      if (suggestions.length > 0) {
        const content =
          type === 'suggestion'
            ? `Suggested tasks based on "${taskTitle}":\n${suggestions.map((s) => '- ' + s.suggestedTask.content).join('\n')}`
            : type === 'breakdown'
              ? `Here's how to break down this task:\n${suggestions.map((s) => '- ' + s.suggestedTask.content).join('\n')}`
              : `Tips for completing "${taskTitle}":\n1. Start by clarifying what success looks like\n2. Break it into smaller actionable steps\n3. Set a realistic deadline\n4. Identify potential blockers\n5. Plan your approach before starting`

        setSuggestions([
          {
            id: type,
            type,
            content,
            confidence: 0.85,
          },
        ])
      }
    } catch (error) {
      logger.error('Failed to get suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleFeedback = (suggestionId: string, helpful: boolean) => {
    setFeedback((prev) => ({
      ...prev,
      [suggestionId]: helpful ? 'helpful' : 'not-helpful',
    }))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('suggest')
            generateSuggestion('suggestion')
          }}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'suggest'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          <Sparkles className="w-4 h-4 mr-1 inline" />
          Suggest
        </button>
        <button
          onClick={() => {
            setActiveTab('breakdown')
            generateSuggestion('breakdown')
          }}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'breakdown'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          Break Down
        </button>
        <button
          onClick={() => {
            setActiveTab('tips')
            generateSuggestion('tips')
          }}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'tips'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          Tips
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-brand-600 mr-2" />
            <p className="text-gray-600">Generating suggestions...</p>
          </div>
        )}

        {!isLoading &&
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {/* Confidence indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {(suggestion.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>

              {/* Suggestion content */}
              <p className="text-sm text-gray-900 mb-3 whitespace-pre-wrap">
                {suggestion.content}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestion.content)}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    generateSuggestion(activeTab === 'suggest' ? 'suggestion' : activeTab)
                  }
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try again
                </Button>
                {onAccept && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAccept(suggestion)}
                    className="text-xs ml-auto"
                  >
                    Use this
                  </Button>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => handleFeedback(suggestion.id, true)}
                    className={cn(
                      'p-1 rounded transition-colors',
                      feedback[suggestion.id] === 'helpful'
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback(suggestion.id, false)}
                    className={cn(
                      'p-1 rounded transition-colors',
                      feedback[suggestion.id] === 'not-helpful'
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {!isLoading && suggestions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            Click on a tab above to get AI suggestions for this task
          </p>
        )}
      </div>
    </div>
  )
}
