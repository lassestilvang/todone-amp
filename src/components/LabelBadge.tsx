import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { LABEL_COLOR_MAP } from '@/store/labelStore'
import type { Label } from '@/types'

interface LabelBadgeProps {
  label: Label
  onRemove?: () => void
  removable?: boolean
  size?: 'sm' | 'md'
}

export function LabelBadge({
  label,
  onRemove,
  removable = false,
  size = 'sm',
}: LabelBadgeProps) {
  const colorClass = LABEL_COLOR_MAP[label.color as keyof typeof LABEL_COLOR_MAP] || LABEL_COLOR_MAP.gray

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 font-medium',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        colorClass
      )}
    >
      <span>{label.name}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
          title="Remove label"
        >
          <X size={size === 'sm' ? 14 : 16} />
        </button>
      )}
    </div>
  )
}
