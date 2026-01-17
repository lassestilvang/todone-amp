import { useTemplateStore } from '@/store/templateStore'
import { useAuthStore } from '@/store/authStore'
import type { Template } from '@/types'
import { cn } from '@/utils/cn'

interface TemplateCardProps {
  template: Template
  onSelect?: (templateId: string) => void
  onDelete?: (templateId: string) => void
  showActions?: boolean
  className?: string
}

export function TemplateCard({
  template,
  onSelect,
  onDelete,
  showActions = true,
  className,
}: TemplateCardProps) {
  const { user } = useAuthStore()
  const { isFavorite, addFavorite, removeFavorite } = useTemplateStore()
  const isOwned = user && template.ownerId === user.id
  const isFav = user ? isFavorite(user.id, template.id) : false

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    if (isFav) {
      await removeFavorite(user.id, template.id)
    } else {
      await addFavorite(user.id, template.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete template "${template.name}"?`)) {
      onDelete?.(template.id)
    }
  }

  return (
    <div
      onClick={() => onSelect?.(template.id)}
      className={cn(
        'group cursor-pointer rounded border border-border p-4 transition hover:shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-content-primary">{template.name}</h3>
          <p className="text-xs text-content-tertiary">
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </p>
        </div>
        {template.isPrebuilt ? (
          <span className="whitespace-nowrap rounded bg-semantic-info-light px-2 py-1 text-xs font-medium text-semantic-info">
            Built-in
          </span>
        ) : null}
      </div>

      {/* Description */}
      {template.description && (
        <p className="mb-3 text-sm text-content-secondary">{template.description}</p>
      )}

      {/* Preview */}
      <div className="mb-3 max-h-20 overflow-hidden rounded bg-surface-secondary p-2 text-xs">
        {template.data.sections.map((section) => (
          <div key={section.name}>
            <div className="font-medium text-content-secondary">{section.name}</div>
            <div className="ml-2 space-y-0.5 text-content-tertiary">
              {section.tasks.slice(0, 2).map((task) => (
                <div key={task.content} className="truncate">
                  • {task.content}
                </div>
              ))}
              {section.tasks.length > 2 && (
                <div className="text-content-tertiary">... +{section.tasks.length - 2} more</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-3 flex gap-4 text-xs text-content-tertiary">
        <span>{template.data.sections.length} sections</span>
        <span>
          {template.data.sections.reduce((sum, s) => sum + s.tasks.length, 0)} tasks
        </span>
        {template.usageCount > 0 && <span>{template.usageCount}x used</span>}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 border-t border-border pt-3">
          {user && (
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'flex-1 rounded px-2 py-1 text-xs transition',
                isFav
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-secondary'
              )}
            >
              {isFav ? '★' : '☆'} Favorite
            </button>
          )}
          {isOwned && showActions && (
            <button
              onClick={handleDelete}
              className="flex-1 rounded bg-semantic-error-light px-2 py-1 text-xs text-semantic-error transition hover:bg-semantic-error-light"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
