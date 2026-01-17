import { cn } from '@/utils/cn'
import type { Priority } from '@/types'

export interface PrioritySelectorProps {
  value: Priority
  onChange: (priority: Priority) => void
  disabled?: boolean
  className?: string
}

const PRIORITIES: Array<{ value: Priority; label: string; color: string }> = [
  { value: 'p1', label: 'P1', color: 'bg-priority-p1' },
  { value: 'p2', label: 'P2', color: 'bg-priority-p2' },
  { value: 'p3', label: 'P3', color: 'bg-priority-p3' },
  { value: 'p4', label: 'P4', color: 'bg-priority-p4' },
  { value: null, label: 'None', color: 'bg-interactive-secondary' },
]

export function PrioritySelector({ value, onChange, disabled = false, className }: PrioritySelectorProps) {
  return (
    <fieldset className={cn('flex gap-2', className)} disabled={disabled}>
      {PRIORITIES.map((priority) => (
        <button
          key={priority.value || 'none'}
          type="button"
          onClick={() => onChange(priority.value)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-md font-semibold text-sm transition-all',
            priority.color,
            value === priority.value
              ? 'ring-2 ring-offset-2 ring-focus text-white'
              : 'text-white hover:opacity-80',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={`Set priority to ${priority.label}`}
        >
          {priority.value ? priority.value.toUpperCase() : '○'}
        </button>
      ))}
    </fieldset>
  )
}
