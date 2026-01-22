/**
 * Action verb detection and task type classification
 * Identifies common task actions and provides duration hints
 */

export type ActionType =
  | 'call'
  | 'email'
  | 'message'
  | 'meeting'
  | 'review'
  | 'write'
  | 'research'
  | 'schedule'
  | 'follow_up'
  | 'check'
  | 'setup'
  | 'buy'
  | 'pay'
  | 'book'
  | 'create'
  | 'update'
  | 'fix'
  | 'send'
  | 'read'
  | 'prepare'
  | 'complete'
  | 'other'

export interface ActionResult {
  hasAction: boolean
  actionType: ActionType
  actionVerb: string
  target?: string
  estimatedDuration?: number
  durationConfidence: number
  matchedSpan: { start: number; end: number }
}

interface ActionPattern {
  type: ActionType
  patterns: RegExp[]
  defaultDuration: number
  durationConfidence: number
}

const ACTION_PATTERNS: ActionPattern[] = [
  {
    type: 'call',
    patterns: [
      /^(call|phone|ring|dial)\b/i,
      /\b(call|phone|ring)\s+(?:back\s+)?(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 15,
    durationConfidence: 0.6,
  },
  {
    type: 'email',
    patterns: [/^(email|e-mail|mail)\b/i, /\b(email|e-mail|mail)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 15,
    durationConfidence: 0.5,
  },
  {
    type: 'message',
    patterns: [
      /^(message|text|dm|slack|ping)\b/i,
      /\b(text|message|dm|slack|ping)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 5,
    durationConfidence: 0.6,
  },
  {
    type: 'meeting',
    patterns: [
      /^(meet|meeting|sync|standup|stand-up|huddle|1:1|one-on-one)\b/i,
      /\b(meet(?:ing)?|sync)\s+(?:with\s+)?(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 30,
    durationConfidence: 0.5,
  },
  {
    type: 'follow_up',
    patterns: [
      /^(follow up|follow-up|followup|check-in|check in)\b/i,
      /\b(follow[- ]?up|check-in)\s+(?:with\s+|on\s+)?(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 15,
    durationConfidence: 0.5,
  },
  {
    type: 'review',
    patterns: [
      /^(review|check|look at|examine|audit|inspect)\b/i,
      /\b(review)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 30,
    durationConfidence: 0.4,
  },
  {
    type: 'write',
    patterns: [/^(write|draft|compose|author)\b/i, /\b(write|draft)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 60,
    durationConfidence: 0.4,
  },
  {
    type: 'research',
    patterns: [
      /^(research|investigate|look into|explore|analyze)\b/i,
      /\b(research|investigate)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 45,
    durationConfidence: 0.3,
  },
  {
    type: 'schedule',
    patterns: [
      /^(schedule|plan|arrange|set up|book)\b/i,
      /\b(schedule|plan|arrange)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 15,
    durationConfidence: 0.5,
  },
  {
    type: 'check',
    patterns: [
      /^(check on|verify|confirm|validate)\b/i,
      /\b(verify|confirm)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 10,
    durationConfidence: 0.5,
  },
  {
    type: 'setup',
    patterns: [/^(set up|setup|configure|install|deploy)\b/i, /\b(set up|setup)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 30,
    durationConfidence: 0.4,
  },
  {
    type: 'buy',
    patterns: [
      /^(buy|purchase|order|get|pick up)\b/i,
      /\b(buy|purchase|order)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 15,
    durationConfidence: 0.4,
  },
  {
    type: 'pay',
    patterns: [/^(pay|settle|transfer|reimburse)\b/i, /\b(pay)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 10,
    durationConfidence: 0.6,
  },
  {
    type: 'book',
    patterns: [
      /^(book|reserve|make (?:a )?reservation)\b/i,
      /\b(book|reserve)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 15,
    durationConfidence: 0.5,
  },
  {
    type: 'create',
    patterns: [/^(create|make|build|develop)\b/i, /\b(create|make|build)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 45,
    durationConfidence: 0.3,
  },
  {
    type: 'update',
    patterns: [/^(update|edit|modify|change|revise)\b/i, /\b(update|edit)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 20,
    durationConfidence: 0.4,
  },
  {
    type: 'fix',
    patterns: [/^(fix|repair|debug|resolve|troubleshoot)\b/i, /\b(fix|repair|debug)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 30,
    durationConfidence: 0.3,
  },
  {
    type: 'send',
    patterns: [/^(send|share|forward|distribute)\b/i, /\b(send|share|forward)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 10,
    durationConfidence: 0.5,
  },
  {
    type: 'read',
    patterns: [
      /^(read|study|go through|look over)\b/i,
      /\b(read|study)\s+(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 30,
    durationConfidence: 0.4,
  },
  {
    type: 'prepare',
    patterns: [
      /^(prepare|prep|get ready|organize)\b/i,
      /\b(prepare|prep)\s+(?:for\s+)?(\w+(?:\s+\w+)?)/i,
    ],
    defaultDuration: 30,
    durationConfidence: 0.4,
  },
  {
    type: 'complete',
    patterns: [/^(complete|finish|finalize|wrap up)\b/i, /\b(complete|finish)\s+(\w+(?:\s+\w+)?)/i],
    defaultDuration: 30,
    durationConfidence: 0.3,
  },
]

/**
 * Extract action information from task text
 */
export function extractAction(text: string): ActionResult {
  const result: ActionResult = {
    hasAction: false,
    actionType: 'other',
    actionVerb: '',
    durationConfidence: 0,
    matchedSpan: { start: 0, end: 0 },
  }

  if (!text || text.trim().length === 0) {
    return result
  }

  for (const actionPattern of ACTION_PATTERNS) {
    for (const pattern of actionPattern.patterns) {
      const match = text.match(pattern)
      if (match && match.index !== undefined) {
        result.hasAction = true
        result.actionType = actionPattern.type
        result.actionVerb = match[1]
        result.estimatedDuration = actionPattern.defaultDuration
        result.durationConfidence = actionPattern.durationConfidence
        result.matchedSpan = {
          start: match.index,
          end: match.index + match[0].length,
        }

        // Extract target if available (second capture group)
        if (match[2]) {
          result.target = match[2].trim()
        }

        return result
      }
    }
  }

  return result
}

/**
 * Get duration estimate based on action type
 */
export function getDurationForAction(actionType: ActionType): {
  minutes: number
  confidence: number
} {
  const pattern = ACTION_PATTERNS.find((p) => p.type === actionType)
  if (pattern) {
    return {
      minutes: pattern.defaultDuration,
      confidence: pattern.durationConfidence,
    }
  }
  return { minutes: 30, confidence: 0.2 }
}

/**
 * Get all supported action types with their estimated durations
 */
export function getActionTypeHints(): Array<{
  type: ActionType
  examples: string[]
  duration: number
}> {
  return ACTION_PATTERNS.map((p) => ({
    type: p.type,
    examples: p.patterns.slice(0, 2).map((pat) => pat.source.replace(/[^a-z\s|]/gi, '')),
    duration: p.defaultDuration,
  }))
}
