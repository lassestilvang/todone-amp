import { useEffect, useState, useRef } from 'react'
import { X, Clock, Zap, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useTaskStore } from '@/store/taskStore'
import { useLabelStore } from '@/store/labelStore'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { parseNaturalLanguageDate, parseNaturalLanguageTime } from '@/utils/date'
import { parseRecurrenceFromText } from '@/utils/recurrence'
import type { Task, Project, Label, RecurrencePattern } from '@/types'

interface ParsedTask {
  content: string
  dueDate?: Date
  dueTime?: string
  priority?: 'p1' | 'p2' | 'p3' | 'p4'
  projectId?: string
  parentTaskId?: string
  labelIds: string[]
  recurrence?: RecurrencePattern | null
}

interface SearchResult {
  type: 'task' | 'project' | 'label'
  id: string
  title: string
  subtitle?: string
  icon?: string
  data: Task | Project | Label
}

type CommandMode = 'create' | 'search' | 'command'

export function QuickAddModal() {
  const { isOpen, closeQuickAdd, recentItems, addToRecent, clearRecent } = useQuickAddStore()
  const { createTask, tasks } = useTaskStore()
  const { user } = useAuthStore()
  const labels = useLabelStore((state) => state.labels)
  const projects = useProjectStore((state) => state.projects)
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedTask>({ content: '', labelIds: [] })
  const [mode, setMode] = useState<CommandMode>('create')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [parentTaskId, setParentTaskId] = useState<string | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          closeQuickAdd()
        } else {
          useQuickAddStore.setState({ isOpen: true })
        }
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        closeQuickAdd()
      }
    }

    const handleSubtaskEvent = (event: Event) => {
      const customEvent = event as CustomEvent
      setParentTaskId(customEvent.detail?.parentId)
      useQuickAddStore.setState({ isOpen: true })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('openQuickAddForSubtask', handleSubtaskEvent)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('openQuickAddForSubtask', handleSubtaskEvent)
    }
  }, [isOpen, closeQuickAdd])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Detect mode based on input
  const detectMode = (text: string): CommandMode => {
    const trimmed = text.trim()
    if (!trimmed) return 'create'

    // Search mode indicators
    if (trimmed.startsWith('/')) return 'command'
    if (trimmed.startsWith('search:')) return 'search'
    if (trimmed.startsWith('filter:')) return 'search'

    // Check if looks like search (has spaces + no create indicators)
    const hasNaturalLanguageCreate = /\b(p[1-4]|!!!?|tomorrow|today|at \d|#\w+|@\w+)\b/i.test(
      trimmed
    )
    if (!hasNaturalLanguageCreate && trimmed.includes(' ')) {
      return 'search'
    }

    return 'create'
  }

  // Global search across tasks, projects, labels
  const performSearch = (query: string): SearchResult[] => {
    const q = query.toLowerCase()
    const results: SearchResult[] = []

    // Search tasks
    const matchingTasks = tasks.filter(
      (task) =>
        task.content.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q)
    )
    matchingTasks.slice(0, 5).forEach((task) => {
      results.push({
        type: 'task',
        id: task.id,
        title: task.content,
        subtitle: task.description ? task.description.substring(0, 50) : undefined,
        icon: '✓',
        data: task,
      })
    })

    // Search projects
    const matchingProjects = projects.filter((p) => p.name.toLowerCase().includes(q))
    matchingProjects.slice(0, 5).forEach((project) => {
      results.push({
        type: 'project',
        id: project.id,
        title: project.name,
        subtitle: `${project.color} project`,
        icon: '📁',
        data: project,
      })
    })

    // Search labels
    const matchingLabels = labels.filter((l) => l.name.toLowerCase().includes(q))
    matchingLabels.slice(0, 5).forEach((label) => {
      results.push({
        type: 'label',
        id: label.id,
        title: label.name,
        subtitle: label.color,
        icon: '🏷️',
        data: label,
      })
    })

    return results
  }

  const parseInput = (text: string) => {
    let content = text
    let dueDate: Date | undefined
    let dueTime: string | undefined
    let priority: 'p1' | 'p2' | 'p3' | 'p4' | undefined
    let projectId: string | undefined
    let recurrence: RecurrencePattern | null | undefined
    const labelIds: string[] = []

    // Parse project (#project_name)
    const projectMatch = content.match(/#(\w+)/i)
    if (projectMatch) {
      const projectName = projectMatch[1].toLowerCase()
      const project = projects.find((p) => p.name.toLowerCase() === projectName)
      if (project) {
        projectId = project.id
        content = content.replace(projectMatch[0], '').trim()
      }
    }

    // Parse labels (@label_name)
    const labelMatches = content.matchAll(/@(\w+)/gi)
    for (const match of labelMatches) {
      const labelName = match[1].toLowerCase()
      const label = labels.find((l) => l.name.toLowerCase() === labelName)
      if (label && !labelIds.includes(label.id)) {
        labelIds.push(label.id)
        content = content.replace(match[0], '').trim()
      }
    }

    // Parse recurrence (daily, weekly, biweekly, monthly, yearly, "every day", etc.)
    const recurrenceMatch = content.match(
      /(daily|weekly|biweekly|monthly|yearly|every day|every week|every 2 weeks|every month|every year)/i
    )
    if (recurrenceMatch) {
      const pattern = parseRecurrenceFromText(recurrenceMatch[0])
      if (pattern) {
        recurrence = pattern
        content = content.replace(recurrenceMatch[0], '').trim()
      }
    }

    // Parse priority (p1, p2, p3, p4, !, !!, !!!)
    const priorityMatch = content.match(/(p[1-4]|!{1,3})\s*$/i)
    if (priorityMatch) {
      const p = priorityMatch[1].toLowerCase()
      if (p === '!') priority = 'p3'
      if (p === '!!') priority = 'p2'
      if (p === '!!!') priority = 'p1'
      if (p.startsWith('p')) priority = p as 'p1' | 'p2' | 'p3' | 'p4'
      content = content.replace(priorityMatch[0], '').trim()
    }

    // Parse date
    const dateMatch = content.match(
      /(today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|in \d+ days?|next week|this week)/i
    )
    if (dateMatch) {
      const parsed = parseNaturalLanguageDate(dateMatch[0])
      if (parsed) {
        dueDate = parsed
        content = content.replace(dateMatch[0], '').trim()
      }
    }

    // Parse time
    const timeMatch = content.match(/at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
    if (timeMatch) {
      const parsed = parseNaturalLanguageTime(timeMatch[0])
      if (parsed) {
        dueTime = parsed
        content = content.replace(timeMatch[0], '').trim()
      }
    }

    setParsed({
      content: content.trim(),
      dueDate,
      dueTime,
      priority,
      projectId,
      labelIds,
      recurrence,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    const detectedMode = detectMode(value)
    setMode(detectedMode)
    setSelectedResultIndex(0)

    if (detectedMode === 'search') {
      const query = value.replace(/^(search:|filter:)/, '').trim()
      const results = performSearch(query)
      setSearchResults(results)
    } else if (detectedMode === 'create') {
      parseInput(value)
      setSearchResults([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsed.content.trim()) return

    try {
      await createTask({
        content: parsed.content,
        description: undefined,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        priority: parsed.priority || null,
        projectId: parsed.projectId,
        parentTaskId,
        createdBy: user?.id,
        order: 0,
        completed: false,
        labels: parsed.labelIds,
        reminders: [],
        attachments: [],
        recurrence: parsed.recurrence || undefined,
      })

      addToRecent(parsed.content)
      setInput('')
      setParsed({ content: '', labelIds: [] })
      setParentTaskId(undefined)
      closeQuickAdd()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleRecentItemClick = (content: string) => {
    setInput(content)
    const detectedMode = detectMode(content)
    setMode(detectedMode)
    if (detectedMode === 'create') {
      parseInput(content)
    }
    inputRef.current?.focus()
  }

  const handleResultSelect = async (result: SearchResult) => {
    if (result.type === 'task') {
      // Could open task detail panel here
      addToRecent(result.title)
    } else if (result.type === 'project') {
      // Could navigate to project
      addToRecent(result.title)
    } else if (result.type === 'label') {
      // Could filter by label
      addToRecent(result.title)
    }
    closeQuickAdd()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode !== 'search' || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedResultIndex((i) => (i + 1) % searchResults.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedResultIndex((i) => (i - 1 + searchResults.length) % searchResults.length)
        break
      case 'Enter':
        e.preventDefault()
        handleResultSelect(searchResults[selectedResultIndex])
        break
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={closeQuickAdd}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 pt-20 z-50 flex justify-center px-4">
        <div
          className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-brand-50 to-blue-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'search' ? (
                  <span className="flex items-center gap-2">
                    <Search size={18} />
                    Search
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap size={18} />
                    {parentTaskId ? 'Add Subtask' : 'Quick Add Task'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'search'
                  ? 'Search tasks, projects, or labels'
                  : parentTaskId
                    ? 'Create subtask under parent task'
                    : 'Try: "Buy groceries #project @label tomorrow at 3pm p1"'}
              </p>
            </div>
            <button
              onClick={closeQuickAdd}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'search'
                  ? 'Search tasks, projects, labels...'
                  : 'What needs to be done? (with date, time, priority...)'
              }
              className={cn(
                'w-full px-4 py-3 border-2 rounded-lg text-base',
                'placeholder-gray-400 focus:outline-none',
                'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200'
              )}
              autoFocus
            />

            {/* Search Results */}
            {mode === 'search' && searchResults.length > 0 && (
              <div className="space-y-1 max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-colors',
                      index === selectedResultIndex
                        ? 'bg-brand-100 border-l-2 border-brand-600'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Parsed Properties */}
            {mode === 'create' &&
              (parsed.dueDate ||
                parsed.dueTime ||
                parsed.priority ||
                parsed.projectId ||
                parsed.labelIds.length > 0) && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {parsed.priority && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium">
                      <span className="text-gray-500">Priority:</span>
                      <span
                        className={cn('font-bold', {
                          'text-red-600': parsed.priority === 'p1',
                          'text-orange-600': parsed.priority === 'p2',
                          'text-blue-600': parsed.priority === 'p3',
                          'text-gray-600': parsed.priority === 'p4',
                        })}
                      >
                        {parsed.priority.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {parsed.dueDate && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700">
                      <Calendar size={14} />
                      {parsed.dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}

                  {parsed.dueTime && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700">
                      <Clock size={14} />
                      {parsed.dueTime}
                    </div>
                  )}

                  {parsed.projectId && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700">
                      <span className="font-semibold">📁</span>
                      {projects.find((p) => p.id === parsed.projectId)?.name}
                    </div>
                  )}

                  {parsed.labelIds.map((labelId) => {
                    const label = labels.find((l) => l.id === labelId)
                    if (!label) return null
                    return (
                      <div
                        key={labelId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700"
                      >
                        <span className="font-semibold">🏷️</span>
                        {label.name}
                      </div>
                    )
                  })}
                </div>
              )}

            {/* Submit Button */}
            {mode === 'create' && (
              <button
                type="submit"
                disabled={!parsed.content.trim()}
                className={cn(
                  'w-full px-4 py-2 rounded-lg font-medium transition-all',
                  parsed.content.trim()
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  <Zap size={16} />
                  Add Task
                </span>
              </button>
            )}
          </form>

          {/* Recent Items */}
          {recentItems.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Recent</h3>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recentItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRecentItemClick(item.content)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm text-gray-700',
                      'hover:bg-white border border-transparent hover:border-gray-300',
                      'transition-all'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.content}</span>
                      <span className="text-xs text-gray-400">
                        {item.timestamp.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="border-t border-gray-200 px-6 py-3 bg-blue-50 text-xs text-gray-600 space-y-1">
            {mode === 'create' ? (
              <>
                <p>
                  <strong>Natural Language:</strong> Dates (today, tomorrow, Friday), Times (at 3pm,
                  at 14:00), Priority (p1-p4), Projects (#name), Labels (@name)
                </p>
                <p>
                  <strong>Examples:</strong> "Buy milk tomorrow p2" • "Team meeting #project @urgent
                  Friday at 2pm p1"
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Search:</strong> Find tasks by content, projects by name, or labels by
                  color
                </p>
                <p>
                  <strong>Tips:</strong> Type any text to search • Use arrow keys to navigate •
                  Press Enter to select
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Import Calendar icon
function Calendar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  )
}
