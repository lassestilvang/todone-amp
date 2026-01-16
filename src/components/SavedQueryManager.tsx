import React, { useState } from 'react'
import { Trash2, Copy, Play } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { cn } from '@/utils/cn'

interface SavedQueryManagerProps {
  onApply: (query: string) => void
  className?: string
}

export const SavedQueryManager: React.FC<SavedQueryManagerProps> = ({ onApply, className }) => {
  const { savedQueries, deleteSavedQuery } = useFilterStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (query: string, id: string) => {
    navigator.clipboard.writeText(query)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (savedQueries.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border bg-surface-secondary p-4 text-center', className)}>
        <p className="text-sm text-content-secondary">No saved queries yet</p>
        <p className="text-xs text-content-tertiary">Use the save button in the search bar to save queries</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-content-secondary">Saved Queries</h3>
      <div className="space-y-1">
        {savedQueries.map((query) => (
          <div
            key={query.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-primary p-3 hover:bg-surface-tertiary"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-content-primary">{query.label}</p>
              <code className="text-xs text-content-secondary truncate block">{query.query}</code>
              <p className="text-xs text-content-tertiary mt-1">
                Used {query.usageCount} times • Last: {new Date(query.lastUsedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onApply(query.query)}
                title="Apply this query"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Play className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleCopy(query.query, query.id)}
                title="Copy query"
                className="p-2 text-content-secondary hover:bg-surface-tertiary rounded"
              >
                <Copy className="h-4 w-4" />
                {copiedId === query.id && <span className="text-xs text-semantic-success ml-1">Copied!</span>}
              </button>

              <button
                onClick={() => deleteSavedQuery(query.id)}
                title="Delete query"
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
