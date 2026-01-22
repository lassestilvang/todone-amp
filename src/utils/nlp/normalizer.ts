/**
 * Text normalization for task input
 * Expands common abbreviations and normalizes text before parsing
 */

export interface NormalizationResult {
  normalizedText: string
  originalText: string
  replacements: Array<{
    original: string
    replacement: string
    start: number
    end: number
  }>
}

const ABBREVIATION_MAP: Record<string, string> = {
  // Time-related
  tmrw: 'tomorrow',
  tmr: 'tomorrow',
  tomo: 'tomorrow',
  tdy: 'today',
  tnght: 'tonight',
  eod: 'end of day',
  eow: 'end of week',
  eom: 'end of month',

  // Meeting/appointment
  mtg: 'meeting',
  mtgs: 'meetings',
  appt: 'appointment',
  appts: 'appointments',
  conf: 'conference',

  // Actions
  fup: 'follow up',
  cb: 'call back',
  'c/b': 'call back',

  // Common words
  'w/': 'with',
  'w/o': 'without',
  're:': 'regarding',
  abt: 'about',
  pls: 'please',
  plz: 'please',
  thx: 'thanks',
  tx: 'thanks',
  msg: 'message',
  msgs: 'messages',
  info: 'information',
  docs: 'documents',
  doc: 'document',

  // People references
  mgr: 'manager',
  hr: 'HR',
  ceo: 'CEO',
  cto: 'CTO',
  cfo: 'CFO',

  // Status
  wip: 'work in progress',
  asap: 'as soon as possible',
  fyi: 'for your information',

  // Time shortcuts (ensure lowercase matching)
  mon: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  thurs: 'thursday',
  fri: 'friday',
  sat: 'saturday',
  sun: 'sunday',
}

const SMART_QUOTE_MAP: Record<string, string> = {
  '\u2018': "'", // left single quote
  '\u2019': "'", // right single quote
  '\u201C': '"', // left double quote
  '\u201D': '"', // right double quote
  '\u2013': '-', // en dash
  '\u2014': '-', // em dash
  '\u2026': '...', // ellipsis
}

/**
 * Normalize smart quotes and special characters
 */
function normalizeCharacters(text: string): string {
  let result = text

  for (const [char, replacement] of Object.entries(SMART_QUOTE_MAP)) {
    result = result.replace(new RegExp(char, 'g'), replacement)
  }

  return result
}

/**
 * Normalize whitespace (collapse multiple spaces, trim)
 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Expand abbreviations in the text
 * Only expands whole-word matches to avoid false positives
 */
function expandAbbreviations(text: string): {
  text: string
  replacements: Array<{ original: string; replacement: string; start: number; end: number }>
} {
  const replacements: Array<{
    original: string
    replacement: string
    start: number
    end: number
  }> = []

  let result = text
  let offset = 0

  for (const [abbrev, expansion] of Object.entries(ABBREVIATION_MAP)) {
    // Create regex that matches whole words (or with / for patterns like w/)
    const escapedAbbrev = abbrev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = abbrev.includes('/')
      ? new RegExp(`(^|\\s)${escapedAbbrev}(?=\\s|$)`, 'gi')
      : new RegExp(`\\b${escapedAbbrev}\\b`, 'gi')

    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.source, pattern.flags)

    while ((match = regex.exec(result)) !== null) {
      const matchStart = match[0].startsWith(' ') ? match.index + 1 : match.index
      const matchEnd = match.index + match[0].length
      const originalMatch = result.substring(matchStart, matchEnd)

      // Preserve case for single-word expansions
      let finalExpansion = expansion
      if (originalMatch[0] === originalMatch[0].toUpperCase()) {
        finalExpansion = expansion.charAt(0).toUpperCase() + expansion.slice(1)
      }

      const prefix = match[0].startsWith(' ') ? ' ' : ''
      const replacementText = prefix + finalExpansion

      replacements.push({
        original: originalMatch,
        replacement: finalExpansion,
        start: matchStart + offset,
        end: matchEnd + offset,
      })

      result = result.substring(0, match.index) + replacementText + result.substring(matchEnd)
      offset += finalExpansion.length - originalMatch.length

      // Update regex lastIndex since string length changed
      regex.lastIndex = match.index + replacementText.length
    }
  }

  return { text: result, replacements }
}

/**
 * Normalize common separators and formatting
 */
function normalizeSeparators(text: string): string {
  // Normalize "re :" or "re  :" to "re:"
  let result = text.replace(/\bre\s*:\s*/gi, 'regarding ')

  // Normalize "about:" to "about"
  result = result.replace(/\babout\s*:\s*/gi, 'about ')

  // Normalize "regarding:" to "regarding"
  result = result.replace(/\bregarding\s*:\s*/gi, 'regarding ')

  return result
}

/**
 * Main normalization function
 * Prepares text for parsing by expanding abbreviations and normalizing formatting
 */
export function normalizeInput(text: string): NormalizationResult {
  if (!text || text.trim().length === 0) {
    return {
      normalizedText: '',
      originalText: text,
      replacements: [],
    }
  }

  const originalText = text

  // Step 1: Normalize special characters
  let result = normalizeCharacters(text)

  // Step 2: Normalize whitespace
  result = normalizeWhitespace(result)

  // Step 3: Expand abbreviations
  const { text: expandedText, replacements } = expandAbbreviations(result)
  result = expandedText

  // Step 4: Normalize separators
  result = normalizeSeparators(result)

  // Step 5: Final whitespace cleanup
  result = normalizeWhitespace(result)

  return {
    normalizedText: result,
    originalText,
    replacements,
  }
}

/**
 * Get the abbreviation map for external use (e.g., displaying to users)
 */
export function getAbbreviationHints(): Array<{ abbrev: string; expansion: string }> {
  return Object.entries(ABBREVIATION_MAP).map(([abbrev, expansion]) => ({
    abbrev,
    expansion,
  }))
}
