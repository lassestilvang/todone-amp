import { useEffect, useState, useRef, useMemo } from 'react'
import { X, Zap, Search, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useQuickAddStore } from '@/store/quickAddStore'
import { useTaskStore } from '@/store/taskStore'
import { useLabelStore } from '@/store/labelStore'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { parseTaskInput, type ParsedTaskIntent } from '@/utils/nlp'
import type { Task, Project, Label, RecurrencePattern } from '@/types'
import { logger } from '@/utils/logger'
import { AITaskParser } from './AITaskParser'

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
  const [nlpParsed, setNlpParsed] = useState<ParsedTaskIntent | null>(null)
  const [useAIParsing, setUseAIParsing] = useState(true)
  const [mode, setMode] = useState<CommandMode>('create')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [parentTaskId, setParentTaskId] = useState<string | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  const parserContext = useMemo(
    () => ({
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
      labels: labels.map((l) => ({ id: l.id, name: l.name })),
    }),
    [projects, labels]
  )

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
    if (useAIParsing) {
      const nlpResult = parseTaskInput(text, parserContext)
      setNlpParsed(nlpResult)

      setParsed({
        content: nlpResult.title,
        dueDate: nlpResult.dueDate,
        dueTime: nlpResult.dueTime,
        priority: nlpResult.priority as 'p1' | 'p2' | 'p3' | 'p4' | undefined,
        projectId: nlpResult.projectId,
        labelIds: nlpResult.labelIds,
        recurrence: nlpResult.recurrence,
      })
    } else {
      setNlpParsed(null)
      setParsed({
        content: text.trim(),
        labelIds: [],
      })
    }
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
      logger.error('Failed to create task:', error)
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
          className="w-full max-w-2xl bg-surface-primary rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-gradient-to-r from-brand-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-content-primary">
                {mode === 'search' ? (
                  <span className="flex items-center gap-2">
                    <Search size={18} />
                    Search
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {useAIParsing ? <Sparkles size={18} className="text-brand-500" /> : <Zap size={18} />}
                    {parentTaskId ? 'Add Subtask' : 'Smart Quick Add'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-content-tertiary mt-1">
                {mode === 'search'
                  ? 'Search tasks, projects, or labels'
                  : parentTaskId
                    ? 'Create subtask under parent task'
                    : 'Try: "Meet John for coffee tomorrow at 3pm #work @urgent p1"'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={() => {
                    setUseAIParsing(!useAIParsing)
                    if (input) parseInput(input)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                    useAIParsing
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'bg-surface-tertiary text-content-secondary'
                  )}
                  title={useAIParsing ? 'AI parsing enabled' : 'AI parsing disabled'}
                >
                  <Sparkles size={12} />
                  <span>AI</span>
                </button>
              )}
              <button
                onClick={closeQuickAdd}
                className="p-1 text-content-tertiary hover:text-content-secondary rounded-md hover:bg-surface-tertiary"
              >
                <X size={20} />
              </button>
            </div>
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
                'bg-surface-primary text-content-primary',
                'border-border focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800'
              )}
              autoFocus
            />

            {/* Search Results */}
            {mode === 'search' && searchResults.length > 0 && (
              <div className="space-y-1 max-h-80 overflow-y-auto border border-border rounded-lg bg-surface-primary">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-colors',
                      index === selectedResultIndex
                        ? 'bg-brand-100 border-l-2 border-brand-600'
                        : 'hover:bg-surface-tertiary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-content-primary truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-content-tertiary truncate">{result.subtitle}</div>
                        )}
                        <div className="text-xs text-content-tertiary mt-1">
                          {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* AI Parsed Properties */}
            {mode === 'create' && useAIParsing && nlpParsed && nlpParsed.parsedFields.length > 0 && (
              <div className="p-3 bg-surface-secondary rounded-lg border border-border">
                <AITaskParser parsed={nlpParsed} showConfidence />
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
                    : 'bg-interactive-secondary text-content-tertiary cursor-not-allowed'
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
            <div className="border-t border-border px-6 py-4 bg-surface-secondary">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-content-primary">Recent</h3>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-content-tertiary hover:text-content-secondary"
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
                      'w-full text-left px-3 py-2 rounded-md text-sm text-content-secondary',
                      'hover:bg-surface-primary border border-transparent hover:border-border',
                      'transition-all'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.content}</span>
                      <span className="text-xs text-content-tertiary">
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
          <div className="border-t border-border px-6 py-3 bg-info-light text-xs text-content-secondary space-y-1">
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


