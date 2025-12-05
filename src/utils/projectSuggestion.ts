import type { Project } from '@/types'

/**
 * Suggest a project based on task content using keyword matching
 */
export function suggestProjectFromContent(
  taskContent: string,
  projects: Project[]
): { projectId?: string; confidence: number } {
  if (!taskContent.trim() || projects.length === 0) {
    return { projectId: undefined, confidence: 0 }
  }

  const lowerContent = taskContent.toLowerCase()

  // Calculate similarity score for each project
  const scores = projects
    .map((project) => {
      const lowerProjectName = project.name.toLowerCase()
      const projectWords = lowerProjectName.split(/\s+/)

      // Count keyword matches
      let matchCount = 0
      for (const word of projectWords) {
        if (lowerContent.includes(word) && word.length > 2) {
          matchCount++
        }
      }

      // Also check for exact substring match (higher priority)
      const exactMatch = lowerContent.includes(lowerProjectName)

      // Calculate confidence
      const confidence = exactMatch ? 0.9 : matchCount > 0 ? 0.5 + matchCount * 0.1 : 0

      return {
        projectId: project.id,
        projectName: project.name,
        confidence: Math.min(confidence, 1),
        matches: matchCount,
      }
    })
    .filter(({ confidence }) => confidence > 0.3)
    .sort((a, b) => b.confidence - a.confidence)

  const best = scores[0]
  return {
    projectId: best?.projectId,
    confidence: best?.confidence || 0,
  }
}

/**
 * Suggest labels based on task content
 */
export function suggestLabelsFromContent(
  taskContent: string,
  availableLabels: Array<{ id: string; name: string }>
): Array<{ labelId: string; confidence: number }> {
  if (!taskContent.trim() || availableLabels.length === 0) {
    return []
  }

  const lowerContent = taskContent.toLowerCase()

  return availableLabels
    .map((label) => {
      const lowerLabelName = label.name.toLowerCase()
      const labelWords = lowerLabelName.split(/\s+/)

      // Count keyword matches
      let matchCount = 0
      for (const word of labelWords) {
        if (lowerContent.includes(word) && word.length > 2) {
          matchCount++
        }
      }

      // Exact match has higher priority
      const exactMatch = lowerContent.includes(lowerLabelName)
      const confidence = exactMatch ? 0.9 : matchCount > 0 ? 0.5 + matchCount * 0.15 : 0

      return {
        labelId: label.id,
        labelName: label.name,
        confidence: Math.min(confidence, 1),
      }
    })
    .filter(({ confidence }) => confidence > 0.4)
    .sort((a, b) => b.confidence - a.confidence)
    .map(({ labelId, confidence }) => ({ labelId, confidence }))
}

/**
 * Determine if task content suggests a subtask relationship
 */
export function detectSubtaskPattern(taskContent: string): boolean {
  const subtaskPatterns = [
    /^(sub|step|part)[\s:]/i,
    /\b(as a sub-?task|as a step|sub-?task of)\b/i,
    /^\s*[-•]\s*/,
    /\binside\b/i,
  ]

  return subtaskPatterns.some((pattern) => pattern.test(taskContent))
}

/**
 * Extract section/category hints from task content
 */
export function extractCategoryHints(taskContent: string): {
  isUrgent: boolean
  isRecurring: boolean
  needsBreakdown: boolean
} {
  const lowerContent = taskContent.toLowerCase()

  return {
    isUrgent: /\b(urgent|asap|emergency|critical|now|immediately)\b/i.test(taskContent),
    isRecurring: /\b(daily|weekly|monthly|every|each|recurring)\b/i.test(taskContent),
    needsBreakdown: /\b(and|steps?|phases?|stages?|break down|split)\b/i.test(lowerContent),
  }
}

/**
 * Calculate task complexity and suggest how to handle it
 */
export function analyzeTaskComplexity(
  taskContent: string
): 'simple' | 'moderate' | 'complex' {
  const characteristics = {
    hasMultipleParts: /\band\b|,(?=[^,]{1,50}(?:,|$))/i.test(taskContent),
    hasTimeElement: /\b(tomorrow|today|next|in|at|by|until|before)\b/i.test(taskContent),
    hasDependencies: /\b(after|before|following|depends on|requires|needs)\b/i.test(
      taskContent
    ),
    hasConditions: /\b(if|only|when|unless|except)\b/i.test(taskContent),
    isLongText: taskContent.length > 100,
  }

  const complexityScore = Object.values(characteristics).filter(Boolean).length

  if (complexityScore >= 4) return 'complex'
  if (complexityScore >= 2) return 'moderate'
  return 'simple'
}
