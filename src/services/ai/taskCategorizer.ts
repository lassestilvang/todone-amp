import type { Task } from '@/types'
import type { LabelsSuggestion, ProjectSuggestion, SuggestionContext } from './types'

export type TaskCategory =
  | 'work'
  | 'personal'
  | 'health'
  | 'finance'
  | 'home'
  | 'learning'
  | 'social'
  | 'errands'
  | 'creative'
  | 'admin'

interface CategoryPattern {
  id: string
  pattern: RegExp
  category: TaskCategory
  confidence: number
  keywords: string[]
}

interface ProjectKeywords {
  projectId: string
  projectName: string
  keywords: string[]
  normalizedName: string
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  // Work-related
  {
    id: 'work-meetings',
    pattern: /\b(meeting|standup|sync|call|presentation|demo|review|1:1|one-on-one)\b/i,
    category: 'work',
    confidence: 0.85,
    keywords: ['meeting', 'standup', 'sync', 'call', 'presentation', 'demo', 'review'],
  },
  {
    id: 'work-dev',
    pattern:
      /\b(deploy|pr|pull\s+request|merge|code|fix\s+bug|debug|test|refactor|api|backend|frontend|database)\b/i,
    category: 'work',
    confidence: 0.9,
    keywords: ['deploy', 'PR', 'merge', 'code', 'bug', 'debug', 'test', 'refactor', 'API'],
  },
  {
    id: 'work-communication',
    pattern: /\b(email|slack|respond|reply|follow\s+up|send|client|stakeholder|team)\b/i,
    category: 'work',
    confidence: 0.75,
    keywords: ['email', 'slack', 'respond', 'reply', 'follow up', 'client'],
  },
  {
    id: 'work-docs',
    pattern: /\b(document|documentation|wiki|readme|spec|proposal|report|analysis)\b/i,
    category: 'work',
    confidence: 0.8,
    keywords: ['document', 'documentation', 'wiki', 'spec', 'proposal', 'report'],
  },

  // Personal
  {
    id: 'personal-family',
    pattern: /\b(family|mom|dad|parents|kids|children|spouse|partner|wife|husband|birthday)\b/i,
    category: 'personal',
    confidence: 0.9,
    keywords: ['family', 'mom', 'dad', 'parents', 'kids', 'birthday'],
  },
  {
    id: 'personal-self',
    pattern: /\b(journal|meditat|mindful|relax|hobby|read|book|movie|game|play)\b/i,
    category: 'personal',
    confidence: 0.8,
    keywords: ['journal', 'meditate', 'relax', 'hobby', 'read', 'book', 'movie'],
  },

  // Health & Fitness
  {
    id: 'health-exercise',
    pattern:
      /\b(workout|exercise|gym|run|jog|yoga|stretch|swim|bike|walk|hike|fitness|training)\b/i,
    category: 'health',
    confidence: 0.92,
    keywords: ['workout', 'exercise', 'gym', 'run', 'yoga', 'fitness', 'training'],
  },
  {
    id: 'health-medical',
    pattern:
      /\b(doctor|appointment|dentist|checkup|check-up|prescription|medicine|vitamins|therapy|therapist)\b/i,
    category: 'health',
    confidence: 0.95,
    keywords: ['doctor', 'dentist', 'checkup', 'prescription', 'medicine', 'therapy'],
  },
  {
    id: 'health-nutrition',
    pattern: /\b(meal\s+prep|diet|nutrition|calories|healthy|cook|recipe)\b/i,
    category: 'health',
    confidence: 0.8,
    keywords: ['meal prep', 'diet', 'nutrition', 'healthy', 'cook', 'recipe'],
  },

  // Finance
  {
    id: 'finance-bills',
    pattern: /\b(pay|bill|invoice|rent|mortgage|insurance|subscription|utilities)\b/i,
    category: 'finance',
    confidence: 0.88,
    keywords: ['pay', 'bill', 'invoice', 'rent', 'mortgage', 'insurance'],
  },
  {
    id: 'finance-money',
    pattern: /\b(budget|expense|invest|savings|bank|transfer|tax|taxes|accountant)\b/i,
    category: 'finance',
    confidence: 0.9,
    keywords: ['budget', 'expense', 'invest', 'savings', 'bank', 'tax'],
  },

  // Home & Household
  {
    id: 'home-chores',
    pattern:
      /\b(clean|vacuum|laundry|dishes|trash|garbage|organize|declutter|tidy|dust|mop)\b/i,
    category: 'home',
    confidence: 0.9,
    keywords: ['clean', 'vacuum', 'laundry', 'dishes', 'trash', 'organize', 'declutter'],
  },
  {
    id: 'home-maintenance',
    pattern:
      /\b(repair|fix|install|paint|plumber|electrician|handyman|mow|garden|yard|maintenance)\b/i,
    category: 'home',
    confidence: 0.88,
    keywords: ['repair', 'fix', 'install', 'paint', 'plumber', 'garden', 'maintenance'],
  },

  // Learning & Education
  {
    id: 'learning-study',
    pattern:
      /\b(study|learn|course|class|lesson|tutorial|practice|homework|assignment|exam|quiz)\b/i,
    category: 'learning',
    confidence: 0.92,
    keywords: ['study', 'learn', 'course', 'class', 'tutorial', 'practice', 'homework'],
  },
  {
    id: 'learning-skills',
    pattern: /\b(skill|certification|certificate|training|workshop|webinar|conference)\b/i,
    category: 'learning',
    confidence: 0.85,
    keywords: ['skill', 'certification', 'training', 'workshop', 'webinar', 'conference'],
  },

  // Social
  {
    id: 'social-events',
    pattern: /\b(party|dinner|lunch|coffee|drinks|hangout|visit|catch\s+up|meetup|event)\b/i,
    category: 'social',
    confidence: 0.82,
    keywords: ['party', 'dinner', 'lunch', 'coffee', 'drinks', 'hangout', 'visit', 'meetup'],
  },
  {
    id: 'social-communication',
    pattern: /\b(call\s+(?:mom|dad|friend)|text|message|wish|congratulat|thank)\b/i,
    category: 'social',
    confidence: 0.8,
    keywords: ['call', 'text', 'message', 'wish', 'congratulate', 'thank'],
  },

  // Errands
  {
    id: 'errands-shopping',
    pattern: /\b(buy|shop|grocery|store|mall|order|pickup|pick\s+up|return|exchange)\b/i,
    category: 'errands',
    confidence: 0.85,
    keywords: ['buy', 'shop', 'grocery', 'store', 'order', 'pickup', 'return'],
  },
  {
    id: 'errands-services',
    pattern: /\b(drop\s+off|mail|post\s+office|bank|pharmacy|dry\s+clean|haircut|salon)\b/i,
    category: 'errands',
    confidence: 0.88,
    keywords: ['drop off', 'mail', 'post office', 'bank', 'pharmacy', 'haircut'],
  },

  // Creative
  {
    id: 'creative-art',
    pattern: /\b(draw|paint|sketch|design|illustrat|photo|video|edit|create|art)\b/i,
    category: 'creative',
    confidence: 0.85,
    keywords: ['draw', 'paint', 'sketch', 'design', 'photo', 'video', 'edit', 'create'],
  },
  {
    id: 'creative-writing',
    pattern: /\b(write|blog|article|story|novel|content|script|lyrics|poem)\b/i,
    category: 'creative',
    confidence: 0.82,
    keywords: ['write', 'blog', 'article', 'story', 'content', 'script'],
  },
  {
    id: 'creative-music',
    pattern: /\b(music|song|compose|record|practice\s+(?:piano|guitar|drums)|instrument)\b/i,
    category: 'creative',
    confidence: 0.85,
    keywords: ['music', 'song', 'compose', 'record', 'practice', 'instrument'],
  },

  // Administrative
  {
    id: 'admin-paperwork',
    pattern:
      /\b(form|application|license|passport|id|registration|renew|update\s+(?:info|information))\b/i,
    category: 'admin',
    confidence: 0.85,
    keywords: ['form', 'application', 'license', 'passport', 'registration', 'renew'],
  },
  {
    id: 'admin-planning',
    pattern: /\b(schedule|plan|book|reserve|appointment|calendar|organize)\b/i,
    category: 'admin',
    confidence: 0.7,
    keywords: ['schedule', 'plan', 'book', 'reserve', 'appointment', 'calendar'],
  },
]

const LABEL_PATTERNS: Array<{ pattern: RegExp; labels: string[]; confidence: number }> = [
  // Communication labels
  { pattern: /\b(email|slack|message|respond|reply)\b/i, labels: ['communication'], confidence: 0.8 },
  { pattern: /\b(call|phone|video\s+call|zoom|meet)\b/i, labels: ['call', 'communication'], confidence: 0.85 },

  // Time-based labels
  { pattern: /\b(quick|5\s*min|10\s*min|fast|brief)\b/i, labels: ['quick-task'], confidence: 0.8 },
  { pattern: /\b(deep\s+work|focus|concentrate|intensive)\b/i, labels: ['deep-work'], confidence: 0.85 },

  // Status labels
  { pattern: /\b(waiting|pending|blocked|on\s+hold)\b/i, labels: ['waiting'], confidence: 0.9 },
  { pattern: /\b(urgent|asap|immediately|critical)\b/i, labels: ['urgent'], confidence: 0.95 },
  { pattern: /\b(review|feedback|approval)\b/i, labels: ['needs-review'], confidence: 0.82 },

  // Type labels
  { pattern: /\b(research|investigate|explore|spike)\b/i, labels: ['research'], confidence: 0.85 },
  { pattern: /\b(idea|brainstorm|think|consider)\b/i, labels: ['idea'], confidence: 0.75 },
  { pattern: /\b(recurring|weekly|daily|monthly)\b/i, labels: ['recurring'], confidence: 0.8 },

  // Context labels
  { pattern: /\b(online|internet|web)\b/i, labels: ['online'], confidence: 0.7 },
  { pattern: /\b(offline|no\s+internet)\b/i, labels: ['offline'], confidence: 0.8 },
  { pattern: /\b(at\s+home|home\s+only)\b/i, labels: ['@home'], confidence: 0.85 },
  { pattern: /\b(at\s+office|office\s+only|work\s+only)\b/i, labels: ['@office'], confidence: 0.85 },
  { pattern: /\b(on\s+the\s+go|commute|traveling)\b/i, labels: ['@anywhere'], confidence: 0.8 },
]

export interface CategorySuggestion {
  category: TaskCategory
  confidence: number
  matchedPatterns: string[]
}

export interface TaskGroupingSuggestion {
  category: CategorySuggestion | null
  project: ProjectSuggestion | null
  labels: LabelsSuggestion | null
}

export function suggestCategory(taskContent: string): CategorySuggestion | null {
  if (!taskContent || taskContent.trim().length === 0) return null

  const matches: Array<{ category: TaskCategory; confidence: number; patternId: string }> = []

  for (const pattern of CATEGORY_PATTERNS) {
    if (pattern.pattern.test(taskContent)) {
      matches.push({
        category: pattern.category,
        confidence: pattern.confidence,
        patternId: pattern.id,
      })
    }
  }

  if (matches.length === 0) return null

  // Group by category and combine confidences
  const categoryScores = new Map<TaskCategory, { score: number; patterns: string[] }>()

  for (const match of matches) {
    const existing = categoryScores.get(match.category)
    if (existing) {
      // Combine confidences (diminishing returns for multiple matches)
      existing.score = Math.min(0.99, existing.score + match.confidence * 0.2)
      existing.patterns.push(match.patternId)
    } else {
      categoryScores.set(match.category, {
        score: match.confidence,
        patterns: [match.patternId],
      })
    }
  }

  // Find best category
  let bestCategory: TaskCategory | null = null
  let bestScore = 0
  let bestPatterns: string[] = []

  for (const [category, data] of categoryScores) {
    if (data.score > bestScore) {
      bestScore = data.score
      bestCategory = category
      bestPatterns = data.patterns
    }
  }

  if (!bestCategory) return null

  return {
    category: bestCategory,
    confidence: bestScore,
    matchedPatterns: bestPatterns,
  }
}

export function suggestProject(
  context: SuggestionContext,
  projects: Array<{ id: string; name: string }>
): ProjectSuggestion | null {
  const { taskContent } = context
  if (!taskContent || taskContent.trim().length === 0 || projects.length === 0) return null

  const normalizedContent = taskContent.toLowerCase()

  // Build keyword index for projects
  const projectKeywords: ProjectKeywords[] = projects.map((p) => ({
    projectId: p.id,
    projectName: p.name,
    normalizedName: p.name.toLowerCase(),
    keywords: extractProjectKeywords(p.name),
  }))

  let bestMatch: { project: ProjectKeywords; matchedKeywords: string[]; score: number } | null = null

  for (const project of projectKeywords) {
    const matchedKeywords: string[] = []
    let score = 0

    // Direct name match (highest priority)
    if (normalizedContent.includes(project.normalizedName)) {
      matchedKeywords.push(project.projectName)
      score += 0.9
    }

    // Keyword matches
    for (const keyword of project.keywords) {
      if (normalizedContent.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword)
        score += 0.3
      }
    }

    // Word boundary matches for project name words
    const projectWords = project.normalizedName.split(/\s+/)
    for (const word of projectWords) {
      if (word.length >= 3) {
        const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
        if (wordRegex.test(taskContent) && !matchedKeywords.includes(word)) {
          matchedKeywords.push(word)
          score += 0.4
        }
      }
    }

    if (matchedKeywords.length > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { project, matchedKeywords, score }
    }
  }

  if (!bestMatch) return null

  const confidence = Math.min(0.95, bestMatch.score)

  return {
    id: `project-suggestion-${Date.now()}`,
    type: 'project',
    value: {
      projectId: bestMatch.project.projectId,
      projectName: bestMatch.project.projectName,
      matchedKeywords: bestMatch.matchedKeywords,
    },
    confidence,
    reasoning: `Task mentions "${bestMatch.matchedKeywords.join(', ')}" which matches project "${bestMatch.project.projectName}"`,
    source: 'local',
    createdAt: new Date(),
  }
}

export function suggestLabels(
  context: SuggestionContext,
  existingLabels: string[] = []
): LabelsSuggestion | null {
  const { taskContent } = context
  if (!taskContent || taskContent.trim().length === 0) return null

  const suggestedLabels = new Set<string>()
  const newLabelsDetected: string[] = []
  let totalConfidence = 0
  let matchCount = 0

  // Pattern-based label suggestions
  for (const { pattern, labels, confidence } of LABEL_PATTERNS) {
    if (pattern.test(taskContent)) {
      for (const label of labels) {
        if (!suggestedLabels.has(label)) {
          suggestedLabels.add(label)
          totalConfidence += confidence
          matchCount++

          // Check if this would be a new label
          if (!existingLabels.some((l) => l.toLowerCase() === label.toLowerCase())) {
            newLabelsDetected.push(label)
          }
        }
      }
    }
  }

  // Category-based label suggestions
  const category = suggestCategory(taskContent)
  if (category && category.confidence >= 0.75) {
    const categoryLabel = category.category
    if (!suggestedLabels.has(categoryLabel)) {
      suggestedLabels.add(categoryLabel)
      totalConfidence += category.confidence
      matchCount++

      if (!existingLabels.some((l) => l.toLowerCase() === categoryLabel.toLowerCase())) {
        newLabelsDetected.push(categoryLabel)
      }
    }
  }

  // Extract hashtag-style labels from content (#label)
  const hashtagMatches = taskContent.match(/#(\w+)/g)
  if (hashtagMatches) {
    for (const tag of hashtagMatches) {
      const label = tag.slice(1) // Remove #
      if (!suggestedLabels.has(label)) {
        suggestedLabels.add(label)
        totalConfidence += 0.95 // Explicit hashtags have high confidence
        matchCount++

        if (!existingLabels.some((l) => l.toLowerCase() === label.toLowerCase())) {
          newLabelsDetected.push(label)
        }
      }
    }
  }

  if (suggestedLabels.size === 0) return null

  const avgConfidence = totalConfidence / matchCount

  return {
    id: `labels-suggestion-${Date.now()}`,
    type: 'labels',
    value: {
      labels: Array.from(suggestedLabels),
      newLabelsDetected,
    },
    confidence: avgConfidence,
    reasoning: generateLabelsReasoning(Array.from(suggestedLabels), newLabelsDetected),
    source: 'local',
    createdAt: new Date(),
  }
}

export function suggestTaskGrouping(
  task: Pick<Task, 'content' | 'description'>,
  context: {
    projects: Array<{ id: string; name: string }>
    existingLabels: string[]
  }
): TaskGroupingSuggestion {
  const taskContent = [task.content, task.description].filter(Boolean).join(' ')
  const suggestionContext: SuggestionContext = { taskContent }

  return {
    category: suggestCategory(taskContent),
    project: suggestProject(suggestionContext, context.projects),
    labels: suggestLabels(suggestionContext, context.existingLabels),
  }
}

export function groupTasksByCategory(
  tasks: Task[]
): Map<TaskCategory | 'uncategorized', Task[]> {
  const groups = new Map<TaskCategory | 'uncategorized', Task[]>()

  for (const task of tasks) {
    const taskContent = [task.content, task.description].filter(Boolean).join(' ')
    const categorySuggestion = suggestCategory(taskContent)

    const category: TaskCategory | 'uncategorized' =
      categorySuggestion && categorySuggestion.confidence >= 0.7
        ? categorySuggestion.category
        : 'uncategorized'

    const existing = groups.get(category) ?? []
    existing.push(task)
    groups.set(category, existing)
  }

  return groups
}

export function findSimilarTasks(
  targetTask: Pick<Task, 'content' | 'labels' | 'projectId'>,
  allTasks: Task[],
  limit = 5
): Array<{ task: Task; similarity: number }> {
  const targetWords = extractWords(targetTask.content)
  const targetLabelsSet = new Set(targetTask.labels ?? [])

  const similarities: Array<{ task: Task; similarity: number }> = []

  for (const task of allTasks) {
    // Skip self
    if (task.content === targetTask.content) continue

    let similarity = 0

    // Word overlap similarity (Jaccard)
    const taskWords = extractWords(task.content)
    const intersection = targetWords.filter((w) => taskWords.includes(w))
    const union = new Set([...targetWords, ...taskWords])
    const wordSimilarity = intersection.length / union.size
    similarity += wordSimilarity * 0.5

    // Label overlap
    const taskLabelsSet = new Set(task.labels ?? [])
    const labelIntersection = [...targetLabelsSet].filter((l) => taskLabelsSet.has(l))
    if (targetLabelsSet.size > 0 || taskLabelsSet.size > 0) {
      const labelSimilarity =
        labelIntersection.length / Math.max(targetLabelsSet.size, taskLabelsSet.size)
      similarity += labelSimilarity * 0.3
    }

    // Same project bonus
    if (targetTask.projectId && task.projectId === targetTask.projectId) {
      similarity += 0.2
    }

    if (similarity > 0.1) {
      similarities.push({ task, similarity })
    }
  }

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

// Helper functions

function extractProjectKeywords(projectName: string): string[] {
  const keywords: string[] = []
  const words = projectName.toLowerCase().split(/[\s\-_]+/)

  for (const word of words) {
    if (word.length >= 2) {
      keywords.push(word)
    }
  }

  // Add common variations
  const normalized = projectName.toLowerCase().replace(/[\s\-_]+/g, '')
  if (normalized.length >= 3) {
    keywords.push(normalized)
  }

  return keywords
}

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function generateLabelsReasoning(labels: string[], newLabels: string[]): string {
  const parts: string[] = [`Suggested labels: ${labels.join(', ')}`]

  if (newLabels.length > 0) {
    parts.push(`New labels detected: ${newLabels.join(', ')}`)
  }

  return parts.join('. ')
}

export const CATEGORY_DISPLAY_INFO: Record<
  TaskCategory,
  { label: string; icon: string; color: string }
> = {
  work: { label: 'Work', icon: 'Briefcase', color: 'blue' },
  personal: { label: 'Personal', icon: 'User', color: 'purple' },
  health: { label: 'Health', icon: 'Heart', color: 'red' },
  finance: { label: 'Finance', icon: 'DollarSign', color: 'green' },
  home: { label: 'Home', icon: 'Home', color: 'orange' },
  learning: { label: 'Learning', icon: 'GraduationCap', color: 'indigo' },
  social: { label: 'Social', icon: 'Users', color: 'pink' },
  errands: { label: 'Errands', icon: 'ShoppingCart', color: 'yellow' },
  creative: { label: 'Creative', icon: 'Palette', color: 'cyan' },
  admin: { label: 'Admin', icon: 'FileText', color: 'gray' },
}
