import { useState } from 'react'
import { ChevronDown, Settings } from 'lucide-react'
import { useViewStore } from '@/store/viewStore'
import { ColumnCustomizer } from '@/components/ColumnCustomizer'
import { cn } from '@/utils/cn'

interface ListViewOptionsProps {
  compact?: boolean
}

export function ListViewOptions({ compact = false }: ListViewOptionsProps) {
  const listGroupBy = useViewStore((state) => state.listGroupBy)
  const listSortBy = useViewStore((state) => state.listSortBy)
  const setListGroupBy = useViewStore((state) => state.setListGroupBy)
  const setListSortBy = useViewStore((state) => state.setListSortBy)

  const [showGroupBy, setShowGroupBy] = useState(false)
  const [showSortBy, setShowSortBy] = useState(false)

  const groupOptions = [
    { value: 'none', label: 'None' },
    { value: 'date', label: 'By Date' },
    { value: 'project', label: 'By Project' },
    { value: 'priority', label: 'By Priority' },
    { value: 'label', label: 'By Label' },
  ]

  const sortOptions = [
    { value: 'custom', label: 'Custom Order' },
    { value: 'due-date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'created', label: 'Created Date' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ]

  const currentGroupLabel =
    groupOptions.find((o) => o.value === listGroupBy)?.label || 'None'
  const currentSortLabel =
    sortOptions.find((o) => o.value === listSortBy)?.label || 'Custom Order'

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-content-secondary font-medium">Group: {currentGroupLabel}</span>
        <span className="text-content-tertiary">•</span>
        <span className="text-content-secondary font-medium">Sort: {currentSortLabel}</span>
      </div>
    )
  }

  return (
    <div className="px-6 py-3 border-b border-border bg-surface-secondary">
      <div className="flex items-center gap-4">
        <Settings size={16} className="text-content-tertiary" />
        <ColumnCustomizer />

        {/* Group By */}
        <div className="relative">
          <button
            onClick={() => {
              setShowGroupBy(!showGroupBy)
              setShowSortBy(false)
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-content-secondary hover:bg-surface-primary rounded border border-border transition-colors"
          >
            <span>Group: {currentGroupLabel}</span>
            <ChevronDown size={16} />
          </button>

          {showGroupBy && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-surface-primary border border-border rounded shadow-lg z-10">
              {groupOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setListGroupBy(
                      option.value as 'none' | 'date' | 'project' | 'priority' | 'label'
                    )
                    setShowGroupBy(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-sm text-left hover:bg-surface-tertiary transition-colors',
                    listGroupBy === option.value && 'bg-brand-50 text-brand-600 font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort By */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortBy(!showSortBy)
              setShowGroupBy(false)
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-content-secondary hover:bg-surface-primary rounded border border-border transition-colors"
          >
            <span>Sort: {currentSortLabel}</span>
            <ChevronDown size={16} />
          </button>

          {showSortBy && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-surface-primary border border-border rounded shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setListSortBy(
                      option.value as
                        | 'custom'
                        | 'due-date'
                        | 'priority'
                        | 'created'
                        | 'alphabetical'
                    )
                    setShowSortBy(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-sm text-left hover:bg-surface-tertiary transition-colors',
                    listSortBy === option.value && 'bg-brand-50 text-brand-600 font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
