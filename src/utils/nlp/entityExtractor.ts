import type { Priority, RecurrencePattern } from '@/types'

export interface ExtractedEntities {
  priority?: Priority
  projectName?: string
  labelNames: string[]
  location?: string
  duration?: number
  recurrence?: RecurrencePattern
  matchedTokens: string[]
}

const PRIORITY_PATTERNS: Array<{ pattern: RegExp; priority: Priority }> = [
  { pattern: /\b(p1|priority\s*1|!!!|critical|urgent|emergency)\b/i, priority: 'p1' },
  { pattern: /\b(p2|priority\s*2|!!|high(?:\s*priority)?|important)\b/i, priority: 'p2' },
  { pattern: /\b(p3|priority\s*3|!|medium(?:\s*priority)?|normal)\b/i, priority: 'p3' },
  { pattern: /\b(p4|priority\s*4|low(?:\s*priority)?|someday|whenever)\b/i, priority: 'p4' },
]

const DURATION_PATTERNS: Array<{ pattern: RegExp; minutes: number }> = [
  { pattern: /\b(\d+)\s*(?:hr|hour)s?\b/i, minutes: -1 },
  { pattern: /\b(\d+)\s*(?:min|minute)s?\b/i, minutes: -2 },
  { pattern: /\bquick\b/i, minutes: 15 },
  { pattern: /\bshort\b/i, minutes: 30 },
  { pattern: /\bhalf\s*(?:an?\s*)?hour\b/i, minutes: 30 },
  { pattern: /\ban?\s*hour\b/i, minutes: 60 },
  { pattern: /\blong\b/i, minutes: 120 },
]

const RECURRENCE_PATTERNS: Array<{
  pattern: RegExp
  frequency: RecurrencePattern['frequency']
  interval: number
}> = [
  { pattern: /\bdaily\b/i, frequency: 'daily', interval: 1 },
  { pattern: /\bevery\s*day\b/i, frequency: 'daily', interval: 1 },
  { pattern: /\bweekly\b/i, frequency: 'weekly', interval: 1 },
  { pattern: /\bevery\s*week\b/i, frequency: 'weekly', interval: 1 },
  { pattern: /\bbiweekly\b/i, frequency: 'biweekly', interval: 2 },
  { pattern: /\bevery\s*2\s*weeks?\b/i, frequency: 'biweekly', interval: 2 },
  { pattern: /\bevery\s*other\s*week\b/i, frequency: 'biweekly', interval: 2 },
  { pattern: /\bmonthly\b/i, frequency: 'monthly', interval: 1 },
  { pattern: /\bevery\s*month\b/i, frequency: 'monthly', interval: 1 },
  { pattern: /\byearly\b/i, frequency: 'yearly', interval: 1 },
  { pattern: /\bann?ually\b/i, frequency: 'yearly', interval: 1 },
  { pattern: /\bevery\s*year\b/i, frequency: 'yearly', interval: 1 },
]

const LOCATION_PATTERNS = [
  /\bat\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/,
  /\bin\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/,
  /\b@\s*location:\s*([^\s]+)/i,
]

export function extractEntities(
  text: string,
  availableProjects: Array<{ id: string; name: string }> = [],
  availableLabels: Array<{ id: string; name: string }> = []
): ExtractedEntities {
  const result: ExtractedEntities = {
    labelNames: [],
    matchedTokens: [],
  }

  // Extract priority
  for (const { pattern, priority } of PRIORITY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      result.priority = priority
      result.matchedTokens.push(match[0])
      break
    }
  }

  // Extract project by #hashtag
  const projectHashtagMatch = text.match(/#(\w+)/i)
  if (projectHashtagMatch) {
    const projectName = projectHashtagMatch[1].toLowerCase()
    const matchedProject = availableProjects.find(
      (p) => p.name.toLowerCase() === projectName || p.name.toLowerCase().startsWith(projectName)
    )
    if (matchedProject) {
      result.projectName = matchedProject.name
      result.matchedTokens.push(projectHashtagMatch[0])
    }
  }

  // Try fuzzy project matching if no hashtag match
  if (!result.projectName) {
    const lowerText = text.toLowerCase()
    for (const project of availableProjects) {
      const projectLower = project.name.toLowerCase()
      if (
        lowerText.includes(`for ${projectLower}`) ||
        lowerText.includes(`project ${projectLower}`) ||
        lowerText.includes(`${projectLower} project`)
      ) {
        result.projectName = project.name
        break
      }
    }
  }

  // Extract labels by @mention
  const labelMatches = text.matchAll(/@(\w+)/gi)
  for (const match of labelMatches) {
    const labelName = match[1].toLowerCase()
    const matchedLabel = availableLabels.find(
      (l) => l.name.toLowerCase() === labelName || l.name.toLowerCase().startsWith(labelName)
    )
    if (matchedLabel && !result.labelNames.includes(matchedLabel.name)) {
      result.labelNames.push(matchedLabel.name)
      result.matchedTokens.push(match[0])
    }
  }

  // Extract duration
  for (const { pattern, minutes } of DURATION_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      if (minutes === -1) {
        result.duration = parseInt(match[1], 10) * 60
      } else if (minutes === -2) {
        result.duration = parseInt(match[1], 10)
      } else {
        result.duration = minutes
      }
      result.matchedTokens.push(match[0])
      break
    }
  }

  // Extract recurrence
  for (const { pattern, frequency, interval } of RECURRENCE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      result.recurrence = {
        frequency,
        interval,
        startDate: new Date(),
        exceptions: [],
      }
      result.matchedTokens.push(match[0])
      break
    }
  }

  // Extract location (simple heuristic)
  for (const pattern of LOCATION_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const potentialLocation = match[1]
      // Filter out common false positives
      const ignoreWords = [
        'the',
        'a',
        'an',
        'this',
        'that',
        'my',
        'our',
        'pm',
        'am',
        'noon',
        'midnight',
      ]
      if (!ignoreWords.includes(potentialLocation.toLowerCase())) {
        result.location = potentialLocation
        result.matchedTokens.push(match[0])
        break
      }
    }
  }

  return result
}

export function removeEntitiesFromText(text: string): string {
  let result = text

  // Remove priority patterns (use global flag for replacement)
  // Remove exclamation marks first (they don't have word boundaries)
  result = result.replace(/!{1,3}(?=\s|$)/g, '')

  const priorityPatterns = [
    /\b(p[1-4]|priority\s*[1-4]|critical|urgent|emergency)\b/gi,
    /\b(high(?:\s*priority)?|important)\b/gi,
    /\b(medium(?:\s*priority)?|normal)\b/gi,
    /\b(low(?:\s*priority)?|someday|whenever)\b/gi,
  ]
  for (const pattern of priorityPatterns) {
    result = result.replace(pattern, '')
  }

  // Remove project hashtag
  result = result.replace(/#\w+/gi, '')

  // Remove label mentions (must include the @)
  // Also remove trailing @ that may be left after extracting labels
  result = result.replace(/@\w*/gi, '')

  // Remove duration patterns
  const durationPatterns = [
    /\b\d+\s*(?:hr|hour)s?\b/gi,
    /\b\d+\s*(?:min|minute)s?\b/gi,
    /\bquick\b/gi,
    /\bshort\b/gi,
    /\bhalf\s*(?:an?\s*)?hour\b/gi,
    /\ban?\s*hour\b/gi,
    /\blong\b/gi,
  ]
  for (const pattern of durationPatterns) {
    result = result.replace(pattern, '')
  }

  // Remove recurrence patterns
  const recurrencePatterns = [
    /\bdaily\b/gi,
    /\bevery\s*day\b/gi,
    /\bweekly\b/gi,
    /\bevery\s*week\b/gi,
    /\bbiweekly\b/gi,
    /\bevery\s*2\s*weeks?\b/gi,
    /\bevery\s*other\s*week\b/gi,
    /\bmonthly\b/gi,
    /\bevery\s*month\b/gi,
    /\byearly\b/gi,
    /\bann?ually\b/gi,
    /\bevery\s*year\b/gi,
  ]
  for (const pattern of recurrencePatterns) {
    result = result.replace(pattern, '')
  }

  // Clean up
  return result.replace(/\s+/g, ' ').trim()
}

export function suggestProjectFromContent(
  text: string,
  projects: Array<{ id: string; name: string; keywords?: string[] }>
): { projectId: string; confidence: number } | null {
  const lowerText = text.toLowerCase()
  const words = new Set(lowerText.match(/\b\w{3,}\b/g) || [])

  let bestMatch: { projectId: string; score: number } | null = null

  for (const project of projects) {
    const projectWords = new Set(project.name.toLowerCase().match(/\b\w{3,}\b/g) || [])
    const keywords = project.keywords?.map((k) => k.toLowerCase()) || []

    let score = 0

    // Check for project name words in text
    for (const word of projectWords) {
      if (words.has(word)) {
        score += 2
      }
    }

    // Check for keywords
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 3
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { projectId: project.id, score }
    }
  }

  if (bestMatch && bestMatch.score >= 2) {
    return {
      projectId: bestMatch.projectId,
      confidence: Math.min(bestMatch.score / 10, 1),
    }
  }

  return null
}

export function suggestLabelsFromContent(
  text: string,
  labels: Array<{ id: string; name: string }>
): Array<{ labelId: string; confidence: number }> {
  const lowerText = text.toLowerCase()
  const suggestions: Array<{ labelId: string; confidence: number }> = []

  // Common label keywords mapping
  const labelKeywords: Record<string, string[]> = {
    urgent: ['urgent', 'asap', 'emergency', 'immediately', 'critical'],
    work: ['work', 'office', 'meeting', 'client', 'project', 'deadline', 'presentation'],
    personal: ['personal', 'home', 'family', 'self', 'private'],
    health: ['health', 'doctor', 'gym', 'exercise', 'medicine', 'appointment'],
    finance: ['finance', 'money', 'pay', 'bill', 'invoice', 'budget', 'expense'],
    shopping: ['buy', 'shop', 'purchase', 'order', 'groceries'],
    email: ['email', 'reply', 'send', 'respond', 'message'],
    call: ['call', 'phone', 'ring', 'contact'],
    meeting: ['meeting', 'meet', 'sync', 'standup', 'review'],
  }

  for (const label of labels) {
    const labelLower = label.name.toLowerCase()
    let confidence = 0

    // Direct mention
    if (lowerText.includes(labelLower)) {
      confidence = 0.9
    }

    // Check for related keywords
    const keywords = labelKeywords[labelLower] || []
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        confidence = Math.max(confidence, 0.6)
      }
    }

    if (confidence > 0) {
      suggestions.push({ labelId: label.id, confidence })
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence)
}
