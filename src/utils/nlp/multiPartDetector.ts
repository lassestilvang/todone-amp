/**
 * Multi-part task detection
 * Identifies when a task input contains multiple distinct actions
 */

export interface MultiPartResult {
  isMultiPart: boolean
  confidence: number
  suggestedSplit?: string[]
  splitPoints: Array<{ index: number; separator: string }>
}

const SPLIT_PATTERNS = [
  // Conjunctions that often separate tasks
  { pattern: /\band\s+(?:also\s+)?(?:then\s+)?/gi, separator: 'and' },
  { pattern: /\bthen\s+/gi, separator: 'then' },
  { pattern: /\b(?:,\s*)?also\s+/gi, separator: 'also' },
  { pattern: /\bplus\s+/gi, separator: 'plus' },
  { pattern: /\bas well as\s+/gi, separator: 'as well as' },

  // Punctuation separators
  { pattern: /;\s*/g, separator: ';' },
  { pattern: /\s+-\s+/g, separator: '-' },
]

const ACTION_VERB_PATTERN =
  /\b(call|email|message|text|meet|review|write|draft|research|schedule|follow up|check|set up|buy|pay|book|create|update|fix|send|read|prepare|complete|finish|submit|upload|download|print|organize|clean|file|cancel|renew|register|apply|confirm|verify|notify|remind)\b/gi

/**
 * Detect if the input contains multiple distinct tasks
 */
export function detectMultiPart(text: string): MultiPartResult {
  const result: MultiPartResult = {
    isMultiPart: false,
    confidence: 0,
    splitPoints: [],
  }

  if (!text || text.trim().length === 0) {
    return result
  }

  // Find all potential split points
  for (const { pattern, separator } of SPLIT_PATTERNS) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)

    while ((match = regex.exec(text)) !== null) {
      // Check if there's content on both sides of the separator
      const before = text.substring(0, match.index).trim()
      const after = text.substring(match.index + match[0].length).trim()

      if (before.length > 3 && after.length > 3) {
        result.splitPoints.push({
          index: match.index,
          separator,
        })
      }
    }
  }

  if (result.splitPoints.length === 0) {
    return result
  }

  // Count action verbs in the text
  const actionMatches = text.match(ACTION_VERB_PATTERN)
  const actionCount = actionMatches ? new Set(actionMatches.map((m) => m.toLowerCase())).size : 0

  // Determine if this is likely a multi-part task
  // Require at least 2 different action verbs AND a split point
  if (actionCount >= 2 && result.splitPoints.length > 0) {
    result.isMultiPart = true
    result.confidence = Math.min(0.9, 0.5 + actionCount * 0.1 + result.splitPoints.length * 0.15)

    // Generate suggested splits
    result.suggestedSplit = generateSplits(text, result.splitPoints)
  } else if (result.splitPoints.length > 0) {
    // Even without multiple action verbs, if we have clear separators, suggest split
    result.isMultiPart = true
    result.confidence = 0.4 + result.splitPoints.length * 0.1

    result.suggestedSplit = generateSplits(text, result.splitPoints)
  }

  return result
}

/**
 * Generate split suggestions from the text and split points
 */
function generateSplits(
  text: string,
  splitPoints: Array<{ index: number; separator: string }>
): string[] {
  if (splitPoints.length === 0) {
    return [text.trim()]
  }

  // Sort split points by index
  const sortedPoints = [...splitPoints].sort((a, b) => a.index - b.index)

  const splits: string[] = []
  let lastIndex = 0

  for (const point of sortedPoints) {
    const part = text.substring(lastIndex, point.index).trim()
    if (part.length > 0) {
      splits.push(capitalizeFirst(part))
    }

    // Find the end of the separator in the original text
    for (const { pattern, separator } of SPLIT_PATTERNS) {
      if (separator === point.separator) {
        const regex = new RegExp(pattern.source, pattern.flags)
        regex.lastIndex = point.index
        const match = regex.exec(text)
        if (match && match.index === point.index) {
          lastIndex = point.index + match[0].length
          break
        }
      }
    }
  }

  // Add the remaining text
  const remaining = text.substring(lastIndex).trim()
  if (remaining.length > 0) {
    splits.push(capitalizeFirst(remaining))
  }

  // Filter out very short splits that are likely artifacts
  return splits.filter((s) => s.length > 3)
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Check if a specific separator would create valid splits
 */
export function wouldSplitCleanly(
  text: string,
  separator: string
): { valid: boolean; parts: string[] } {
  const pattern = SPLIT_PATTERNS.find((p) => p.separator === separator)
  if (!pattern) {
    return { valid: false, parts: [] }
  }

  const parts = text.split(pattern.pattern).map((p) => p.trim()).filter((p) => p.length > 3)

  return {
    valid: parts.length > 1,
    parts,
  }
}
