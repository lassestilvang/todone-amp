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
type ComparisonOperator = ':' | '=' | '<' | '>' | '!=' | '<=' | '>=' | 'between'

interface ParsedFilter {
  type: 'condition' | 'group'
  operator?: FilterOperator
  children?: ParsedFilter[]
  condition?: {
    field: string
    operator: ComparisonOperator
    value: string
    value2?: string // For 'between' operator
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
    const next = query[i + 1]

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
    } else if (!inQuotes && (char === '<' || char === '>' || char === '!')) {
      // Handle comparison operators: <=, >=, !=, <, >
      if (current) {
        tokens.push(current)
        current = ''
      }
      if ((char === '<' || char === '>' || char === '!') && next === '=') {
        tokens.push(char + next)
        i++
      } else {
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

    // Handle condition (field:value, field<value, field>=value, etc.)
    if (pos + 2 < tokens.length) {
      const field = tokens[pos]
      const op = tokens[pos + 1]

      // Check for comparison operators
      if ([':','=','<','>','!=','<=','>='].includes(op)) {
        // Handle 'between' operator (field:value1,value2)
        const value = tokens[pos + 2].replace(/^["']|["']$/g, '')
        let value2: string | undefined
        const nextPos = pos + 3

        // Check for 'between' syntax: field value1 value2
        if (op === ':' && nextPos < tokens.length && !['AND','OR','NOT','(',')'].includes(tokens[nextPos].toUpperCase())) {
          value2 = tokens[nextPos].replace(/^["']|["']$/g, '')
          pos += 4
          return {
            type: 'condition',
            condition: {
              field: field.toLowerCase(),
              operator: 'between',
              value,
              value2,
            },
          }
        }

        pos += 3
        return {
          type: 'condition',
          condition: {
            field: field.toLowerCase(),
            operator: op as ComparisonOperator,
            value,
          },
        }
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

  const { field, value, value2, operator } = condition

  // Handle numeric comparisons
  if (['<', '>', '<=', '>=', '=', '!='].includes(operator)) {
    return evaluateNumericComparison(task, field, operator as Exclude<ComparisonOperator, ':' | 'between'>, value)
  }

  // Handle range queries (between)
  if (operator === 'between') {
    return evaluateBetweenComparison(task, field, value, value2)
  }

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

    case 'mycreated':
    case 'mycreations':
      return task.createdBy === value

    case 'shared':
    case 'inshared':
      return evaluateShared(task, value)

    case 'due':
    case 'duedate':
      return evaluateDueDate(task, value)

    case 'created':
    case 'createddate':
      return evaluateCreatedDate(task, value)

    case 'comments':
    case 'commentcount':
      return evaluateCommentCount(task, operator, value, value2)

    case 'subtask':
    case 'subtasks':
      return evaluateSubtaskStatus(task, value)

    case 'completed':
    case 'completeddate':
      return evaluateCompletedDate(task, value, value2, operator)

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
 * Evaluate shared project condition
 */
function evaluateShared(_task: Task, value: string): boolean {
  const v = value.toLowerCase()

  // Check for "true" or "yes"
  if (v === 'true' || v === 'yes') {
    return true // All tasks can be in shared projects - filter at store level
  }

  return false
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
 * Evaluate numeric comparison (for comment count, etc.)
 */
function evaluateNumericComparison(
  _task: Task,
  field: string,
  operator: Exclude<ComparisonOperator, ':' | 'between'>,
  value: string
): boolean {
  let taskValue = 0

  if (field === 'comments' || field === 'commentcount') {
    // Note: actual comment count would need to be passed from DB
    // For now, use 0 as placeholder
    taskValue = 0
  }

  const compareValue = parseInt(value, 10)
  if (isNaN(compareValue)) return false

  switch (operator) {
    case '=':
      return taskValue === compareValue
    case '!=':
      return taskValue !== compareValue
    case '<':
      return taskValue < compareValue
    case '>':
      return taskValue > compareValue
    case '<=':
      return taskValue <= compareValue
    case '>=':
      return taskValue >= compareValue
    default:
      return false
  }
}

/**
 * Evaluate between (range) comparison
 */
function evaluateBetweenComparison(
  task: Task,
  field: string,
  value1: string,
  value2?: string
): boolean {
  if (!value2) return false

  if (field === 'due' || field === 'duedate') {
    if (!task.dueDate) return false
    const taskTime = new Date(task.dueDate).getTime()
    const start = new Date(value1).getTime()
    const end = new Date(value2).getTime()
    return taskTime >= start && taskTime <= end
  }

  if (field === 'created' || field === 'createddate') {
    const taskTime = task.createdAt.getTime()
    const start = new Date(value1).getTime()
    const end = new Date(value2).getTime()
    return taskTime >= start && taskTime <= end
  }

  if (field === 'completed' || field === 'completeddate') {
    if (!task.completedAt) return false
    const taskTime = task.completedAt.getTime()
    const start = new Date(value1).getTime()
    const end = new Date(value2).getTime()
    return taskTime >= start && taskTime <= end
  }

  return false
}

/**
 * Evaluate comment count
 */
function evaluateCommentCount(
  _task: Task,
  operator: ComparisonOperator,
  value: string,
  value2?: string
): boolean {
  // Placeholder: actual comment count would be fetched from DB
  // This would be enhanced when comment count is available
  const commentCount = 0
  const compareValue = parseInt(value, 10)

  if (isNaN(compareValue)) return false

  switch (operator) {
    case '=':
    case ':':
      return commentCount === compareValue
    case '!=':
      return commentCount !== compareValue
    case '<':
      return commentCount < compareValue
    case '>':
      return commentCount > compareValue
    case '<=':
      return commentCount <= compareValue
    case '>=':
      return commentCount >= compareValue
    case 'between': {
      if (!value2) return false
      const endValue = parseInt(value2, 10)
      return !isNaN(endValue) && commentCount >= compareValue && commentCount <= endValue
    }
    default:
      return false
  }
}

/**
 * Evaluate subtask status
 */
function evaluateSubtaskStatus(task: Task, value: string): boolean {
  const v = value.toLowerCase()

  // Check for parent task (has parentTaskId)
  if (v === 'parent' || v === 'hassubtasks') {
    // Would need to check if task has child tasks
    // For now, use parentTaskId presence as indicator
    return !task.parentTaskId
  }

  // Check for subtask (is a child task)
  if (v === 'subtask' || v === 'child') {
    return Boolean(task.parentTaskId)
  }

  return false
}

/**
 * Evaluate completed date condition
 */
function evaluateCompletedDate(
  task: Task,
  value: string,
  value2?: string,
  operator?: ComparisonOperator
): boolean {
  if (!task.completedAt) return false

  const completedDate = new Date(task.completedAt)
  const completedDateNormalized = new Date(
    completedDate.getFullYear(),
    completedDate.getMonth(),
    completedDate.getDate()
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const v = value.toLowerCase()

  if (v === 'today') {
    return completedDateNormalized.getTime() === today.getTime()
  }

  if (v === 'yesterday') {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return completedDateNormalized.getTime() === yesterday.getTime()
  }

  if (v === 'thisweek') {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    return completedDateNormalized >= weekStart && completedDateNormalized < weekEnd
  }

  if (v === 'thismonth') {
    return (
      completedDateNormalized.getFullYear() === today.getFullYear() &&
      completedDateNormalized.getMonth() === today.getMonth()
    )
  }

  // Handle date range with operator
  if (operator === 'between' && value2) {
    const start = new Date(value).getTime()
    const end = new Date(value2).getTime()
    return completedDate.getTime() >= start && completedDate.getTime() <= end
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
    'completed:today',
    'completed:thisweek',
    'search:keyword',
    'assigned:me',
    'assigned:unassigned',
    'mycreated:me',
    'shared:true',
    'subtask:child',
    'subtask:parent',
    'comments>0',
    'comments>=5',
    'priority:p1 AND status:active',
    '(priority:p1 OR priority:p2) AND status:active',
    'NOT status:completed',
    'label:urgent',
    'project:engineering',
    'assigned:unassigned AND priority:p1',
    'due:2025-01-01 2025-12-31',
    'completed:2025-01-01 2025-01-31',
  ]
}

/**
 * Get field name suggestions for autocomplete
 */
export function getFieldNameSuggestions(): string[] {
  return [
    'priority',
    'status',
    'due',
    'duedate',
    'created',
    'createddate',
    'completed',
    'completeddate',
    'assigned',
    'assignee',
    'label',
    'project',
    'search',
    'text',
    'shared',
    'subtask',
    'comments',
    'commentcount',
    'mycreated',
    'inshared',
  ]
}

/**
 * Get value suggestions for a field
 */
export function getValueSuggestions(field: string): string[] {
  const f = field.toLowerCase()

  switch (f) {
    case 'priority':
      return ['p1', 'p2', 'p3', 'p4']
    case 'status':
    case 'state':
      return ['active', 'completed', 'done']
    case 'due':
    case 'duedate':
      return ['today', 'tomorrow', 'overdue', 'upcoming', 'thisweek']
    case 'created':
    case 'createddate':
      return ['today', 'yesterday']
    case 'completed':
    case 'completeddate':
      return ['today', 'yesterday', 'thisweek', 'thismonth']
    case 'assigned':
    case 'assignee':
      return ['me', 'unassigned']
    case 'subtask':
    case 'subtasks':
      return ['subtask', 'child', 'parent', 'hassubtasks']
    case 'shared':
    case 'inshared':
      return ['true', 'yes']
    default:
      return []
  }
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
