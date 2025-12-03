import { cn } from '@/utils/cn'
import { LABEL_COLORS, LABEL_COLOR_MAP } from '@/store/labelStore'
import type { LabelColor } from '@/store/labelStore'

interface LabelColorPickerProps {
  value: LabelColor
  onChange: (color: LabelColor) => void
}

export function LabelColorPicker({ value, onChange }: LabelColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Color</label>
      <div className="grid grid-cols-5 gap-2">
        {LABEL_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'h-10 rounded-lg border-2 transition-all',
              value === color ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' : 'border-transparent hover:opacity-80',
              LABEL_COLOR_MAP[color]
            )}
            title={color}
          >
            <span className="text-xs font-semibold capitalize">{color.slice(0, 2)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
