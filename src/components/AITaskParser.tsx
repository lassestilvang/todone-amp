import { useMemo } from 'react'
import {
  Calendar,
  Clock,
  Flag,
  FolderOpen,
  Tag,
  MapPin,
  Timer,
  Repeat,
  Sparkles,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ParsedTaskIntent, ParsedField } from '@/utils/nlp'

interface AITaskParserProps {
  parsed: ParsedTaskIntent
  onFieldRemove?: (field: string) => void
  showConfidence?: boolean
  className?: string
}

const FIELD_CONFIG: Record<
  string,
  {
    icon: LucideIcon
    label: string
    colorClass: string
  }
> = {
  dueDate: {
    icon: Calendar,
    label: 'Due',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  dueTime: {
    icon: Clock,
    label: 'Time',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  priority: {
    icon: Flag,
    label: 'Priority',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  },
  project: {
    icon: FolderOpen,
    label: 'Project',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  labels: {
    icon: Tag,
    label: 'Labels',
    colorClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
  location: {
    icon: MapPin,
    label: 'Location',
    colorClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  },
  duration: {
    icon: Timer,
    label: 'Duration',
    colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  },
  recurrence: {
    icon: Repeat,
    label: 'Repeats',
    colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  },
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'p1':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    case 'p2':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
    case 'p3':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    case 'p4':
      return 'bg-surface-tertiary text-content-primary border-border'
    default:
      return FIELD_CONFIG.priority.colorClass
  }
}

function formatFieldValue(field: ParsedField, parsed: ParsedTaskIntent): string {
  switch (field.field) {
    case 'dueDate':
      if (parsed.dueDate) {
        const now = new Date()
        const isToday = parsed.dueDate.toDateString() === now.toDateString()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const isTomorrow = parsed.dueDate.toDateString() === tomorrow.toDateString()

        if (isToday) return 'Today'
        if (isTomorrow) return 'Tomorrow'

        return parsed.dueDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      }
      return field.value
    case 'dueTime':
      if (parsed.dueTime) {
        const [hours, minutes] = parsed.dueTime.split(':').map(Number)
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHour = hours % 12 || 12
        return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
      }
      return field.value
    case 'priority':
      return field.value.toUpperCase()
    case 'duration':
      if (parsed.duration) {
        if (parsed.duration >= 60) {
          const hours = Math.floor(parsed.duration / 60)
          const mins = parsed.duration % 60
          return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${parsed.duration}m`
      }
      return field.value
    case 'recurrence':
      return field.value.charAt(0).toUpperCase() + field.value.slice(1)
    default:
      return field.value
  }
}

export function AITaskParser({
  parsed,
  onFieldRemove,
  showConfidence = false,
  className,
}: AITaskParserProps) {
  const hasFields = parsed.parsedFields.length > 0

  const sortedFields = useMemo(() => {
    const order = ['dueDate', 'dueTime', 'priority', 'project', 'labels', 'recurrence', 'duration', 'location']
    return [...parsed.parsedFields].sort((a, b) => {
      const aIndex = order.indexOf(a.field)
      const bIndex = order.indexOf(b.field)
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    })
  }, [parsed.parsedFields])

  if (!hasFields) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-xs text-content-tertiary">
        <Sparkles size={12} className="text-brand-500" />
        <span>Detected from your input:</span>
        {showConfidence && parsed.confidence > 0 && (
          <span className="ml-auto text-content-tertiary">
            {Math.round(parsed.confidence * 100)}% confidence
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedFields.map((field) => {
          const config = FIELD_CONFIG[field.field]
          if (!config) return null

          const Icon = config.icon
          const colorClass =
            field.field === 'priority' ? getPriorityColor(field.value) : config.colorClass

          return (
            <div
              key={field.field}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                'transition-all duration-200',
                colorClass
              )}
            >
              <Icon size={12} />
              <span>{formatFieldValue(field, parsed)}</span>
              {onFieldRemove && (
                <button
                  type="button"
                  onClick={() => onFieldRemove(field.field)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-surface-tertiary transition-colors"
                  aria-label={`Remove ${config.label}`}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {parsed.title && (
        <div className="flex items-start gap-2 p-2 bg-surface-secondary rounded-md border border-border">
          <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-content-tertiary mb-0.5">Task title:</div>
            <div className="text-sm font-medium text-content-primary">
              {parsed.title}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AIParsePreviewProps {
  input: string
  parsed: ParsedTaskIntent
  isValid: boolean
}

export function AIParsePreview({ input, parsed, isValid }: AIParsePreviewProps) {
  if (!input.trim()) {
    return (
      <div className="text-sm text-content-tertiary italic">
        Start typing to see AI parsing...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AITaskParser parsed={parsed} showConfidence />

      {!isValid && parsed.title && (
        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Sparkles size={12} />
          <span>
            Tip: Add dates like "tomorrow" or "Friday", priorities like "p1" or "!!!", projects with
            "#project", labels with "@label"
          </span>
        </div>
      )}
    </div>
  )
}
