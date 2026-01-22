# AI Task Suggestion System Architecture

**Status**: ✅ Complete (T7.4.1)  
**Created**: January 2026  
**Related Tasks**: T7.4.2–T7.4.7

---

## Overview

The AI Task Suggestion System provides intelligent assistance for task creation and management. The architecture supports both **local-first processing** (privacy-preserving, offline-capable) and optional **cloud API integration** for advanced features.

---

## Architecture Principles

1. **Privacy First**: Local processing by default; cloud APIs are opt-in
2. **Offline Capable**: Core features work without network connectivity
3. **Progressive Enhancement**: Basic features local, advanced via API
4. **Low Latency**: Suggestions appear within 100ms for local operations
5. **Feedback Loop**: User corrections improve future suggestions

---

## System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI Suggestion System                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
│  │  Input Layer    │───▶│  Processing Core │───▶│  Output Layer     │  │
│  │                 │    │                  │    │                   │  │
│  │ • Task text     │    │ • Pattern Engine │    │ • Suggestions     │  │
│  │ • User history  │    │ • ML Models      │    │ • Confidence      │  │
│  │ • Context       │    │ • API Gateway    │    │ • Alternatives    │  │
│  └─────────────────┘    └──────────────────┘    └───────────────────┘  │
│           ▲                      │                        │             │
│           │                      ▼                        │             │
│  ┌────────┴────────────────────────────────────────────────┐           │
│  │                    Learning Layer                        │           │
│  │  • User patterns  • Feedback tracking  • Model updates   │           │
│  └──────────────────────────────────────────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Interfaces

### Suggestion Types

```typescript
// src/services/ai/types.ts

export type SuggestionType = 
  | 'due_date'      // Suggested due date
  | 'priority'      // Suggested priority level
  | 'project'       // Suggested project assignment
  | 'labels'        // Suggested labels
  | 'duration'      // Estimated task duration
  | 'recurrence'    // Suggested recurrence pattern
  | 'breakdown'     // Subtask suggestions
  | 'similar'       // Similar existing tasks

export interface TaskSuggestion {
  id: string
  type: SuggestionType
  value: unknown            // Type-specific value
  confidence: number        // 0-1 confidence score
  reasoning: string         // Human-readable explanation
  source: 'local' | 'api'   // Where suggestion originated
  createdAt: Date
}

export interface DueDateSuggestion extends TaskSuggestion {
  type: 'due_date'
  value: {
    date: Date
    isDeadline: boolean     // Hard deadline vs soft target
    urgencyScore: number    // 0-1 how urgent
  }
}

export interface PrioritySuggestion extends TaskSuggestion {
  type: 'priority'
  value: {
    priority: Priority
    factors: string[]       // Why this priority
  }
}

export interface ProjectSuggestion extends TaskSuggestion {
  type: 'project'
  value: {
    projectId: string
    projectName: string
    matchedKeywords: string[]
  }
}

export interface LabelsSuggestion extends TaskSuggestion {
  type: 'labels'
  value: {
    labels: string[]
    newLabelsDetected: string[]
  }
}

export interface DurationSuggestion extends TaskSuggestion {
  type: 'duration'
  value: {
    minutes: number
    basedOn: 'similar_tasks' | 'complexity' | 'user_history'
  }
}

export interface BreakdownSuggestion extends TaskSuggestion {
  type: 'breakdown'
  value: {
    subtasks: Array<{
      content: string
      estimatedDuration?: number
      order: number
    }>
  }
}
```

### AI Service Interface

```typescript
// src/services/ai/aiService.ts

export interface AIServiceConfig {
  enableLocalProcessing: boolean
  enableCloudAPI: boolean
  apiProvider?: 'openai' | 'anthropic' | 'local'
  apiKey?: string
  maxLatencyMs: number
  confidenceThreshold: number
}

export interface SuggestionContext {
  task: Partial<Task>
  userHistory: UserTaskHistory
  projects: Project[]
  labels: Label[]
  existingTasks: Task[]
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  dayOfWeek: number
}

export interface AIService {
  // Core suggestion methods
  suggestDueDate(context: SuggestionContext): Promise<DueDateSuggestion | null>
  suggestPriority(context: SuggestionContext): Promise<PrioritySuggestion | null>
  suggestProject(context: SuggestionContext): Promise<ProjectSuggestion | null>
  suggestLabels(context: SuggestionContext): Promise<LabelsSuggestion | null>
  suggestDuration(context: SuggestionContext): Promise<DurationSuggestion | null>
  suggestBreakdown(context: SuggestionContext): Promise<BreakdownSuggestion | null>
  
  // Batch suggestions
  getAllSuggestions(context: SuggestionContext): Promise<TaskSuggestion[]>
  
  // Natural language parsing
  parseNaturalLanguage(input: string): Promise<ParsedTaskIntent>
  
  // Feedback for learning
  recordFeedback(suggestionId: string, accepted: boolean): Promise<void>
  
  // Configuration
  configure(config: Partial<AIServiceConfig>): void
  getConfig(): AIServiceConfig
}
```

---

## Processing Layers

### 1. Local Pattern Engine

Handles fast, privacy-preserving suggestions using rule-based patterns and simple ML.

```typescript
// src/services/ai/local/patternEngine.ts

interface PatternRule {
  id: string
  pattern: RegExp | ((text: string) => boolean)
  extract: (text: string, match: RegExpMatchArray | null) => unknown
  suggestionType: SuggestionType
  confidence: number
}

export class PatternEngine {
  private rules: PatternRule[] = []
  private userPatterns: UserPatternStore
  
  // Due date patterns
  private dateRules: PatternRule[] = [
    {
      id: 'explicit-deadline',
      pattern: /\b(deadline|due|by)\s+(.+)/i,
      extract: (text, match) => parseDate(match?.[2]),
      suggestionType: 'due_date',
      confidence: 0.95
    },
    {
      id: 'urgency-words',
      pattern: /\b(urgent|asap|immediately|today)\b/i,
      extract: () => new Date(),
      suggestionType: 'due_date',
      confidence: 0.85
    },
    // ... more patterns
  ]
  
  // Priority inference
  private priorityRules: PatternRule[] = [
    {
      id: 'explicit-priority',
      pattern: /\b(p[1-4]|priority\s*[1-4]|!!!|!!|!)\b/i,
      extract: (text, match) => parsePriority(match?.[0]),
      suggestionType: 'priority',
      confidence: 0.98
    },
    {
      id: 'urgency-keywords',
      pattern: /\b(critical|urgent|emergency|important)\b/i,
      extract: () => 'p1',
      suggestionType: 'priority', 
      confidence: 0.8
    },
    // ... more patterns
  ]
  
  async process(context: SuggestionContext): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = []
    const text = context.task.content || ''
    
    // Apply all rules
    for (const rule of [...this.dateRules, ...this.priorityRules]) {
      const match = typeof rule.pattern === 'function' 
        ? (rule.pattern(text) ? [text] : null)
        : text.match(rule.pattern)
        
      if (match) {
        suggestions.push({
          id: `local-${rule.id}-${Date.now()}`,
          type: rule.suggestionType,
          value: rule.extract(text, match as RegExpMatchArray),
          confidence: rule.confidence,
          reasoning: `Matched pattern: ${rule.id}`,
          source: 'local',
          createdAt: new Date()
        })
      }
    }
    
    // Apply user-specific learned patterns
    const userSuggestions = await this.userPatterns.getSuggestions(context)
    suggestions.push(...userSuggestions)
    
    return suggestions
  }
}
```

### 2. User Pattern Learning

Learns from user behavior to improve suggestions over time.

```typescript
// src/services/ai/local/userPatternStore.ts

interface UserPattern {
  id: string
  type: SuggestionType
  condition: PatternCondition
  value: unknown
  frequency: number
  lastUsed: Date
  successRate: number
}

interface PatternCondition {
  keywords?: string[]
  projectId?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  dayOfWeek?: number[]
  contentLength?: 'short' | 'medium' | 'long'
}

export class UserPatternStore {
  private patterns: Map<string, UserPattern> = new Map()
  
  async learn(task: Task, context: SuggestionContext): Promise<void> {
    // Learn project associations
    if (task.projectId) {
      await this.learnProjectPattern(task, context)
    }
    
    // Learn priority patterns
    if (task.priority) {
      await this.learnPriorityPattern(task, context)
    }
    
    // Learn timing patterns
    if (task.dueDate) {
      await this.learnTimingPattern(task, context)
    }
    
    // Learn label associations
    if (task.labels.length > 0) {
      await this.learnLabelPattern(task, context)
    }
  }
  
  async getSuggestions(context: SuggestionContext): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = []
    
    for (const pattern of this.patterns.values()) {
      if (this.matchesCondition(context, pattern.condition)) {
        const confidence = this.calculateConfidence(pattern)
        if (confidence > 0.5) {
          suggestions.push({
            id: `user-${pattern.id}`,
            type: pattern.type,
            value: pattern.value,
            confidence,
            reasoning: `Based on your past behavior (${pattern.frequency} times)`,
            source: 'local',
            createdAt: new Date()
          })
        }
      }
    }
    
    return suggestions
  }
  
  private calculateConfidence(pattern: UserPattern): number {
    // Confidence based on frequency, recency, and success rate
    const frequencyScore = Math.min(pattern.frequency / 10, 1)
    const recencyScore = this.getRecencyScore(pattern.lastUsed)
    const successScore = pattern.successRate
    
    return (frequencyScore * 0.3) + (recencyScore * 0.2) + (successScore * 0.5)
  }
}
```

### 3. Cloud API Gateway (Optional)

Handles communication with external AI APIs for advanced features.

```typescript
// src/services/ai/cloud/apiGateway.ts

interface APIRequest {
  type: 'completion' | 'embedding' | 'classification'
  prompt: string
  maxTokens?: number
  temperature?: number
}

interface APIResponse {
  content: string
  usage: { promptTokens: number; completionTokens: number }
  latencyMs: number
}

export class CloudAPIGateway {
  private config: AIServiceConfig
  private cache: Map<string, { response: APIResponse; expiry: Date }> = new Map()
  
  async request(req: APIRequest): Promise<APIResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(req)
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiry > new Date()) {
      return cached.response
    }
    
    // Make API request
    const response = await this.callAPI(req)
    
    // Cache response
    this.cache.set(cacheKey, {
      response,
      expiry: new Date(Date.now() + 5 * 60 * 1000) // 5 min cache
    })
    
    return response
  }
  
  private async callAPI(req: APIRequest): Promise<APIResponse> {
    switch (this.config.apiProvider) {
      case 'openai':
        return this.callOpenAI(req)
      case 'anthropic':
        return this.callAnthropic(req)
      case 'local':
        return this.callLocalModel(req)
      default:
        throw new Error('No API provider configured')
    }
  }
  
  private async callOpenAI(req: APIRequest): Promise<APIResponse> {
    const start = performance.now()
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: req.prompt }],
        max_tokens: req.maxTokens || 150,
        temperature: req.temperature || 0.3
      })
    })
    
    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      },
      latencyMs: performance.now() - start
    }
  }
}
```

---

## Suggestion Algorithms

### Due Date Suggestion

```typescript
// src/services/ai/algorithms/dueDateSuggestion.ts

export async function suggestDueDate(
  context: SuggestionContext
): Promise<DueDateSuggestion | null> {
  const { task, userHistory, existingTasks } = context
  const content = task.content?.toLowerCase() || ''
  
  // 1. Check explicit date mentions
  const explicitDate = extractExplicitDate(content)
  if (explicitDate) {
    return {
      id: generateId(),
      type: 'due_date',
      value: { date: explicitDate, isDeadline: true, urgencyScore: 0.9 },
      confidence: 0.95,
      reasoning: 'Explicit date found in task text',
      source: 'local',
      createdAt: new Date()
    }
  }
  
  // 2. Check urgency keywords
  const urgency = detectUrgency(content)
  if (urgency > 0.7) {
    return {
      id: generateId(),
      type: 'due_date',
      value: { 
        date: new Date(), // Today
        isDeadline: false, 
        urgencyScore: urgency 
      },
      confidence: 0.8,
      reasoning: 'Urgency keywords detected',
      source: 'local',
      createdAt: new Date()
    }
  }
  
  // 3. Check similar task patterns
  const similarTasks = findSimilarTasks(content, existingTasks)
  if (similarTasks.length > 0) {
    const avgDaysToComplete = calculateAverageDaysToComplete(similarTasks)
    const suggestedDate = addDays(new Date(), avgDaysToComplete)
    return {
      id: generateId(),
      type: 'due_date',
      value: { date: suggestedDate, isDeadline: false, urgencyScore: 0.5 },
      confidence: 0.6,
      reasoning: `Based on ${similarTasks.length} similar tasks`,
      source: 'local',
      createdAt: new Date()
    }
  }
  
  // 4. Check user's typical task duration for this project
  if (task.projectId && userHistory.projectPatterns[task.projectId]) {
    const pattern = userHistory.projectPatterns[task.projectId]
    const suggestedDate = addDays(new Date(), pattern.avgDaysToComplete)
    return {
      id: generateId(),
      type: 'due_date',
      value: { date: suggestedDate, isDeadline: false, urgencyScore: 0.4 },
      confidence: 0.5,
      reasoning: `Typical completion time for this project`,
      source: 'local',
      createdAt: new Date()
    }
  }
  
  return null
}
```

### Priority Suggestion

```typescript
// src/services/ai/algorithms/prioritySuggestion.ts

export async function suggestPriority(
  context: SuggestionContext
): Promise<PrioritySuggestion | null> {
  const { task, userHistory, existingTasks } = context
  const content = task.content?.toLowerCase() || ''
  const factors: string[] = []
  let priority: Priority = null
  let confidence = 0
  
  // 1. Check explicit priority markers
  const explicitPriority = extractExplicitPriority(content)
  if (explicitPriority) {
    return {
      id: generateId(),
      type: 'priority',
      value: { priority: explicitPriority, factors: ['Explicit priority marker'] },
      confidence: 0.98,
      reasoning: 'Priority explicitly specified',
      source: 'local',
      createdAt: new Date()
    }
  }
  
  // 2. Keyword-based priority detection
  const keywordPriority = detectKeywordPriority(content)
  if (keywordPriority.priority) {
    priority = keywordPriority.priority
    factors.push(...keywordPriority.factors)
    confidence = Math.max(confidence, keywordPriority.confidence)
  }
  
  // 3. Deadline proximity
  if (task.dueDate) {
    const daysUntilDue = differenceInDays(task.dueDate, new Date())
    if (daysUntilDue <= 1) {
      priority = priority || 'p1'
      factors.push('Due within 24 hours')
      confidence = Math.max(confidence, 0.85)
    } else if (daysUntilDue <= 3) {
      priority = priority || 'p2'
      factors.push('Due within 3 days')
      confidence = Math.max(confidence, 0.7)
    }
  }
  
  // 4. Project default priority
  if (task.projectId && !priority) {
    const projectPattern = userHistory.projectPatterns[task.projectId]
    if (projectPattern?.defaultPriority) {
      priority = projectPattern.defaultPriority
      factors.push(`Default priority for project`)
      confidence = Math.max(confidence, 0.5)
    }
  }
  
  if (priority) {
    return {
      id: generateId(),
      type: 'priority',
      value: { priority, factors },
      confidence,
      reasoning: factors.join(', '),
      source: 'local',
      createdAt: new Date()
    }
  }
  
  return null
}
```

---

## Data Storage

### IndexedDB Schema

```typescript
// src/db/aiSchema.ts

export interface AIStore {
  // User patterns learned from behavior
  userPatterns: {
    id: string
    userId: string
    type: SuggestionType
    condition: PatternCondition
    value: unknown
    frequency: number
    successRate: number
    createdAt: Date
    updatedAt: Date
  }
  
  // Feedback on suggestions
  suggestionFeedback: {
    id: string
    suggestionId: string
    userId: string
    type: SuggestionType
    accepted: boolean
    originalValue: unknown
    finalValue?: unknown
    createdAt: Date
  }
  
  // Cached API responses
  apiCache: {
    id: string
    requestHash: string
    response: string
    expiresAt: Date
    createdAt: Date
  }
}

// Add to existing Dexie database
db.version(2).stores({
  ...existingStores,
  userPatterns: '++id, userId, type, [userId+type]',
  suggestionFeedback: '++id, userId, type, createdAt',
  apiCache: 'id, requestHash, expiresAt'
})
```

---

## Integration Points

### React Hook

```typescript
// src/hooks/useAISuggestions.ts

interface UseAISuggestionsOptions {
  debounceMs?: number
  enableCloud?: boolean
  types?: SuggestionType[]
}

export function useAISuggestions(
  taskContent: string,
  options: UseAISuggestionsOptions = {}
) {
  const { debounceMs = 300, enableCloud = false, types } = options
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const aiService = useAIService()
  
  const debouncedContent = useDebounce(taskContent, debounceMs)
  
  useEffect(() => {
    if (!debouncedContent.trim()) {
      setSuggestions([])
      return
    }
    
    let cancelled = false
    
    async function fetchSuggestions() {
      setIsLoading(true)
      try {
        const context = await buildContext(debouncedContent)
        const allSuggestions = await aiService.getAllSuggestions(context)
        
        if (!cancelled) {
          const filtered = types 
            ? allSuggestions.filter(s => types.includes(s.type))
            : allSuggestions
          setSuggestions(filtered)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    
    fetchSuggestions()
    return () => { cancelled = true }
  }, [debouncedContent, types])
  
  const acceptSuggestion = useCallback(async (suggestion: TaskSuggestion) => {
    await aiService.recordFeedback(suggestion.id, true)
  }, [aiService])
  
  const rejectSuggestion = useCallback(async (suggestion: TaskSuggestion) => {
    await aiService.recordFeedback(suggestion.id, false)
  }, [aiService])
  
  return { suggestions, isLoading, acceptSuggestion, rejectSuggestion }
}
```

### Zustand Store Extension

```typescript
// src/store/aiStore.ts (additions)

interface AIStoreState {
  // Existing state...
  
  // New suggestion state
  activeSuggestions: TaskSuggestion[]
  suggestionSettings: AIServiceConfig
  
  // Actions
  updateSuggestionSettings: (settings: Partial<AIServiceConfig>) => void
  clearActiveSuggestions: () => void
}
```

---

## Performance Considerations

| Operation | Target Latency | Strategy |
|-----------|---------------|----------|
| Local pattern matching | < 10ms | Compiled regex, early exit |
| User pattern lookup | < 20ms | IndexedDB indexed queries |
| Full local suggestion | < 100ms | Parallel processing |
| Cloud API (cached) | < 50ms | In-memory cache |
| Cloud API (fresh) | < 2000ms | Timeout + fallback |

### Optimization Strategies

1. **Lazy Loading**: AI service loads only when first suggestion requested
2. **Web Workers**: Heavy pattern matching runs off main thread
3. **Incremental Processing**: Suggestions computed as user types
4. **Result Caching**: Identical inputs return cached results
5. **Early Termination**: Stop if high-confidence suggestion found

---

## Security & Privacy

1. **Local by Default**: All core suggestions work without network
2. **Opt-in Cloud**: Users explicitly enable cloud features
3. **No PII in Logs**: Task content never logged server-side
4. **API Key Storage**: Encrypted in IndexedDB, never synced
5. **Data Retention**: Suggestion feedback stored locally only

---

## Future Enhancements

### Phase 1 (Current)
- [x] Architecture design
- [ ] Local pattern engine (T7.4.2)
- [ ] User pattern learning (T7.4.3)

### Phase 2
- [ ] Natural language improvements (T7.4.5)
- [ ] Smart scheduling (T7.4.6)

### Phase 3
- [ ] Cloud API integration
- [ ] Advanced ML models
- [ ] Productivity insights (T7.4.7)

---

## Testing Strategy

```typescript
// src/services/ai/__tests__/aiService.test.ts

describe('AI Suggestion Service', () => {
  describe('suggestDueDate', () => {
    it('detects explicit date in "finish report by Friday"', async () => {
      const context = buildTestContext({ content: 'finish report by Friday' })
      const suggestion = await suggestDueDate(context)
      
      expect(suggestion).not.toBeNull()
      expect(suggestion?.confidence).toBeGreaterThan(0.9)
      expect(isFriday(suggestion?.value.date)).toBe(true)
    })
    
    it('suggests today for "urgent" tasks', async () => {
      const context = buildTestContext({ content: 'urgent: call client' })
      const suggestion = await suggestDueDate(context)
      
      expect(suggestion?.value.date).toEqual(startOfDay(new Date()))
      expect(suggestion?.value.urgencyScore).toBeGreaterThan(0.7)
    })
  })
  
  describe('suggestPriority', () => {
    it('detects p1 from "!!!" marker', async () => {
      const context = buildTestContext({ content: 'fix production bug !!!' })
      const suggestion = await suggestPriority(context)
      
      expect(suggestion?.value.priority).toBe('p1')
      expect(suggestion?.confidence).toBeGreaterThan(0.95)
    })
  })
})
```

---

## Migration from Existing Code

The current `aiStore.ts` provides basic functionality. Migration path:

1. **Keep existing API**: `useAIStore` continues working
2. **Add new service**: `AIService` interface for new features
3. **Gradual adoption**: Components opt-in to new suggestions
4. **Deprecation**: Old methods deprecated after migration

```typescript
// Compatibility layer
export function useAIStore() {
  const newService = useAIService()
  
  return {
    // Legacy methods call new service
    extractDueDate: (text) => newService.suggestDueDate({ task: { content: text } }),
    extractPriority: (text) => newService.suggestPriority({ task: { content: text } }),
    // ... etc
  }
}
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [INDEXEDDB_OPTIMIZATION.md](./INDEXEDDB_OPTIMIZATION.md) - Database patterns
- [PHASE_7_PRODUCTION_POLISH.md](./PHASE_7_PRODUCTION_POLISH.md) - Phase 7 roadmap
