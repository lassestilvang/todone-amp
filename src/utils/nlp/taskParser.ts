import type { Priority, RecurrencePattern } from '@/types'
import { extractDateTime, removeDateTimeFromText } from './dateExtractor'
import { extractEntities, removeEntitiesFromText } from './entityExtractor'
import { normalizeInput } from './normalizer'
import { extractUrgency, removeUrgencyFromText } from './urgencyExtractor'
import { extractAction, type ActionType } from './actionExtractor'
import { detectMultiPart } from './multiPartDetector'

export interface ParsedTaskIntent {
  title: string
  originalText: string
  normalizedText: string
  dueDate?: Date
  dueTime?: string
  priority?: Priority
  projectId?: string
  projectName?: string
  labelIds: string[]
  labelNames: string[]
  recurrence?: RecurrencePattern
  duration?: number
  location?: string
  confidence: number
  parsedFields: ParsedField[]

  // New fields from improvements
  actionType?: ActionType
  estimatedDuration?: number
  estimatedDurationConfidence?: number
  isMultiPart?: boolean
  suggestedSubtasks?: string[]
  implicitPriority?: Priority
  implicitPriorityConfidence?: number
}

export interface ParsedField {
  field: string
  value: string
  matchedText: string
  confidence: number
}

export interface ParserContext {
  projects: Array<{ id: string; name: string }>
  labels: Array<{ id: string; name: string }>
}

export function parseTaskInput(text: string, context: ParserContext): ParsedTaskIntent {
  const result: ParsedTaskIntent = {
    title: '',
    originalText: text,
    normalizedText: '',
    labelIds: [],
    labelNames: [],
    confidence: 0,
    parsedFields: [],
  }

  if (!text.trim()) {
    return result
  }

  // Step 1: Normalize input (expand abbreviations, clean up text)
  const normalized = normalizeInput(text)
  result.normalizedText = normalized.normalizedText
  let workingText = normalized.normalizedText

  let totalConfidence = 0
  let fieldCount = 0

  // Track what we've matched to avoid over-removal
  const matchedSpans: Array<{ start: number; end: number; type: string }> = []

  // Step 2: Extract urgency/deadline phrases first
  const urgency = extractUrgency(workingText)
  if (urgency.hasUrgency) {
    if (urgency.deadline && !result.dueDate) {
      result.dueDate = urgency.deadline
      result.parsedFields.push({
        field: 'dueDate',
        value: urgency.deadline.toLocaleDateString(),
        matchedText: urgency.matchedPhrase,
        confidence: urgency.confidence,
      })
      totalConfidence += urgency.confidence
      fieldCount++
    }

    if (urgency.implicitPriority) {
      result.implicitPriority = urgency.implicitPriority
      result.implicitPriorityConfidence = urgency.confidence
      result.parsedFields.push({
        field: 'implicitPriority',
        value: urgency.implicitPriority,
        matchedText: urgency.matchedPhrase,
        confidence: urgency.confidence,
      })
    }

    matchedSpans.push(...urgency.spans)
  }

  // Step 3: Extract date and time
  const dateTime = extractDateTime(workingText)
  if (dateTime.hasDate && !result.dueDate) {
    result.dueDate = dateTime.date
    result.parsedFields.push({
      field: 'dueDate',
      value: dateTime.date?.toLocaleDateString() || '',
      matchedText: dateTime.matchedText,
      confidence: dateTime.confidence,
    })
    totalConfidence += dateTime.confidence
    fieldCount++
  }
  if (dateTime.hasTime) {
    result.dueTime = dateTime.time
    result.parsedFields.push({
      field: 'dueTime',
      value: dateTime.time || '',
      matchedText: dateTime.matchedText,
      confidence: dateTime.confidence,
    })
    if (!dateTime.hasDate && !urgency.deadline) {
      totalConfidence += dateTime.confidence
      fieldCount++
    }
  }

  // Step 4: Extract entities (priority, project, labels, etc.)
  const entities = extractEntities(workingText, context.projects, context.labels)

  if (entities.priority) {
    result.priority = entities.priority
    result.parsedFields.push({
      field: 'priority',
      value: entities.priority,
      matchedText: entities.matchedTokens.find((t) => /p[1-4]|!|priority/i.test(t)) || '',
      confidence: 0.95,
    })
    totalConfidence += 0.95
    fieldCount++
  } else if (result.implicitPriority && !entities.priority) {
    // Use implicit priority if no explicit priority was found
    result.priority = result.implicitPriority
  }

  if (entities.projectName) {
    const project = context.projects.find(
      (p) => p.name.toLowerCase() === entities.projectName?.toLowerCase()
    )
    if (project) {
      result.projectId = project.id
      result.projectName = project.name
      result.parsedFields.push({
        field: 'project',
        value: project.name,
        matchedText: entities.matchedTokens.find((t) => t.startsWith('#')) || '',
        confidence: 0.9,
      })
      totalConfidence += 0.9
      fieldCount++
    }
  }

  if (entities.labelNames.length > 0) {
    for (const labelName of entities.labelNames) {
      const label = context.labels.find((l) => l.name.toLowerCase() === labelName.toLowerCase())
      if (label) {
        result.labelIds.push(label.id)
        result.labelNames.push(label.name)
      }
    }
    if (result.labelIds.length > 0) {
      result.parsedFields.push({
        field: 'labels',
        value: result.labelNames.join(', '),
        matchedText: entities.matchedTokens.filter((t) => t.startsWith('@')).join(' '),
        confidence: 0.9,
      })
      totalConfidence += 0.9
      fieldCount++
    }
  }

  if (entities.duration) {
    result.duration = entities.duration
    result.parsedFields.push({
      field: 'duration',
      value: `${entities.duration} minutes`,
      matchedText: entities.matchedTokens.find((t) => /\d+\s*(hr|hour|min|minute)/i.test(t)) || '',
      confidence: 0.85,
    })
    totalConfidence += 0.85
    fieldCount++
  }

  if (entities.recurrence) {
    result.recurrence = entities.recurrence
    result.parsedFields.push({
      field: 'recurrence',
      value: entities.recurrence.frequency,
      matchedText:
        entities.matchedTokens.find((t) => /daily|weekly|monthly|yearly|every/i.test(t)) || '',
      confidence: 0.9,
    })
    totalConfidence += 0.9
    fieldCount++
  }

  if (entities.location) {
    result.location = entities.location
    result.parsedFields.push({
      field: 'location',
      value: entities.location,
      matchedText: entities.matchedTokens.find((t) => t.includes(entities.location || '')) || '',
      confidence: 0.7,
    })
    totalConfidence += 0.7
    fieldCount++
  }

  // Step 5: Extract action type for duration estimation
  const action = extractAction(workingText)
  if (action.hasAction) {
    result.actionType = action.actionType
    result.parsedFields.push({
      field: 'actionType',
      value: action.actionType,
      matchedText: action.actionVerb,
      confidence: 0.7,
    })

    // Add estimated duration if no explicit duration was set
    if (!result.duration && action.estimatedDuration) {
      result.estimatedDuration = action.estimatedDuration
      result.estimatedDurationConfidence = action.durationConfidence
      result.parsedFields.push({
        field: 'estimatedDuration',
        value: `~${action.estimatedDuration} min`,
        matchedText: action.actionVerb,
        confidence: action.durationConfidence,
      })
    }
  }

  // Step 6: Detect multi-part tasks
  const multiPart = detectMultiPart(text)
  if (multiPart.isMultiPart) {
    result.isMultiPart = true
    result.suggestedSubtasks = multiPart.suggestedSplit
    result.parsedFields.push({
      field: 'multiPart',
      value: `${multiPart.suggestedSplit?.length || 0} subtasks`,
      matchedText: '',
      confidence: multiPart.confidence,
    })
  }

  // Step 7: Clean up the text to get the title
  workingText = removeUrgencyFromText(workingText)
  workingText = removeDateTimeFromText(workingText)
  workingText = removeEntitiesFromText(workingText)

  // Additional cleanup for better titles
  workingText = cleanupTitle(workingText)

  result.title = workingText || text.trim()

  // Calculate overall confidence
  if (fieldCount > 0) {
    result.confidence = totalConfidence / fieldCount
  } else if (result.title) {
    result.confidence = 0.5
  }

  return result
}

/**
 * Clean up extracted title - preserve context words like "about", "regarding"
 */
function cleanupTitle(text: string): string {
  let result = text

  // Remove leftover punctuation at start/end
  result = result.replace(/^[\s,\-–—:;.]+/, '')
  result = result.replace(/[\s,\-–—:;.]+$/, '')

  // Collapse multiple spaces
  result = result.replace(/\s+/g, ' ')

  // Don't strip away context words - keep "about X", "regarding X", "re X"
  // Just clean up orphaned prepositions at the end
  result = result.replace(/\s+(about|regarding|re|for|with|to|from)\s*$/, '')

  // Capitalize first letter if needed
  if (result.length > 0 && /^[a-z]/.test(result)) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }

  return result.trim()
}

export function formatParsedTask(parsed: ParsedTaskIntent): string {
  const parts: string[] = [parsed.title]

  if (parsed.projectName) {
    parts.push(`#${parsed.projectName}`)
  }

  for (const label of parsed.labelNames) {
    parts.push(`@${label}`)
  }

  if (parsed.dueDate) {
    parts.push(
      parsed.dueDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    )
  }

  if (parsed.dueTime) {
    parts.push(`at ${parsed.dueTime}`)
  }

  if (parsed.priority) {
    parts.push(parsed.priority)
  }

  return parts.join(' ')
}

export function getSuggestions(
  text: string,
  context: ParserContext
): Array<{ type: string; value: string; display: string }> {
  const suggestions: Array<{ type: string; value: string; display: string }> = []

  // Check if user is typing a project hashtag
  const projectMatch = text.match(/#(\w*)$/)
  if (projectMatch) {
    const query = projectMatch[1].toLowerCase()
    const matchingProjects = context.projects.filter((p) =>
      p.name.toLowerCase().startsWith(query)
    )
    for (const project of matchingProjects.slice(0, 5)) {
      suggestions.push({
        type: 'project',
        value: `#${project.name}`,
        display: `📁 ${project.name}`,
      })
    }
  }

  // Check if user is typing a label mention
  const labelMatch = text.match(/@(\w*)$/)
  if (labelMatch) {
    const query = labelMatch[1].toLowerCase()
    const matchingLabels = context.labels.filter((l) => l.name.toLowerCase().startsWith(query))
    for (const label of matchingLabels.slice(0, 5)) {
      suggestions.push({
        type: 'label',
        value: `@${label.name}`,
        display: `🏷️ ${label.name}`,
      })
    }
  }

  return suggestions
}
