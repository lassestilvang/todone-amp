import { useCallback } from 'react'
import { cn } from '@/utils/cn'

interface FilterTemplate {
  id: string
  name: string
  query: string
  icon: string
  description: string
}

interface FilterTemplatesProps {
  onSelect: (query: string) => void
}

const FILTER_TEMPLATES: FilterTemplate[] = [
  {
    id: 'active',
    name: 'Active Tasks',
    query: 'status:active',
    icon: '⚡',
    description: 'Show only incomplete tasks',
  },
  {
    id: 'completed',
    name: 'Completed',
    query: 'status:completed',
    icon: '✓',
    description: 'Show completed tasks',
  },
  {
    id: 'p1',
    name: 'P1 Priority',
    query: 'priority:p1',
    icon: '🔴',
    description: 'Urgent tasks only',
  },
  {
    id: 'p1-active',
    name: 'Urgent & Active',
    query: 'priority:p1 AND status:active',
    icon: '🚨',
    description: 'Urgent tasks that need attention',
  },
  {
    id: 'overdue',
    name: 'Overdue',
    query: 'due:overdue',
    icon: '⏰',
    description: 'Tasks past their due date',
  },
  {
    id: 'today',
    name: 'Due Today',
    query: 'due:today',
    icon: '📅',
    description: 'Tasks due today',
  },
  {
    id: 'p2-p3-active',
    name: 'Medium Priority',
    query: '(priority:p2 OR priority:p3) AND status:active',
    icon: '🟠',
    description: 'Medium priority active tasks',
  },
  {
    id: 'not-completed',
    name: 'Not Completed',
    query: 'NOT status:completed',
    icon: '○',
    description: 'All incomplete tasks',
  },
]

export function FilterTemplates({ onSelect }: FilterTemplatesProps) {
  const handleSelect = useCallback(
    (query: string) => {
      onSelect(query)
    },
    [onSelect]
  )

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 px-1">Filter Templates</h3>
      <div className="grid grid-cols-1 gap-2">
        {FILTER_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template.query)}
            className={cn(
              'text-left p-3 rounded-lg border border-gray-200 transition-all',
              'hover:border-brand-500 hover:bg-brand-50'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">{template.query}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
