import { useState, useEffect, useMemo, useCallback } from 'react'
import { suggestDueDate, type DueDateSuggestion, type SuggestionContext } from '@/services/ai'

interface UseDueDateSuggestionOptions {
  debounceMs?: number
  minTextLength?: number
  enabled?: boolean
}

interface UseDueDateSuggestionResult {
  suggestion: DueDateSuggestion | null
  isLoading: boolean
  accept: () => void
  dismiss: () => void
  isDismissed: boolean
}

export function useDueDateSuggestion(
  taskContent: string,
  options: UseDueDateSuggestionOptions = {}
): UseDueDateSuggestionResult {
  const { debounceMs = 150, minTextLength = 3, enabled = true } = options

  const [suggestion, setSuggestion] = useState<DueDateSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [debouncedContent, setDebouncedContent] = useState(taskContent)

  useEffect(() => {
    if (!enabled) return

    const timer = setTimeout(() => {
      setDebouncedContent(taskContent)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [taskContent, debounceMs, enabled])

  useEffect(() => {
    if (!enabled || debouncedContent.length < minTextLength) {
      setSuggestion(null)
      return
    }

    setIsLoading(true)
    setIsDismissed(false)

    const context: SuggestionContext = {
      taskContent: debouncedContent,
    }

    const result = suggestDueDate(context)
    setSuggestion(result)
    setIsLoading(false)
  }, [debouncedContent, minTextLength, enabled])

  const accept = useCallback(() => {
    setIsDismissed(false)
  }, [])

  const dismiss = useCallback(() => {
    setIsDismissed(true)
  }, [])

  const effectiveSuggestion = useMemo(() => {
    if (isDismissed) return null
    return suggestion
  }, [suggestion, isDismissed])

  return {
    suggestion: effectiveSuggestion,
    isLoading,
    accept,
    dismiss,
    isDismissed,
  }
}
