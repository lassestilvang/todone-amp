import type { Priority, RecurrencePattern } from '@/types'
import { extractDateTime, removeDateTimeFromText } from './dateExtractor'
import { extractEntities, removeEntitiesFromText } from './entityExtractor'

export interface ParsedTaskIntent {
  title: string
  originalText: string
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
    labelIds: [],
    labelNames: [],
    confidence: 0,
    parsedFields: [],
  }

  if (!text.trim()) {
    return result
  }

  let workingText = text.trim()
  let totalConfidence = 0
  let fieldCount = 0

  // Extract date and time
  const dateTime = extractDateTime(workingText)
  if (dateTime.hasDate) {
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
    if (!dateTime.hasDate) {
      totalConfidence += dateTime.confidence
      fieldCount++
    }
  }

  // Extract entities (priority, project, labels, etc.)
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

  // Clean up the text to get the title
  workingText = removeDateTimeFromText(workingText)
  workingText = removeEntitiesFromText(workingText)

  // Additional cleanup
  workingText = workingText
    .replace(/\s+/g, ' ')
    .replace(/^\s*[-–—]\s*/, '')
    .replace(/\s*[-–—]\s*$/, '')
    .trim()

  result.title = workingText || text.trim()

  // Calculate overall confidence
  if (fieldCount > 0) {
    result.confidence = totalConfidence / fieldCount
  } else if (result.title) {
    result.confidence = 0.5
  }

  return result
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
