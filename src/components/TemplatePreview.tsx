import { useState } from 'react'
import { useTemplateStore } from '@/store/templateStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface TemplatePreviewProps {
  templateId: string
  onClose?: () => void
  onApply?: (templateId: string, projectName: string) => void
  className?: string
}

export function TemplatePreview({ templateId, onClose, onApply, className }: TemplatePreviewProps) {
  const { user } = useAuthStore()
  const { templates, isFavorite, addFavorite, removeFavorite } = useTemplateStore()
  const [projectName, setProjectName] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const template = templates.find((t) => t.id === templateId)
  if (!template) {
    return (
      <div className={cn('rounded border border-gray-200 p-4', className)}>
        Template not found
      </div>
    )
  }

  const isFav = user ? isFavorite(user.id, templateId) : false

  const handleToggleFavorite = async () => {
    if (!user) return

    if (isFav) {
      await removeFavorite(user.id, templateId)
    } else {
      await addFavorite(user.id, templateId)
    }
  }

  const handleApply = async () => {
    if (!user || !projectName.trim()) return

    setIsApplying(true)
    try {
      onApply?.(templateId, projectName.trim())
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className={cn('space-y-4 rounded border border-gray-200 p-4 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {template.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            {template.isPrebuilt && ' • Built-in'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{template.data.sections.length} sections</span>
        <span>
          {template.data.sections.reduce((sum, s) => sum + s.tasks.length, 0)} tasks
        </span>
        {template.usageCount > 0 && <span>{template.usageCount}x used</span>}
      </div>

      {/* Preview content */}
      <div className="max-h-64 space-y-2 overflow-y-auto rounded bg-gray-50 p-3 dark:bg-gray-800">
        {template.data.sections.map((section) => (
          <div key={section.name}>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">{section.name}</h4>
            <ul className="ml-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {section.tasks.map((task) => (
                <li key={task.content} className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{task.content}</span>
                  {task.priority && (
                    <span className="rounded bg-gray-200 px-1 text-xs dark:bg-gray-700">
                      {task.priority}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Project name input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={`e.g., ${template.name} - ${new Date().getFullYear()}`}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={isApplying || !projectName.trim()}
          className="flex-1 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {isApplying ? 'Applying...' : 'Apply Template'}
        </button>
        {user && (
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'rounded px-3 py-2 text-sm transition',
              isFav
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            {isFav ? '★' : '☆'}
          </button>
        )}
        <button
          onClick={onClose}
          className="rounded border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  )
}
