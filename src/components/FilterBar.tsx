import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { useLabelStore } from '@/store/labelStore'

interface QuickFilterOption {
  id: string
  label: string
  type: 'label' | 'priority' | 'status'
  value: string
  isActive: boolean
}

export function FilterBar() {
  const activeFilterId = useFilterStore((state) => state.activeFilterId)
  const filters = useFilterStore((state) => state.filters)
  const setActiveFilter = useFilterStore((state) => state.setActiveFilter)

  const labels = useLabelStore((state) => state.labels)
  const [showQuickFilters, setShowQuickFilters] = useState(false)

  const activeFilter = activeFilterId ? filters.find((f) => f.id === activeFilterId) : null

  const quickFilters: QuickFilterOption[] = [
    {
      id: 'status-active',
      label: 'Active',
      type: 'status',
      value: 'false',
      isActive: false,
    },
    {
      id: 'status-completed',
      label: 'Completed',
      type: 'status',
      value: 'true',
      isActive: false,
    },
    {
      id: 'priority-p1',
      label: 'P1 - Urgent',
      type: 'priority',
      value: 'p1',
      isActive: false,
    },
    {
      id: 'priority-p2',
      label: 'P2 - High',
      type: 'priority',
      value: 'p2',
      isActive: false,
    },
    ...labels.map((label) => ({
      id: `label-${label.id}`,
      label: label.name,
      type: 'label' as const,
      value: label.id,
      isActive: false,
    })),
  ]

  const handleClearFilter = () => {
    setActiveFilter(null)
  }

  return (
    <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters:</span>
        </div>

        {/* Active Filter Display */}
        {activeFilter ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
            <span>{activeFilter.name}</span>
            <button
              onClick={handleClearFilter}
              className="p-0.5 hover:bg-brand-200 rounded transition-colors"
              title="Clear filter"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">None</span>
        )}

        {/* Quick Filter Toggle */}
        <button
          onClick={() => setShowQuickFilters(!showQuickFilters)}
          className="ml-auto px-2 py-1 text-sm text-gray-600 hover:bg-white rounded border border-gray-300 transition-colors"
        >
          Quick Filter
        </button>
      </div>

      {/* Quick Filters Dropdown */}
      {showQuickFilters && (
        <div className="mt-3 p-3 bg-white rounded border border-gray-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setShowQuickFilters(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-200 transition-colors text-left"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
