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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            What do you want to do?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g., Finish project proposal..."
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2 resize-none',
              'text-base focus:outline-none',
              'bg-white dark:bg-gray-700',
              'border-gray-300 dark:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400',
              'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
              'h-24'
            )}
            autoFocus
          />
          {error && (
            <div className="mt-2 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'p1', label: 'High', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' },
              {
                id: 'p2',
                label: 'Medium',
                color: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
              },
              { id: 'p3', label: 'Low', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200' },
              {
                id: 'p4',
                label: 'Very Low',
                color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200',
              },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={cn(
                  'py-3 rounded-lg font-medium transition-all',
                  priority === p.id
                    ? `${p.color} ring-2 ring-offset-2 dark:ring-offset-gray-900`
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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
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
              'bg-white dark:bg-gray-700',
              'border-gray-300 dark:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400',
              'text-gray-900 dark:text-white'
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
              'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
              'hover:bg-gray-300 dark:hover:bg-gray-600',
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
              'bg-blue-500 hover:bg-blue-600 text-white',
              'disabled:bg-blue-400 disabled:cursor-not-allowed',
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
