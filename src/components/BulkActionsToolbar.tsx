import React from 'react'
import { Trash2, Copy, CheckSquare, Flag, Folder, Tag, X } from 'lucide-react'
import { useBulkActionStore } from '@/store/bulkActionStore'
import { Button } from '@/components/Button'
import { cn } from '@/utils/cn'

interface BulkActionsToolbarProps {
  onCompleteAll?: () => void
  onDeleteAll?: () => void
  onDuplicateAll?: () => void
  onPriorityChange?: (priority: 'p1' | 'p2' | 'p3' | 'p4' | null) => void
  onProjectChange?: (projectId: string) => void
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  onCompleteAll,
  onDeleteAll,
  onDuplicateAll,
  onPriorityChange,
  onProjectChange,
}) => {
  const { getSelectedCount, clearSelection, completeSelected, deleteSelected, duplicateSelected } =
    useBulkActionStore()

  const selectedCount = getSelectedCount()

  if (selectedCount === 0) {
    return null
  }

  const handleCompleteAll = async () => {
    await completeSelected()
    onCompleteAll?.()
  }

  const handleDeleteAll = async () => {
    if (confirm(`Are you sure you want to delete ${selectedCount} task(s)?`)) {
      await deleteSelected()
      onDeleteAll?.()
    }
  }

  const handleDuplicateAll = async () => {
    await duplicateSelected()
    onDuplicateAll?.()
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-surface-primary border-t border-border shadow-lg',
        'animate-slideUp z-40'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Selection info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-content-secondary">{selectedCount} selected</span>
        </div>

        {/* Center: Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCompleteAll}
            title="Complete selected tasks"
            className="flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Complete</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicateAll}
            title="Duplicate selected tasks"
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </Button>

          {onPriorityChange && (
            <Button
              variant="ghost"
              size="sm"
              title="Change priority"
              className="flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Priority</span>
            </Button>
          )}

          {onProjectChange && (
            <Button
              variant="ghost"
              size="sm"
              title="Move to project"
              className="flex items-center gap-2"
            >
              <Folder className="w-4 h-4" />
              <span className="hidden sm:inline">Project</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            title="Add labels"
            className="flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Labels</span>
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAll}
            title="Delete selected tasks"
            className="flex items-center gap-2 hover:text-icon-error"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>

        {/* Right: Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          title="Clear selection"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Close</span>
        </Button>
      </div>
    </div>
  )
}
