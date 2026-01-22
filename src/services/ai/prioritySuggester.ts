import type { Priority } from '@/types'
import type { PatternMatch, PrioritySuggestion, SuggestionContext } from './types'

interface PriorityPattern {
  id: string
  pattern: RegExp
  priority: Priority
  confidence: number
  factors: string[]
}

const PRIORITY_PATTERNS: PriorityPattern[] = [
  // Explicit priority markers: "p1", "P1", "priority 1", "!!!""
  {
    id: 'explicit-p1',
    pattern: /\b(?:p1|priority\s*1)\b|!!!/i,
    priority: 'p1',
    confidence: 0.98,
    factors: ['Explicit P1 priority marker'],
  },
  {
    id: 'explicit-p2',
    pattern: /\b(?:p2|priority\s*2)\b|!!/i,
    priority: 'p2',
    confidence: 0.98,
    factors: ['Explicit P2 priority marker'],
  },
  {
    id: 'explicit-p3',
    pattern: /\b(?:p3|priority\s*3)\b/i,
    priority: 'p3',
    confidence: 0.98,
    factors: ['Explicit P3 priority marker'],
  },
  {
    id: 'explicit-p4',
    pattern: /\b(?:p4|priority\s*4)\b/i,
    priority: 'p4',
    confidence: 0.98,
    factors: ['Explicit P4 priority marker'],
  },

  // Single exclamation at word boundary (lower confidence than !! or !!!)
  {
    id: 'single-exclamation',
    pattern: /(?:^|\s)!(?:\s|$)/,
    priority: 'p3',
    confidence: 0.7,
    factors: ['Single exclamation mark detected'],
  },

  // Critical urgency keywords → P1
  {
    id: 'critical-urgency',
    pattern: /\b(critical|emergency|crisis|urgent|asap|immediately|right\s+away|show\s*stopper)\b/i,
    priority: 'p1',
    confidence: 0.9,
    factors: ['Critical urgency keyword detected'],
  },

  // Production/outage keywords → P1
  {
    id: 'production-issue',
    pattern:
      /\b(production\s+(?:bug|issue|error|down|outage)|outage|downtime|site\s+down|server\s+down|service\s+down)\b/i,
    priority: 'p1',
    confidence: 0.92,
    factors: ['Production issue detected'],
  },

  // Security keywords → P1
  {
    id: 'security-issue',
    pattern:
      /\b(security\s+(?:breach|vulnerability|issue|bug|hole)|vulnerability|exploit|data\s+(?:leak|breach))\b/i,
    priority: 'p1',
    confidence: 0.95,
    factors: ['Security concern detected'],
  },

  // Deadline pressure keywords → P1
  {
    id: 'deadline-pressure',
    pattern: /\b(eod|end\s+of\s+day|before\s+(?:end\s+of\s+)?day|today|must\s+finish\s+today)\b/i,
    priority: 'p1',
    confidence: 0.85,
    factors: ['Same-day deadline detected'],
  },

  // Blocking keywords → P1
  {
    id: 'blocker',
    pattern: /\b(block(?:er|ing|ed)|depends\s+on\s+this|waiting\s+on|unblocks?)\b/i,
    priority: 'p1',
    confidence: 0.88,
    factors: ['Task is blocking other work'],
  },

  // Important keywords → P2
  {
    id: 'important',
    pattern: /\b(important|high\s+priority|priority|essential|key|vital|crucial)\b/i,
    priority: 'p2',
    confidence: 0.82,
    factors: ['Importance keyword detected'],
  },

  // Soon/tomorrow keywords → P2
  {
    id: 'soon-deadline',
    pattern: /\b(tomorrow|soon|this\s+week|by\s+(?:monday|tuesday|wednesday|thursday|friday))\b/i,
    priority: 'p2',
    confidence: 0.75,
    factors: ['Near-term deadline detected'],
  },

  // Meeting/review keywords → P2
  {
    id: 'meeting-prep',
    pattern:
      /\b(before\s+(?:the\s+)?meeting|for\s+(?:the\s+)?meeting|meeting\s+prep|presentation|demo|review)\b/i,
    priority: 'p2',
    confidence: 0.78,
    factors: ['Meeting/presentation related task'],
  },

  // Client/customer keywords → P2
  {
    id: 'client-facing',
    pattern: /\b(client|customer|stakeholder|user\s+reported|user\s+request)\b/i,
    priority: 'p2',
    confidence: 0.8,
    factors: ['Client/customer facing task'],
  },

  // Normal task keywords → P3
  {
    id: 'standard-task',
    pattern: /\b(should|need\s+to|needs|required|todo)\b/i,
    priority: 'p3',
    confidence: 0.6,
    factors: ['Standard task indicator'],
  },

  // Documentation/cleanup → P3
  {
    id: 'docs-cleanup',
    pattern:
      /\b(document(?:ation)?|cleanup?|refactor|improve|optimize|update\s+(?:docs?|readme))\b/i,
    priority: 'p3',
    confidence: 0.65,
    factors: ['Documentation/maintenance task'],
  },

  // Low priority indicators → P4
  {
    id: 'low-priority',
    pattern: /\b(low\s+priority|someday|eventually|when\s+(?:I\s+)?have\s+time|nice\s+to\s+have)\b/i,
    priority: 'p4',
    confidence: 0.88,
    factors: ['Low priority indicator'],
  },

  // Maybe/optional keywords → P4
  {
    id: 'optional',
    pattern: /\b(maybe|optional|consider|idea|might|could|would\s+be\s+nice)\b/i,
    priority: 'p4',
    confidence: 0.75,
    factors: ['Optional/tentative task'],
  },

  // Research/exploration → P4
  {
    id: 'research',
    pattern: /\b(research|explore|investigate|look\s+into|spike|experiment)\b/i,
    priority: 'p4',
    confidence: 0.7,
    factors: ['Research/exploration task'],
  },

  // Future/backlog indicators → P4
  {
    id: 'future-task',
    pattern:
      /\b(next\s+month|next\s+quarter|backlog|future|later|long\s+term|stretch\s+goal)\b/i,
    priority: 'p4',
    confidence: 0.8,
    factors: ['Future/backlog task'],
  },
]

export function suggestPriority(context: SuggestionContext): PrioritySuggestion | null {
  const { taskContent } = context
  if (!taskContent || taskContent.trim().length === 0) return null

  const matches: Array<PatternMatch & { priority: Priority; factors: string[] }> = []

  for (const pattern of PRIORITY_PATTERNS) {
    const match = taskContent.match(pattern.pattern)
    if (match) {
      matches.push({
        pattern: pattern.id,
        value: { priority: pattern.priority, factors: pattern.factors },
        confidence: pattern.confidence,
        startIndex: match.index ?? 0,
        endIndex: (match.index ?? 0) + match[0].length,
        priority: pattern.priority,
        factors: pattern.factors,
      })
    }
  }

  if (matches.length === 0) return null

  // Sort by confidence, then by priority (p1 > p2 > p3 > p4)
  matches.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence
    return comparePriority(a.priority, b.priority)
  })

  const bestMatch = matches[0]

  // Collect all factors from high-confidence matches
  const allFactors = collectFactors(matches, bestMatch.confidence * 0.9)

  return {
    id: `priority-${Date.now()}`,
    type: 'priority',
    value: {
      priority: bestMatch.priority,
      factors: allFactors,
    },
    confidence: bestMatch.confidence,
    reasoning: generateReasoning(bestMatch.priority, allFactors),
    source: 'local',
    createdAt: new Date(),
  }
}

function comparePriority(a: Priority, b: Priority): number {
  const order: Record<string, number> = { p1: 1, p2: 2, p3: 3, p4: 4 }
  const aVal = a ? order[a] : 5
  const bVal = b ? order[b] : 5
  return aVal - bVal
}

function collectFactors(
  matches: Array<{ confidence: number; factors: string[] }>,
  threshold: number
): string[] {
  const factors: string[] = []
  const seen = new Set<string>()

  for (const match of matches) {
    if (match.confidence >= threshold) {
      for (const factor of match.factors) {
        if (!seen.has(factor)) {
          seen.add(factor)
          factors.push(factor)
        }
      }
    }
  }

  return factors.slice(0, 3) // Limit to 3 most relevant factors
}

function generateReasoning(priority: Priority, factors: string[]): string {
  const priorityLabels: Record<string, string> = {
    p1: 'P1 (Urgent)',
    p2: 'P2 (High)',
    p3: 'P3 (Normal)',
    p4: 'P4 (Low)',
  }

  const label = priority ? priorityLabels[priority] : 'No priority'
  const factorList = factors.length > 0 ? `: ${factors.join(', ')}` : ''

  return `Suggested ${label}${factorList}`
}

export function extractAllPriorityMatches(
  text: string
): Array<PatternMatch & { priority: Priority; factors: string[] }> {
  const matches: Array<PatternMatch & { priority: Priority; factors: string[] }> = []

  for (const pattern of PRIORITY_PATTERNS) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags + 'g')

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        pattern: pattern.id,
        value: { priority: pattern.priority, factors: pattern.factors },
        confidence: pattern.confidence,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        priority: pattern.priority,
        factors: pattern.factors,
      })
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}
