import type { Task } from '@/types'

/**
 * Advanced filter syntax parser
 * Supports: field:value, operators (AND, OR, NOT), comparisons
 * Examples:
 *   - priority:p1
 *   - status:active
 *   - created:today
 *   - due:overdue
 *   - label:urgent
 *   - project:engineering
 *   - search:keyword
 *   - priority:p1 AND status:active
 *   - (priority:p1 OR priority:p2) AND status:active
 */

type FilterOperator = 'AND' | 'OR' | 'NOT'
type ComparisonOperator = ':' | '=' | '<' | '>' | '!='

interface ParsedFilter {
  type: 'condition' | 'group'
  operator?: FilterOperator
  children?: ParsedFilter[]
  condition?: {
    field: string
    operator: ComparisonOperator
    value: string
  }
}

/**
 * Tokenize filter query
 */
function tokenize(query: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < query.length; i++) {
    const char = query[i]

    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (!inQuotes && /[\s():]/.test(char)) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      if (!/\s/.test(char)) {
        tokens.push(char)
      }
    } else {
      current += char
    }
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

/**
 * Parse filter query into AST
 */
function parseQuery(tokens: string[]): ParsedFilter | null {
  let pos = 0

  const parseExpression = (): ParsedFilter | null => {
    return parseOrExpression()
  }

  const parseOrExpression = (): ParsedFilter | null => {
    let left = parseAndExpression()
    if (!left) return null

    while (pos < tokens.length && tokens[pos].toUpperCase() === 'OR') {
      pos++ // consume OR
      const right = parseAndExpression()
      if (!right) return null
      left = {
        type: 'group',
        operator: 'OR',
        children: [left, right],
      }
    }

    return left
  }

  const parseAndExpression = (): ParsedFilter | null => {
    let left = parsePrimary()
    if (!left) return null

    while (pos < tokens.length && tokens[pos].toUpperCase() === 'AND') {
      pos++ // consume AND
      const right = parsePrimary()
      if (!right) return null
      left = {
        type: 'group',
        operator: 'AND',
        children: [left, right],
      }
    }

    return left
  }

  const parsePrimary = (): ParsedFilter | null => {
    // Handle NOT operator
    if (pos < tokens.length && tokens[pos].toUpperCase() === 'NOT') {
      pos++ // consume NOT
      const operand = parsePrimary()
      if (!operand) return null
      return {
        type: 'group',
        operator: 'NOT',
        children: [operand],
      }
    }

    // Handle parentheses
    if (pos < tokens.length && tokens[pos] === '(') {
      pos++ // consume (
      const expr = parseExpression()
      if (pos < tokens.length && tokens[pos] === ')') {
        pos++ // consume )
      }
      return expr
    }

    // Handle condition (field:value)
    if (pos + 2 < tokens.length && tokens[pos + 1] === ':') {
      const field = tokens[pos]
      const value = tokens[pos + 2]
      pos += 3
      return {
        type: 'condition',
        condition: {
          field: field.toLowerCase(),
          operator: ':',
          value: value.replace(/^["']|["']$/g, ''), // Remove quotes if present
        },
      }
    }

    return null
  }

  const ast = parseExpression()
  return ast
}

/**
 * Evaluate a condition against a task
 */
function evaluateCondition(task: Task, condition: ParsedFilter['condition']): boolean {
  if (!condition) return false

  const { field, value } = condition

  switch (field) {
    case 'priority':
      return task.priority === value

    case 'status':
    case 'state':
      return (
        (value.toLowerCase() === 'active' && !task.completed) ||
        (value.toLowerCase() === 'completed' && task.completed) ||
        (value.toLowerCase() === 'done' && task.completed)
      )

    case 'label':
      return task.labels.some((labelId) => labelId.includes(value))

    case 'project':
      return task.projectId?.includes(value) || false

    case 'assigned':
    case 'assignee':
      return evaluateAssignee(task, value)

    case 'due':
    case 'duedate':
      return evaluateDueDate(task, value)

    case 'created':
    case 'createddate':
      return evaluateCreatedDate(task, value)

    case 'search':
    case 'text':
      return (
        task.content.toLowerCase().includes(value.toLowerCase()) ||
        (task.description?.toLowerCase().includes(value.toLowerCase()) ?? false)
      )

    default:
      return false
  }
}

/**
 * Evaluate assignee condition
 */
function evaluateAssignee(task: Task, value: string): boolean {
  const v = value.toLowerCase()

  // Check for "me" - currently always false in client context
  // Will be resolved when task has createdBy user context
  if (v === 'me') {
    return false // TODO: Compare with current user from context
  }

  // Check for "unassigned"
  if (v === 'unassigned') {
    return !task.assigneeIds || task.assigneeIds.length === 0
  }

  // Check if specific userId matches any assignee
  return task.assigneeIds?.some((id) => id.includes(v)) || false
}

/**
 * Evaluate due date condition
 */
function evaluateDueDate(task: Task, value: string): boolean {
  if (!task.dueDate) return false

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const taskDate = new Date(task.dueDate)
  const taskDateNormalized = new Date(
    taskDate.getFullYear(),
    taskDate.getMonth(),
    taskDate.getDate()
  )

  const v = value.toLowerCase()

  if (v === 'today') {
    return taskDateNormalized.getTime() === today.getTime()
  }

  if (v === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return taskDateNormalized.getTime() === tomorrow.getTime()
  }

  if (v === 'overdue') {
    return taskDateNormalized < today
  }

  if (v === 'upcoming') {
    return taskDateNormalized > today
  }

  if (v === 'thisweek') {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return taskDateNormalized >= weekStart && taskDateNormalized < weekEnd
  }

  return false
}

/**
 * Evaluate created date condition
 */
function evaluateCreatedDate(task: Task, value: string): boolean {
  const createdDate = new Date(task.createdAt)
  const createdDateNormalized = new Date(
    createdDate.getFullYear(),
    createdDate.getMonth(),
    createdDate.getDate()
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const v = value.toLowerCase()

  if (v === 'today') {
    return createdDateNormalized.getTime() === today.getTime()
  }

  return false
}

/**
 * Evaluate AST against a task
 */
function evaluateAST(ast: ParsedFilter | null, task: Task): boolean {
  if (!ast) return false

  if (ast.type === 'condition') {
    return evaluateCondition(task, ast.condition)
  }

  if (ast.type === 'group' && ast.operator === 'AND') {
    return ast.children?.every((child) => evaluateAST(child, task)) ?? false
  }

  if (ast.type === 'group' && ast.operator === 'OR') {
    return ast.children?.some((child) => evaluateAST(child, task)) ?? false
  }

  if (ast.type === 'group' && ast.operator === 'NOT') {
    return !evaluateAST(ast.children?.[0] ?? null, task)
  }

  return false
}

/**
 * Parse and evaluate a filter query
 */
export function parseAndEvaluateFilter(query: string, task: Task): boolean {
  if (!query.trim()) return true

  try {
    const tokens = tokenize(query)
    const ast = parseQuery(tokens)
    return evaluateAST(ast, task)
  } catch (error) {
    console.error('Filter parse error:', error)
    return false
  }
}

/**
 * Apply filter to a list of tasks
 */
export function applyAdvancedFilter(query: string, tasks: Task[]): Task[] {
  if (!query.trim()) return tasks

  return tasks.filter((task) => parseAndEvaluateFilter(query, task))
}

/**
 * Get suggested filter syntax
 */
export function getFilterSuggestions(): string[] {
  return [
    'priority:p1',
    'priority:p2',
    'status:active',
    'status:completed',
    'due:today',
    'due:overdue',
    'due:upcoming',
    'created:today',
    'search:keyword',
    'assigned:me',
    'assigned:unassigned',
    'priority:p1 AND status:active',
    '(priority:p1 OR priority:p2) AND status:active',
    'NOT status:completed',
    'label:urgent',
    'project:engineering',
    'assigned:unassigned AND priority:p1',
  ]
}

/**
 * Format filter query for display
 */
export function formatFilterQuery(query: string): string {
  const keywords = ['AND', 'OR', 'NOT']
  let formatted = query

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
    formatted = formatted.replace(regex, `<strong>${keyword}</strong>`)
  }

  return formatted
}
