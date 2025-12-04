import { useState } from 'react'
import { ChevronDown, Plus, HelpCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getFilterSuggestions } from '@/utils/filterParser'

interface AdvancedFilterBuilderProps {
  initialQuery?: string
  onApply: (query: string) => void
  onCancel: () => void
}

type BuildMode = 'simple' | 'advanced'

export function AdvancedFilterBuilder({
  initialQuery = '',
  onApply,
  onCancel,
}: AdvancedFilterBuilderProps) {
  const [mode, setMode] = useState<BuildMode>('simple')
  const [query, setQuery] = useState(initialQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const suggestions = getFilterSuggestions()

  const handleApply = () => {
    onApply(query)
  }

  const applySuggestion = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setMode('simple')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            mode === 'simple'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Simple
        </button>
        <button
          onClick={() => setMode('advanced')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            mode === 'advanced'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Advanced
        </button>
      </div>

      {/* Simple Mode */}
      {mode === 'simple' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Filters
            </label>
            <div className="space-y-2">
              <FilterQuickButton label="Active Tasks" onClick={() => setQuery('status:active')} />
              <FilterQuickButton label="Completed" onClick={() => setQuery('status:completed')} />
              <FilterQuickButton label="P1 Priority" onClick={() => setQuery('priority:p1')} />
              <FilterQuickButton
                label="P1 & Active"
                onClick={() => setQuery('priority:p1 AND status:active')}
              />
              <FilterQuickButton label="Overdue" onClick={() => setQuery('due:overdue')} />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Mode */}
      {mode === 'advanced' && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Query</label>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                title="Help"
              >
                <HelpCircle size={16} />
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g., priority:p1 AND status:active'
              rows={3}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-lg',
                'text-sm font-mono placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-500'
              )}
            />
          </div>

          {/* Help Text */}
          {showHelp && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-2">
              <div>
                <p className="font-medium text-blue-900">Syntax:</p>
                <p className="text-blue-800">
                  <code className="bg-white px-1 rounded">field:value</code> matches a condition
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-900">Fields:</p>
                <p className="text-blue-800 text-xs">
                  priority, status, label, project, due, created, search
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-900">Operators:</p>
                <p className="text-blue-800 text-xs">AND, OR, NOT, parentheses</p>
              </div>
              <div>
                <p className="font-medium text-blue-900">Examples:</p>
                <p className="text-blue-800 text-xs font-mono">
                  priority:p1 AND status:active
                  <br />
                  (priority:p1 OR priority:p2) AND due:overdue
                  <br />
                  NOT status:completed
                </p>
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="relative">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-between bg-gray-50"
            >
              <span className="text-gray-600">Suggested filters</span>
              <ChevronDown
                size={16}
                className={cn('text-gray-400 transition-transform', showSuggestions && 'rotate-180')}
              />
            </button>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => applySuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors font-mono"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleApply}
          disabled={!query.trim()}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
            query.trim()
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          )}
        >
          Apply Filter
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

interface FilterQuickButtonProps {
  label: string
  onClick: () => void
}

function FilterQuickButton({ label, onClick }: FilterQuickButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-lg',
        'hover:border-brand-500 hover:bg-brand-50 transition-colors',
        'font-medium text-gray-700 flex items-center justify-between'
      )}
    >
      <span>{label}</span>
      <Plus size={16} className="text-gray-400" />
    </button>
  )
}
