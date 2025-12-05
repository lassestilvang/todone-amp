import { create } from 'zustand'
import type { Priority } from '@/types'

export interface ParsedTask {
  content: string
  priority?: Priority
  dueDate?: Date
  dueTime?: string
  assigneeIds?: string[]
  labels?: string[]
  projectId?: string
  suggestedParentTaskId?: string
  suggestedDependencyTaskIds?: string[]
}

export interface TaskSuggestion {
  id: string
  originalText: string
  suggestedTask: ParsedTask
  confidence: number
  alternatives?: ParsedTask[]
  timestamp: Date
}

interface AIState {
  suggestions: TaskSuggestion[]
  loading: boolean
  error: string | null
  lastParsedText: string | null
}

interface AIActions {
  parseTask: (text: string) => Promise<ParsedTask>
  getSuggestions: (text: string) => Promise<TaskSuggestion[]>
  extractDueDate: (text: string) => Date | undefined
  extractPriority: (text: string) => Priority
  extractTimeExpression: (text: string) => string | undefined
  suggestProject: (text: string, availableProjects: Array<{ id: string; name: string }>) => string | undefined
  suggestLabels: (text: string, availableLabels: string[]) => string[]
  parseEmailContent: (emailSubject: string, emailBody: string) => Promise<ParsedTask>
  suggestRelationships: (taskContent: string, existingTasks: Array<{ id: string; content: string }>) => { parentTaskId?: string; dependencyIds: string[] }
  generateDescription: (taskContent: string, context?: string) => Promise<string>
  detectAmbiguity: (text: string) => boolean
  getSimilarTasks: (text: string, existingTasks: Array<{ id: string; content: string }>) => Array<{ taskId: string; similarity: number }>
  clearSuggestions: () => void
}

// Common date patterns and keywords
const DATE_PATTERNS = {
  today: /\b(today|tonight)\b/i,
  tomorrow: /\b(tomorrow)\b/i,
  nextWeek: /\b(next week)\b/i,
  nextMonth: /\b(next month)\b/i,
  thisWeek: /\b(this week)\b/i,
  thisMonth: /\b(this month)\b/i,
  in: /\bin\s+(\d+)\s+(days?|weeks?|months?|hours?)\b/i,
  on: /\bon\s+(.+?)(?:\s+at|\s+$|$)/i,
}

// Priority keywords
const PRIORITY_KEYWORDS = {
  p1: ['urgent', 'critical', 'asap', 'emergency', 'important', 'high priority', '!!!', 'p1', 'priority 1'],
  p2: ['high', 'soon', 'needs attention', '!!', 'p2', 'priority 2'],
  p3: ['medium', 'normal', 'standard', 'p3', 'priority 3'],
  p4: ['low', 'whenever', 'someday', 'nice to have', 'p4', 'priority 4'],
}

export const useAIStore = create<AIState & AIActions>((set, get) => ({
  suggestions: [],
  loading: false,
  error: null,
  lastParsedText: null,

  extractDueDate: (text: string): Date | undefined => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (DATE_PATTERNS.today.test(text)) {
      return new Date(today)
    }

    if (DATE_PATTERNS.tomorrow.test(text)) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }

    if (DATE_PATTERNS.nextWeek.test(text)) {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    }

    if (DATE_PATTERNS.nextMonth.test(text)) {
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    }

    if (DATE_PATTERNS.thisWeek.test(text)) {
      const endOfWeek = new Date(today)
      endOfWeek.setDate(endOfWeek.getDate() + (5 - endOfWeek.getDay()))
      return endOfWeek
    }

    if (DATE_PATTERNS.thisMonth.test(text)) {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return endOfMonth
    }

    // Check for relative dates like "in 3 days"
    const inMatch = text.match(DATE_PATTERNS.in)
    if (inMatch) {
      const amount = parseInt(inMatch[1], 10)
      const unit = inMatch[2].toLowerCase()
      const date = new Date(today)

      if (unit.startsWith('day')) {
        date.setDate(date.getDate() + amount)
      } else if (unit.startsWith('week')) {
        date.setDate(date.getDate() + amount * 7)
      } else if (unit.startsWith('month')) {
        date.setMonth(date.getMonth() + amount)
      } else if (unit.startsWith('hour')) {
        date.setHours(date.getHours() + amount)
      }

      return date
    }

    return undefined
  },

  extractPriority: (text: string): Priority => {
    const lowerText = text.toLowerCase()

    for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return priority as Priority
      }
    }

    return null
  },

  extractTimeExpression: (text: string): string | undefined => {
    const timePattern = /(\d{1,2}):?(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i
    const match = text.match(timePattern)
    return match ? match[0] : undefined
  },

  suggestProject: (
    text: string,
    availableProjects: Array<{ id: string; name: string }>
  ): string | undefined => {
    const lowerText = text.toLowerCase()
    return availableProjects.find((proj) => lowerText.includes(proj.name.toLowerCase()))?.id
  },

  suggestLabels: (text: string, availableLabels: string[]): string[] => {
    const lowerText = text.toLowerCase()
    return availableLabels.filter((label) => lowerText.includes(label.toLowerCase()))
  },

  parseTask: async (text: string): Promise<ParsedTask> => {
    set({ loading: true, error: null, lastParsedText: text })

    try {
      // Clean up the text
      const cleanText = text.trim().replace(/\s+/g, ' ')

      const task: ParsedTask = {
        content: cleanText,
        priority: get().extractPriority(cleanText),
        dueDate: get().extractDueDate(cleanText),
        dueTime: get().extractTimeExpression(cleanText),
        labels: [],
      }

      set({ loading: false })
      return task
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse task'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  getSuggestions: async (text: string): Promise<TaskSuggestion[]> => {
    set({ loading: true, error: null })

    try {
      const parsed = await get().parseTask(text)

      const suggestion: TaskSuggestion = {
        id: `suggestion-${Date.now()}`,
        originalText: text,
        suggestedTask: parsed,
        confidence: 0.9,
        timestamp: new Date(),
      }

      const suggestions = [suggestion]
      set({ suggestions, loading: false })
      return suggestions
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get suggestions'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  parseEmailContent: async (emailSubject: string, emailBody: string): Promise<ParsedTask> => {
    set({ loading: true, error: null })
    try {
      const combinedText = `${emailSubject} ${emailBody}`
      const task = await get().parseTask(combinedText)

      return {
        ...task,
        content: emailSubject || task.content,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse email'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  suggestRelationships: (
    taskContent: string,
    existingTasks: Array<{ id: string; content: string }>
  ): { parentTaskId?: string | undefined; dependencyIds: string[] } => {
    const lowerContent = taskContent.toLowerCase()
    const result: { parentTaskId?: string | undefined; dependencyIds: string[] } = {
      parentTaskId: undefined,
      dependencyIds: [] as string[],
    }

    // Look for subtask indicators
    const subtaskKeywords = ['subtask of', 'sub-task of', 'part of', 'step in', 'related to']
    for (const task of existingTasks) {
      const lowerTaskContent = task.content.toLowerCase()
      if (
        subtaskKeywords.some((kw) => lowerContent.includes(kw)) &&
        lowerContent.includes(lowerTaskContent.substring(0, 20))
      ) {
        result.parentTaskId = task.id
        break
      }
    }

    // Look for dependency indicators
    const dependencyKeywords = ['after', 'following', 'depends on', 'blocked by', 'requires', 'needs']
    for (const task of existingTasks) {
      const lowerTaskContent = task.content.toLowerCase()
      if (
        dependencyKeywords.some((kw) => lowerContent.includes(kw)) &&
        lowerContent.includes(lowerTaskContent.substring(0, 20))
      ) {
        result.dependencyIds.push(task.id)
      }
    }

    return result
  },

  generateDescription: async (taskContent: string, context?: string): Promise<string> => {
    // Simple description generation from content
    // In production, this would use a third-party API (OpenAI, etc.)
    const base = taskContent.replace(/^[^a-z]*/i, '')

    if (context) {
      return `${base}. Context: ${context.substring(0, 100)}.`
    }

    // Try to generate from keywords
    const keywords = taskContent.match(/\b[a-z]{4,}\b/gi) || []
    if (keywords.length > 0) {
      return `${base}. Related to: ${keywords.slice(0, 3).join(', ')}.`
    }

    return base
  },

  detectAmbiguity: (text: string): boolean => {
    const ambiguousPatterns = [
      /\?$/,
      /maybe|perhaps|possibly|probably/i,
      /unclear|ambiguous|vague/i,
      /or\s+/,
      /either\s+.*\s+or\s+/i,
    ]

    return ambiguousPatterns.some((pattern) => pattern.test(text))
  },

  getSimilarTasks: (
    text: string,
    existingTasks: Array<{ id: string; content: string }>
  ): Array<{ taskId: string; similarity: number }> => {
    const lowerText = text.toLowerCase()
    const textWords = new Set(lowerText.match(/\b[a-z]{3,}\b/gi) || [])

    return existingTasks
      .map((task) => {
        const taskWords = new Set(task.content.toLowerCase().match(/\b[a-z]{3,}\b/gi) || [])
        const intersection = new Set([...textWords].filter((word) => taskWords.has(word)))
        const union = new Set([...textWords, ...taskWords])
        const similarity = union.size > 0 ? intersection.size / union.size : 0

        return { taskId: task.id, similarity }
      })
      .filter(({ similarity }) => similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
  },

  clearSuggestions: () => {
    set({ suggestions: [], lastParsedText: null, error: null })
  },
}))
