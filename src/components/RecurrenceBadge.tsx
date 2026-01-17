import { RotateCw } from 'lucide-react'
import type { RecurrencePattern } from '@/types'
import { formatRecurrencePattern } from '@/utils/recurrence'

interface RecurrenceBadgeProps {
  pattern?: RecurrencePattern
  size?: 'sm' | 'md'
}

export function RecurrenceBadge({ pattern, size = 'sm' }: RecurrenceBadgeProps) {
  if (!pattern) return null

  const text = formatRecurrencePattern(pattern)
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'

  return (
    <div className={`inline-flex items-center gap-1 bg-semantic-info-light text-semantic-info rounded-full ${sizeClass} font-medium`}>
      <RotateCw size={size === 'sm' ? 12 : 14} />
      <span>{text}</span>
    </div>
  )
}
