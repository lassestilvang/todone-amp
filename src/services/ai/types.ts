import type { Priority } from '@/types'

export type SuggestionType =
  | 'due_date'
  | 'priority'
  | 'project'
  | 'labels'
  | 'duration'
  | 'recurrence'
  | 'breakdown'
  | 'similar'

export type SuggestionSource = 'local' | 'api'

export interface TaskSuggestion {
  id: string
  type: SuggestionType
  value: unknown
  confidence: number
  reasoning: string
  source: SuggestionSource
  createdAt: Date
}

export interface DueDateSuggestion extends TaskSuggestion {
  type: 'due_date'
  value: {
    date: Date
    isDeadline: boolean
    urgencyScore: number
    matchedPattern: string
  }
}

export interface PrioritySuggestion extends TaskSuggestion {
  type: 'priority'
  value: {
    priority: Priority
    factors: string[]
  }
}

export interface ProjectSuggestion extends TaskSuggestion {
  type: 'project'
  value: {
    projectId: string
    projectName: string
    matchedKeywords: string[]
  }
}

export interface LabelsSuggestion extends TaskSuggestion {
  type: 'labels'
  value: {
    labels: string[]
    newLabelsDetected: string[]
  }
}

export interface DurationSuggestion extends TaskSuggestion {
  type: 'duration'
  value: {
    minutes: number
    basedOn: 'similar_tasks' | 'complexity' | 'user_history'
  }
}

export interface SuggestionContext {
  taskContent: string
  existingProjects?: Array<{ id: string; name: string }>
  existingLabels?: string[]
  userHistory?: UserTaskHistory
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  dayOfWeek?: number
}

export interface UserTaskHistory {
  completedTasks: number
  averageTasksPerDay: number
  commonDueDays: number[]
  preferredPriority: Priority
  lastCompletedAt?: Date
}

export interface PatternMatch {
  pattern: string
  value: unknown
  confidence: number
  startIndex: number
  endIndex: number
}
