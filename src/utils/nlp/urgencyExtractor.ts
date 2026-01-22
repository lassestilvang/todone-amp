/**
 * Urgency and deadline phrase extraction
 * Detects natural language urgency indicators and deadline phrases
 */

import type { Priority } from '@/types'
import { startOfDay, addDays, setHours, setMinutes, endOfWeek, endOfMonth } from 'date-fns'

export interface UrgencyResult {
  hasUrgency: boolean
  implicitPriority?: Priority
  deadline?: Date
  deadlineType?: 'hard' | 'soft'
  matchedPhrase: string
  confidence: number
  spans: Array<{ start: number; end: number; type: 'urgency' | 'deadline' }>
}

interface UrgencyPattern {
  id: string
  pattern: RegExp
  priority?: Priority
  deadline?: (now: Date, match?: RegExpMatchArray) => Date
  deadlineType?: 'hard' | 'soft'
  confidence: number
}

const DEFAULT_EOD_HOUR = 17 // 5pm
const DEFAULT_MORNING_HOUR = 9
const DEFAULT_NOON_HOUR = 12

const URGENCY_PATTERNS: UrgencyPattern[] = [
  // High urgency - immediate action needed
  {
    id: 'asap',
    pattern: /\b(asap|as soon as possible|right away|immediately|right now)\b/i,
    priority: 'p1',
    deadline: (now) => now,
    deadlineType: 'hard',
    confidence: 0.9,
  },
  {
    id: 'urgent',
    pattern: /\b(urgent|urgently|emergency|critical)\b/i,
    priority: 'p1',
    confidence: 0.85,
  },
  {
    id: 'before-leave',
    pattern: /\b(before (?:I |you )?leave|before leaving)\b/i,
    priority: 'p2',
    deadline: (now) => setHours(setMinutes(now, 0), DEFAULT_EOD_HOUR),
    deadlineType: 'hard',
    confidence: 0.8,
  },

  // Hard deadlines with specific times
  {
    id: 'by-eod',
    pattern: /\b(by (?:end of day|eod|close of business|cob))\b/i,
    deadline: (now) => setHours(setMinutes(now, 0), DEFAULT_EOD_HOUR),
    deadlineType: 'hard',
    priority: 'p2',
    confidence: 0.9,
  },
  {
    id: 'by-noon',
    pattern: /\b(by noon|by midday|before noon|before lunch)\b/i,
    deadline: (now) => setHours(setMinutes(now, 0), DEFAULT_NOON_HOUR),
    deadlineType: 'hard',
    priority: 'p2',
    confidence: 0.9,
  },
  {
    id: 'by-morning',
    pattern: /\b(by (?:tomorrow )?morning|first thing (?:tomorrow )?(?:morning)?)\b/i,
    deadline: (now) => setHours(setMinutes(addDays(now, 1), 0), DEFAULT_MORNING_HOUR),
    deadlineType: 'hard',
    priority: 'p2',
    confidence: 0.85,
  },
  {
    id: 'by-tonight',
    pattern: /\b(by tonight|before tonight)\b/i,
    deadline: (now) => setHours(setMinutes(now, 0), 21),
    deadlineType: 'hard',
    confidence: 0.85,
  },

  // Deadline expressions with day references
  {
    id: 'by-tomorrow',
    pattern: /\b(by tomorrow|before tomorrow|due tomorrow)\b/i,
    deadline: (now) => setHours(setMinutes(addDays(now, 1), 0), DEFAULT_EOD_HOUR),
    deadlineType: 'hard',
    priority: 'p2',
    confidence: 0.85,
  },
  {
    id: 'by-eow',
    pattern: /\b(by (?:end of (?:the )?week|eow)|before (?:end of )?(?:the )?week)\b/i,
    deadline: (now) => endOfWeek(now, { weekStartsOn: 1 }),
    deadlineType: 'hard',
    confidence: 0.85,
  },
  {
    id: 'by-eom',
    pattern: /\b(by (?:end of (?:the )?month|eom)|before (?:end of )?(?:the )?month)\b/i,
    deadline: (now) => endOfMonth(now),
    deadlineType: 'hard',
    confidence: 0.85,
  },

  // Deadline with weekday
  {
    id: 'by-weekday',
    pattern:
      /\b(by|before|due(?:\s+on)?)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    deadlineType: 'hard',
    confidence: 0.8,
    deadline: (now: Date, match?: RegExpMatchArray) => {
      if (!match) return now
      const weekdays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ]
      const targetDay = weekdays.indexOf(match[2].toLowerCase())
      if (targetDay === -1) return now

      const today = now.getDay()
      let daysAhead = targetDay - today
      if (daysAhead <= 0) daysAhead += 7

      return setHours(setMinutes(addDays(now, daysAhead), 0), DEFAULT_EOD_HOUR)
    },
  },

  // Medium urgency - important but not immediate
  {
    id: 'important',
    pattern: /\b(important|high priority|priority|crucial)\b/i,
    priority: 'p2',
    confidence: 0.75,
  },
  {
    id: 'needs-attention',
    pattern: /\b(needs? (?:immediate )?attention|can't wait|cannot wait)\b/i,
    priority: 'p2',
    confidence: 0.7,
  },

  // Soft deadlines
  {
    id: 'this-week',
    pattern: /\b(this week|during the week)\b/i,
    deadline: (now) => endOfWeek(now, { weekStartsOn: 1 }),
    deadlineType: 'soft',
    priority: 'p3',
    confidence: 0.7,
  },
  {
    id: 'next-week',
    pattern: /\b(next week|following week)\b/i,
    deadline: (now) => endOfWeek(addDays(now, 7), { weekStartsOn: 1 }),
    deadlineType: 'soft',
    priority: 'p3',
    confidence: 0.7,
  },
  {
    id: 'soon',
    pattern: /\b(soon|soonish|in the near future)\b/i,
    priority: 'p3',
    confidence: 0.6,
  },

  // Low urgency - can wait
  {
    id: 'when-possible',
    pattern: /\b(when (?:you )?(?:have|get) (?:a )?chance|when possible|if (?:you )?(?:have|get) time)\b/i,
    priority: 'p4',
    confidence: 0.7,
  },
  {
    id: 'no-rush',
    pattern: /\b(no rush|no hurry|not urgent|low priority|whenever|someday)\b/i,
    priority: 'p4',
    confidence: 0.8,
  },
  {
    id: 'eventually',
    pattern: /\b(eventually|at some point|one day|later)\b/i,
    priority: 'p4',
    confidence: 0.6,
  },
]

/**
 * Extract urgency and deadline information from text
 */
export function extractUrgency(text: string): UrgencyResult {
  const result: UrgencyResult = {
    hasUrgency: false,
    matchedPhrase: '',
    confidence: 0,
    spans: [],
  }

  if (!text || text.trim().length === 0) {
    return result
  }

  const now = startOfDay(new Date())
  const matches: Array<{
    pattern: UrgencyPattern
    match: RegExpMatchArray
    index: number
  }> = []

  for (const pattern of URGENCY_PATTERNS) {
    const match = text.match(pattern.pattern)
    if (match && match.index !== undefined) {
      matches.push({
        pattern,
        match,
        index: match.index,
      })
    }
  }

  if (matches.length === 0) {
    return result
  }

  // Sort by confidence (highest first), then by position (earliest first)
  matches.sort((a, b) => {
    if (b.pattern.confidence !== a.pattern.confidence) {
      return b.pattern.confidence - a.pattern.confidence
    }
    return a.index - b.index
  })

  const bestMatch = matches[0]
  result.hasUrgency = true
  result.matchedPhrase = bestMatch.match[0]
  result.confidence = bestMatch.pattern.confidence

  if (bestMatch.pattern.priority) {
    result.implicitPriority = bestMatch.pattern.priority
  }

  if (bestMatch.pattern.deadline) {
    result.deadline = bestMatch.pattern.deadline(now, bestMatch.match)
    result.deadlineType = bestMatch.pattern.deadlineType
  }

  // Add span for matched urgency phrase
  result.spans.push({
    start: bestMatch.match.index!,
    end: bestMatch.match.index! + bestMatch.match[0].length,
    type: result.deadline ? 'deadline' : 'urgency',
  })

  return result
}

/**
 * Remove urgency phrases from text
 */
export function removeUrgencyFromText(text: string): string {
  let result = text

  for (const pattern of URGENCY_PATTERNS) {
    result = result.replace(pattern.pattern, '')
  }

  return result.replace(/\s+/g, ' ').trim()
}
