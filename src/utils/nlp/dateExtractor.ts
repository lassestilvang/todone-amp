import {
  startOfDay,
  addDays,
  addWeeks,
  addMonths,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  setHours,
  setMinutes,
  endOfWeek,
  endOfMonth,
} from 'date-fns'

export interface ExtractedDateTime {
  date?: Date
  time?: string
  hasDate: boolean
  hasTime: boolean
  matchedText: string
  confidence: number
}

const DAY_FUNCTIONS = {
  monday: nextMonday,
  tuesday: nextTuesday,
  wednesday: nextWednesday,
  thursday: nextThursday,
  friday: nextFriday,
  saturday: nextSaturday,
  sunday: nextSunday,
} as const

const RELATIVE_DATE_PATTERNS = [
  { pattern: /\b(today|tonight)\b/i, handler: () => startOfDay(new Date()) },
  { pattern: /\btomorrow\b/i, handler: () => startOfDay(addDays(new Date(), 1)) },
  { pattern: /\byesterday\b/i, handler: () => startOfDay(addDays(new Date(), -1)) },
  { pattern: /\bnext week\b/i, handler: () => startOfDay(addWeeks(new Date(), 1)) },
  { pattern: /\bnext month\b/i, handler: () => startOfDay(addMonths(new Date(), 1)) },
  {
    pattern: /\bthis week\b/i,
    handler: () => endOfWeek(new Date(), { weekStartsOn: 1 }),
  },
  { pattern: /\bthis month\b/i, handler: () => endOfMonth(new Date()) },
  { pattern: /\bend of week\b/i, handler: () => endOfWeek(new Date(), { weekStartsOn: 1 }) },
  { pattern: /\bend of month\b/i, handler: () => endOfMonth(new Date()) },
]

export function extractDateTime(text: string): ExtractedDateTime {
  const result: ExtractedDateTime = {
    hasDate: false,
    hasTime: false,
    matchedText: '',
    confidence: 0,
  }

  let remainingText = text
  const matchedParts: string[] = []

  // Try relative date patterns first
  for (const { pattern, handler } of RELATIVE_DATE_PATTERNS) {
    const match = remainingText.match(pattern)
    if (match) {
      result.date = handler()
      result.hasDate = true
      result.confidence = 0.95
      matchedParts.push(match[0])
      remainingText = remainingText.replace(match[0], '').trim()
      break
    }
  }

  // Try day of week patterns
  if (!result.hasDate) {
    const dayMatch = remainingText.match(
      /\b(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
    )
    if (dayMatch) {
      const dayName = dayMatch[1].toLowerCase() as keyof typeof DAY_FUNCTIONS
      const nextDayFn = DAY_FUNCTIONS[dayName]
      if (nextDayFn) {
        result.date = startOfDay(nextDayFn(new Date()))
        result.hasDate = true
        result.confidence = 0.9
        matchedParts.push(dayMatch[0])
        remainingText = remainingText.replace(dayMatch[0], '').trim()
      }
    }
  }

  // Try "in X days/weeks/months" patterns
  if (!result.hasDate) {
    const inMatch = remainingText.match(/\bin\s+(\d+)\s+(days?|weeks?|months?)\b/i)
    if (inMatch) {
      const amount = parseInt(inMatch[1], 10)
      const unit = inMatch[2].toLowerCase()
      const now = new Date()

      if (unit.startsWith('day')) {
        result.date = startOfDay(addDays(now, amount))
      } else if (unit.startsWith('week')) {
        result.date = startOfDay(addWeeks(now, amount))
      } else if (unit.startsWith('month')) {
        result.date = startOfDay(addMonths(now, amount))
      }

      if (result.date) {
        result.hasDate = true
        result.confidence = 0.85
        matchedParts.push(inMatch[0])
        remainingText = remainingText.replace(inMatch[0], '').trim()
      }
    }
  }

  // Try explicit date patterns (MM/DD, MM-DD, "Jan 15", etc.)
  if (!result.hasDate) {
    const explicitDatePatterns = [
      {
        pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
        parse: (m: RegExpMatchArray) => {
          const month = parseInt(m[1], 10) - 1
          const day = parseInt(m[2], 10)
          const year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear()
          return new Date(year < 100 ? 2000 + year : year, month, day)
        },
      },
      {
        pattern:
          /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/i,
        parse: (m: RegExpMatchArray) => {
          const monthStr = m[1].toLowerCase().substring(0, 3)
          const months = [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec',
          ]
          const month = months.indexOf(monthStr)
          const day = parseInt(m[2], 10)
          const year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear()
          return new Date(year, month, day)
        },
      },
      {
        pattern: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*,?\s*(\d{4}))?\b/i,
        parse: (m: RegExpMatchArray) => {
          const monthStr = m[2].toLowerCase().substring(0, 3)
          const months = [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec',
          ]
          const month = months.indexOf(monthStr)
          const day = parseInt(m[1], 10)
          const year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear()
          return new Date(year, month, day)
        },
      },
    ]

    for (const { pattern, parse: parseFn } of explicitDatePatterns) {
      const match = remainingText.match(pattern)
      if (match) {
        try {
          const parsed = parseFn(match)
          if (!isNaN(parsed.getTime())) {
            result.date = startOfDay(parsed)
            result.hasDate = true
            result.confidence = 0.9
            matchedParts.push(match[0])
            remainingText = remainingText.replace(match[0], '').trim()
            break
          }
        } catch {
          // Continue to next pattern
        }
      }
    }
  }

  // Extract time
  const timePatterns = [
    {
      pattern: /\bat\s+(\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
      parse: (m: RegExpMatchArray) => {
        let hour = parseInt(m[1], 10)
        const minute = parseInt(m[2], 10)
        const period = m[3]?.toLowerCase()

        if (period === 'pm' && hour !== 12) hour += 12
        if (period === 'am' && hour === 12) hour = 0

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      },
    },
    {
      pattern: /\bat\s+(\d{1,2})\s*(am|pm)\b/i,
      parse: (m: RegExpMatchArray) => {
        let hour = parseInt(m[1], 10)
        const period = m[2].toLowerCase()

        if (period === 'pm' && hour !== 12) hour += 12
        if (period === 'am' && hour === 12) hour = 0

        return `${String(hour).padStart(2, '0')}:00`
      },
    },
    {
      pattern: /\bat\s+(\d{1,2}):(\d{2})\b/,
      parse: (m: RegExpMatchArray) => {
        const hour = parseInt(m[1], 10)
        const minute = parseInt(m[2], 10)
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      },
    },
    {
      pattern: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i,
      parse: (m: RegExpMatchArray) => {
        let hour = parseInt(m[1], 10)
        const minute = parseInt(m[2], 10)
        const period = m[3].toLowerCase()

        if (period === 'pm' && hour !== 12) hour += 12
        if (period === 'am' && hour === 12) hour = 0

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      },
    },
    {
      pattern: /\b(\d{1,2})\s*(am|pm)\b/i,
      parse: (m: RegExpMatchArray) => {
        let hour = parseInt(m[1], 10)
        const period = m[2].toLowerCase()

        if (period === 'pm' && hour !== 12) hour += 12
        if (period === 'am' && hour === 12) hour = 0

        return `${String(hour).padStart(2, '0')}:00`
      },
    },
    {
      pattern: /\b(noon|midday)\b/i,
      parse: () => '12:00',
    },
    {
      pattern: /\b(midnight)\b/i,
      parse: () => '00:00',
    },
    {
      pattern: /\b(morning)\b/i,
      parse: () => '09:00',
    },
    {
      pattern: /\b(afternoon)\b/i,
      parse: () => '14:00',
    },
    {
      pattern: /\b(evening)\b/i,
      parse: () => '18:00',
    },
  ]

  for (const { pattern, parse: parseFn } of timePatterns) {
    const match = remainingText.match(pattern)
    if (match) {
      result.time = parseFn(match)
      result.hasTime = true
      matchedParts.push(match[0])
      if (!result.hasDate) {
        result.confidence = 0.7
      }
      break
    }
  }

  result.matchedText = matchedParts.join(' ')

  // If we have a date but no time, set default time based on context
  if (result.date && result.time) {
    const [hours, minutes] = result.time.split(':').map(Number)
    result.date = setMinutes(setHours(result.date, hours), minutes)
  }

  return result
}

export function removeDateTimeFromText(text: string): string {
  let result = text

  // Remove all known date/time patterns
  const patterns = [
    /\b(today|tonight|tomorrow|yesterday)\b/gi,
    /\bnext (week|month)\b/gi,
    /\bthis (week|month)\b/gi,
    /\bend of (week|month)\b/gi,
    /\b(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\bin\s+\d+\s+(days?|weeks?|months?)\b/gi,
    /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?\b/gi,
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*,?\s*\d{4})?\b/gi,
    /\bat\s+\d{1,2}:?\d{0,2}\s*(?:am|pm)?\b/gi,
    /\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/gi,
    /\b\d{1,2}\s*(?:am|pm)\b/gi,
    /\b(noon|midday|midnight|morning|afternoon|evening)\b/gi,
  ]

  for (const pattern of patterns) {
    result = result.replace(pattern, '')
  }

  // Clean up extra whitespace
  return result.replace(/\s+/g, ' ').trim()
}
