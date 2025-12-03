import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useLabelStore } from '@/store/labelStore'
import { LabelBadge } from '@/components/LabelBadge'

interface LabelSelectorProps {
  selectedLabelIds: string[]
  onAdd: (labelId: string) => void
  onRemove: (labelId: string) => void
}

export function LabelSelector({
  selectedLabelIds,
  onAdd,
  onRemove,
}: LabelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const labels = useLabelStore((state) => state.labels)
  const selectedLabels = useLabelStore((state) => state.getLabelsByIds(selectedLabelIds))

  const availableLabels = labels.filter((l) => !selectedLabelIds.includes(l.id))

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Labels</label>

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label) => (
            <LabelBadge
              key={label.id}
              label={label}
              onRemove={() => onRemove(label.id)}
              removable={true}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Add Label Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded-md border',
            'text-gray-600 hover:bg-gray-50',
            isOpen ? 'border-brand-500 bg-brand-50' : 'border-gray-300'
          )}
        >
          <Plus size={16} />
          Add label
        </button>

        {/* Dropdown */}
        {isOpen && availableLabels.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="max-h-48 overflow-y-auto">
              {availableLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => {
                    onAdd(label.id)
                    if (availableLabels.length === 1) setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2 transition-colors"
                >
                  <LabelBadge label={label} size="sm" />
                </button>
              ))}
            </div>
          </div>
        )}

        {isOpen && availableLabels.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-300 rounded-md shadow-lg p-3">
            <p className="text-sm text-gray-500">No labels available</p>
          </div>
        )}
      </div>
    </div>
  )
}
