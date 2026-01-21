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
      <div className={cn('rounded border border-border p-4', className)}>
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
    <div className={cn('space-y-4 rounded border border-border p-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-content-primary">
            {template.name}
          </h2>
          <p className="text-sm text-content-tertiary">
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            {template.isPrebuilt && ' • Built-in'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-surface-tertiary"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-content-secondary">{template.description}</p>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-content-tertiary">
        <span>{template.data.sections.length} sections</span>
        <span>
          {template.data.sections.reduce((sum, s) => sum + s.tasks.length, 0)} tasks
        </span>
        {template.usageCount > 0 && <span>{template.usageCount}x used</span>}
      </div>

      {/* Preview content */}
      <div className="max-h-64 space-y-2 overflow-y-auto rounded bg-surface-secondary p-3">
        {template.data.sections.map((section) => (
          <div key={section.name}>
            <h4 className="font-medium text-content-secondary">{section.name}</h4>
            <ul className="ml-4 space-y-1 text-sm text-content-secondary">
              {section.tasks.map((task) => (
                <li key={task.content} className="flex gap-2">
                  <span className="text-content-tertiary">•</span>
                  <span>{task.content}</span>
                  {task.priority && (
                    <span className="rounded bg-interactive-secondary px-1 text-xs">
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
        <label className="block text-sm font-medium text-content-secondary">
          New Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={`e.g., ${template.name} - ${new Date().getFullYear()}`}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={isApplying || !projectName.trim()}
          className="flex-1 rounded bg-interactive-primary px-4 py-2 text-sm font-medium text-content-inverse transition hover:bg-interactive-primary-hover disabled:opacity-50"
        >
          {isApplying ? 'Applying...' : 'Apply Template'}
        </button>
        {user && (
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'rounded px-3 py-2 text-sm transition',
              isFav
                ? 'bg-accent-yellow-subtle text-accent-yellow'
                : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-secondary'
            )}
          >
            {isFav ? '★' : '☆'}
          </button>
        )}
        <button
          onClick={onClose}
          className="rounded border border-border px-4 py-2 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
