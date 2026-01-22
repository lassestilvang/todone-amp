import type { DueDateSuggestion, PatternMatch, SuggestionContext } from './types'

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WEEKDAY_ABBREVS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]
const MONTH_ABBREVS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

interface DatePattern {
  id: string
  pattern: RegExp
  extract: (match: RegExpMatchArray, today: Date) => Date | null
  confidence: number
  isDeadline: boolean
  urgency: number
}

const DATE_PATTERNS: DatePattern[] = [
  // Explicit deadlines: "deadline friday", "due by monday"
  {
    id: 'explicit-deadline',
    pattern: /\b(?:deadline|due(?:\s+by)?)\s+(.+?)(?:\s+at|\s*$|[,.])/i,
    extract: (match, today) => parseFlexibleDate(match[1], today),
    confidence: 0.95,
    isDeadline: true,
    urgency: 0.9,
  },

  // Urgency words: "urgent", "asap", "immediately"
  {
    id: 'urgency-today',
    pattern: /\b(urgent|asap|immediately|right\s+away)\b/i,
    extract: (_match, today) => new Date(today),
    confidence: 0.9,
    isDeadline: true,
    urgency: 1.0,
  },

  // Today/tonight
  {
    id: 'today',
    pattern: /\b(today|tonight)\b/i,
    extract: (_match, today) => new Date(today),
    confidence: 0.95,
    isDeadline: false,
    urgency: 0.8,
  },

  // Tomorrow
  {
    id: 'tomorrow',
    pattern: /\b(tomorrow)\b/i,
    extract: (_match, today) => addDays(today, 1),
    confidence: 0.95,
    isDeadline: false,
    urgency: 0.7,
  },

  // Day after tomorrow
  {
    id: 'day-after-tomorrow',
    pattern: /\b(day\s+after\s+tomorrow|overmorrow)\b/i,
    extract: (_match, today) => addDays(today, 2),
    confidence: 0.95,
    isDeadline: false,
    urgency: 0.6,
  },

  // This weekend
  {
    id: 'this-weekend',
    pattern: /\b(this\s+weekend)\b/i,
    extract: (_match, today) => getNextWeekend(today),
    confidence: 0.85,
    isDeadline: false,
    urgency: 0.5,
  },

  // Next weekend
  {
    id: 'next-weekend',
    pattern: /\b(next\s+weekend)\b/i,
    extract: (_match, today) => addDays(getNextWeekend(today), 7),
    confidence: 0.85,
    isDeadline: false,
    urgency: 0.4,
  },

  // This week (end of this week)
  {
    id: 'this-week',
    pattern: /\b(this\s+week)\b/i,
    extract: (_match, today) => getEndOfWeek(today),
    confidence: 0.8,
    isDeadline: false,
    urgency: 0.6,
  },

  // Next week
  {
    id: 'next-week',
    pattern: /\b(next\s+week)\b/i,
    extract: (_match, today) => addDays(today, 7),
    confidence: 0.85,
    isDeadline: false,
    urgency: 0.4,
  },

  // This month (end of month)
  {
    id: 'this-month',
    pattern: /\b(this\s+month)\b/i,
    extract: (_match, today) => getEndOfMonth(today),
    confidence: 0.8,
    isDeadline: false,
    urgency: 0.5,
  },

  // Next month
  {
    id: 'next-month',
    pattern: /\b(next\s+month)\b/i,
    extract: (_match, today) => {
      const date = new Date(today)
      date.setMonth(date.getMonth() + 1)
      return date
    },
    confidence: 0.85,
    isDeadline: false,
    urgency: 0.3,
  },

  // End of week
  {
    id: 'end-of-week',
    pattern: /\b(end\s+of\s+(?:the\s+)?week|eow)\b/i,
    extract: (_match, today) => getEndOfWeek(today),
    confidence: 0.85,
    isDeadline: true,
    urgency: 0.6,
  },

  // End of month
  {
    id: 'end-of-month',
    pattern: /\b(end\s+of\s+(?:the\s+)?month|eom)\b/i,
    extract: (_match, today) => getEndOfMonth(today),
    confidence: 0.85,
    isDeadline: true,
    urgency: 0.5,
  },

  // End of day
  {
    id: 'end-of-day',
    pattern: /\b(end\s+of\s+(?:the\s+)?day|eod|before\s+(?:end\s+of\s+)?(?:the\s+)?day)\b/i,
    extract: (_match, today) => new Date(today),
    confidence: 0.9,
    isDeadline: true,
    urgency: 0.9,
  },

  // Relative: "in X days/weeks/months"
  {
    id: 'relative-in',
    pattern: /\bin\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i,
    extract: (match, today) => {
      const amount = parseInt(match[1], 10)
      const unit = match[2].toLowerCase()

      if (unit.startsWith('day')) return addDays(today, amount)
      if (unit.startsWith('week')) return addDays(today, amount * 7)
      if (unit.startsWith('month')) {
        const date = new Date(today)
        date.setMonth(date.getMonth() + amount)
        return date
      }
      return null
    },
    confidence: 0.9,
    isDeadline: false,
    urgency: 0.5,
  },

  // Weekday names: "on monday", "by friday", "this tuesday"
  {
    id: 'weekday-this',
    pattern: new RegExp(
      `\\b(?:on|by|this)?\\s*(${WEEKDAYS.join('|')}|${WEEKDAY_ABBREVS.join('|')})\\b`,
      'i'
    ),
    extract: (match, today) => getNextWeekday(match[1], today, false),
    confidence: 0.85,
    isDeadline: false,
    urgency: 0.5,
  },

  // Next weekday: "next monday", "next friday"
  {
    id: 'weekday-next',
    pattern: new RegExp(`\\bnext\\s+(${WEEKDAYS.join('|')}|${WEEKDAY_ABBREVS.join('|')})\\b`, 'i'),
    extract: (match, today) => getNextWeekday(match[1], today, true),
    confidence: 0.9,
    isDeadline: false,
    urgency: 0.4,
  },

  // Date formats: "jan 15", "january 15th", "15th january"
  {
    id: 'month-day',
    pattern: new RegExp(
      `\\b(${MONTHS.join('|')}|${MONTH_ABBREVS.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`,
      'i'
    ),
    extract: (match, today) => parseDateWithMonth(match[1], parseInt(match[2], 10), today),
    confidence: 0.92,
    isDeadline: false,
    urgency: 0.5,
  },

  // Date formats: "15 jan", "15th january"
  {
    id: 'day-month',
    pattern: new RegExp(
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join('|')}|${MONTH_ABBREVS.join('|')})\\b`,
      'i'
    ),
    extract: (match, today) => parseDateWithMonth(match[2], parseInt(match[1], 10), today),
    confidence: 0.92,
    isDeadline: false,
    urgency: 0.5,
  },

  // ISO/slash dates: "2026-01-25", "01/25/2026", "25/01/2026"
  {
    id: 'date-iso',
    pattern: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/,
    extract: (match) => {
      const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
      return isNaN(date.getTime()) ? null : date
    },
    confidence: 0.98,
    isDeadline: false,
    urgency: 0.5,
  },

  // US date format: "01/25" or "1/25"
  {
    id: 'date-slash-us',
    pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
    extract: (match, today) => {
      const month = parseInt(match[1], 10)
      const day = parseInt(match[2], 10)
      let year = match[3] ? parseInt(match[3], 10) : today.getFullYear()
      if (year < 100) year += 2000

      if (month < 1 || month > 12 || day < 1 || day > 31) return null

      const date = new Date(year, month - 1, day)
      if (date < today && !match[3]) {
        date.setFullYear(date.getFullYear() + 1)
      }
      return isNaN(date.getTime()) ? null : date
    },
    confidence: 0.85,
    isDeadline: false,
    urgency: 0.5,
  },
]

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function getEndOfWeek(date: Date): Date {
  const result = new Date(date)
  const daysUntilFriday = (5 - result.getDay() + 7) % 7 || 7
  result.setDate(result.getDate() + daysUntilFriday)
  return result
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function getNextWeekend(date: Date): Date {
  const result = new Date(date)
  const dayOfWeek = result.getDay()
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7
  result.setDate(result.getDate() + daysUntilSaturday)
  return result
}

function getNextWeekday(dayName: string, today: Date, forceNextWeek: boolean): Date | null {
  const lower = dayName.toLowerCase()
  let targetDay = WEEKDAYS.indexOf(lower)
  if (targetDay === -1) {
    targetDay = WEEKDAY_ABBREVS.indexOf(lower.substring(0, 3))
  }
  if (targetDay === -1) return null

  const result = new Date(today)
  const currentDay = result.getDay()
  let daysToAdd = (targetDay - currentDay + 7) % 7

  if (daysToAdd === 0 && !forceNextWeek) {
    daysToAdd = 0
  } else if (daysToAdd === 0 || forceNextWeek) {
    daysToAdd = 7 + ((targetDay - currentDay + 7) % 7)
  }

  result.setDate(result.getDate() + daysToAdd)
  return result
}

function parseDateWithMonth(monthName: string, day: number, today: Date): Date | null {
  const lower = monthName.toLowerCase()
  let monthIndex = MONTHS.indexOf(lower)
  if (monthIndex === -1) {
    monthIndex = MONTH_ABBREVS.indexOf(lower.substring(0, 3))
  }
  if (monthIndex === -1 || day < 1 || day > 31) return null

  const year = today.getFullYear()
  const date = new Date(year, monthIndex, day)

  if (date < today) {
    date.setFullYear(year + 1)
  }

  return date
}

function parseFlexibleDate(text: string, today: Date): Date | null {
  const trimmed = text.trim().toLowerCase()

  if (trimmed === 'today' || trimmed === 'tonight') return new Date(today)
  if (trimmed === 'tomorrow') return addDays(today, 1)
  if (trimmed === 'eod' || trimmed === 'end of day') return new Date(today)
  if (trimmed === 'eow' || trimmed === 'end of week') return getEndOfWeek(today)
  if (trimmed === 'eom' || trimmed === 'end of month') return getEndOfMonth(today)

  for (const pattern of DATE_PATTERNS) {
    if (pattern.id === 'explicit-deadline') continue
    const match = trimmed.match(pattern.pattern)
    if (match) {
      return pattern.extract(match, today)
    }
  }

  return null
}

function normalizeDate(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function suggestDueDate(context: SuggestionContext): DueDateSuggestion | null {
  const { taskContent } = context
  if (!taskContent || taskContent.trim().length === 0) return null

  const today = normalizeDate(new Date())
  const matches: PatternMatch[] = []

  for (const pattern of DATE_PATTERNS) {
    const match = taskContent.match(pattern.pattern)
    if (match) {
      const extractedDate = pattern.extract(match, today)
      if (extractedDate) {
        matches.push({
          pattern: pattern.id,
          value: {
            date: normalizeDate(extractedDate),
            isDeadline: pattern.isDeadline,
            urgencyScore: pattern.urgency,
          },
          confidence: pattern.confidence,
          startIndex: match.index ?? 0,
          endIndex: (match.index ?? 0) + match[0].length,
        })
      }
    }
  }

  if (matches.length === 0) return null

  matches.sort((a, b) => b.confidence - a.confidence)
  const bestMatch = matches[0]
  const dateValue = bestMatch.value as {
    date: Date
    isDeadline: boolean
    urgencyScore: number
  }

  return {
    id: `due-date-${Date.now()}`,
    type: 'due_date',
    value: {
      ...dateValue,
      matchedPattern: bestMatch.pattern,
    },
    confidence: bestMatch.confidence,
    reasoning: generateReasoning(bestMatch.pattern, dateValue.date),
    source: 'local',
    createdAt: new Date(),
  }
}

function generateReasoning(patternId: string, date: Date): string {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const reasoningMap: Record<string, string> = {
    'explicit-deadline': `Detected explicit deadline reference pointing to ${formattedDate}`,
    'urgency-today': `Detected urgent task, suggesting today (${formattedDate})`,
    today: `Detected "today" keyword, due ${formattedDate}`,
    tomorrow: `Detected "tomorrow" keyword, due ${formattedDate}`,
    'day-after-tomorrow': `Detected "day after tomorrow", due ${formattedDate}`,
    'this-weekend': `Detected "this weekend", suggesting ${formattedDate}`,
    'next-weekend': `Detected "next weekend", suggesting ${formattedDate}`,
    'this-week': `Detected "this week", suggesting end of week (${formattedDate})`,
    'next-week': `Detected "next week", suggesting ${formattedDate}`,
    'this-month': `Detected "this month", suggesting end of month (${formattedDate})`,
    'next-month': `Detected "next month", suggesting ${formattedDate}`,
    'end-of-week': `Detected end of week reference, due ${formattedDate}`,
    'end-of-month': `Detected end of month reference, due ${formattedDate}`,
    'end-of-day': `Detected end of day reference, due ${formattedDate}`,
    'relative-in': `Detected relative time expression, due ${formattedDate}`,
    'weekday-this': `Detected weekday reference, due ${formattedDate}`,
    'weekday-next': `Detected "next [weekday]", due ${formattedDate}`,
    'month-day': `Detected specific date (${formattedDate})`,
    'day-month': `Detected specific date (${formattedDate})`,
    'date-iso': `Detected ISO date format (${formattedDate})`,
    'date-slash-us': `Detected date format (${formattedDate})`,
  }

  return reasoningMap[patternId] || `Suggested due date: ${formattedDate}`
}

export function extractAllDateMatches(text: string): PatternMatch[] {
  const today = normalizeDate(new Date())
  const matches: PatternMatch[] = []

  for (const pattern of DATE_PATTERNS) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags + 'g')

    while ((match = regex.exec(text)) !== null) {
      const extractedDate = pattern.extract(match, today)
      if (extractedDate) {
        matches.push({
          pattern: pattern.id,
          value: {
            date: normalizeDate(extractedDate),
            isDeadline: pattern.isDeadline,
            urgencyScore: pattern.urgency,
          },
          confidence: pattern.confidence,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        })
      }
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}
