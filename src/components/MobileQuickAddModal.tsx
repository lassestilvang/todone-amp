import React, { useState } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { cn } from '@/utils/cn'

interface MobileQuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuickAddData) => Promise<void>
}

export interface QuickAddData {
  content: string
  priority?: string
  dueDate?: Date
}

/**
 * MobileQuickAddModal - Thumb-friendly task creation modal
 * Large touch targets, minimal scrolling, optimized for mobile
 */
export const MobileQuickAddModal: React.FC<MobileQuickAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<string | undefined>('p3')
  const [dueDate, setDueDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Task description is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSubmit({
        content: content.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      })
      setContent('')
      setPriority('p3')
      setDueDate('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New Task" fullHeight={false}>
      <div className="space-y-4 pb-4">
        {/* Task Content Input */}
        <div>
          <label className="block text-sm font-semibold text-content-secondary mb-2">
            What do you want to do?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g., Finish project proposal..."
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2 resize-none',
              'text-base focus:outline-none',
              'bg-surface-primary',
              'border-border',
              'focus:border-blue-500 dark:focus:border-blue-400',
              'text-content-primary placeholder-content-tertiary',
              'h-24'
            )}
            autoFocus
          />
          {error && (
            <div className="mt-2 flex items-start gap-2 text-sm text-semantic-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold text-content-secondary mb-2">
            Priority
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'p1', label: 'High', color: 'bg-priority-p1-bg text-priority-p1' },
              { id: 'p2', label: 'Medium', color: 'bg-priority-p2-bg text-priority-p2' },
              { id: 'p3', label: 'Low', color: 'bg-priority-p3-bg text-priority-p3' },
              { id: 'p4', label: 'Very Low', color: 'bg-priority-p4-bg text-priority-p4' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={cn(
                  'py-3 rounded-lg font-medium transition-all',
                  priority === p.id
                    ? `${p.color} ring-2 ring-offset-2 ring-offset-surface-primary`
                    : `${p.color} opacity-60 hover:opacity-80`
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Input */}
        <div>
          <label className="block text-sm font-semibold text-content-secondary mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2',
              'text-base focus:outline-none',
              'bg-surface-primary',
              'border-border',
              'focus:border-blue-500 dark:focus:border-blue-400',
              'text-content-primary'
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-colors',
              'bg-interactive-secondary text-content-primary',
              'hover:bg-surface-tertiary',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-colors',
              'bg-brand-600 hover:bg-brand-700 text-white',
              'disabled:bg-brand-400 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Add Task'
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
