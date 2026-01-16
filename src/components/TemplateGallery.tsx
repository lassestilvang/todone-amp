import { useState, useEffect } from 'react'
import { useTemplateStore } from '@/store/templateStore'
import { useAuthStore } from '@/store/authStore'
import type { TemplateCategory } from '@/types'
import { cn } from '@/utils/cn'

interface TemplateGalleryProps {
  onSelectTemplate?: (templateId: string) => void
  className?: string
}

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'education', label: 'Education' },
  { value: 'management', label: 'Management' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'support', label: 'Support' },
  { value: 'health', label: 'Health' },
  { value: 'finance', label: 'Finance' },
]

export function TemplateGallery({ onSelectTemplate, className }: TemplateGalleryProps) {
  const { templates, loadAllTemplates, searchTemplates, getFavoriteTemplates } =
    useTemplateStore()
  const { user } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewFavoritesOnly, setViewFavoritesOnly] = useState(false)

  useEffect(() => {
    loadAllTemplates()
  }, [loadAllTemplates])

  const filtered = (() => {
    let result = searchQuery ? searchTemplates(searchQuery) : templates

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory)
    }

    if (viewFavoritesOnly && user) {
      const favorites = getFavoriteTemplates(user.id)
      result = result.filter((t) => favorites.some((f) => f.id === t.id))
    }

    return result
  })()

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded border border-border px-3 py-2 text-sm"
        />
        {user && (
          <button
            onClick={() => setViewFavoritesOnly(!viewFavoritesOnly)}
            className={cn(
              'rounded px-3 py-2 text-sm transition',
              viewFavoritesOnly
                ? 'bg-amber-500 text-white'
                : 'bg-interactive-secondary text-content-secondary'
            )}
          >
            ★
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'rounded px-3 py-1 text-sm transition',
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-interactive-secondary text-content-secondary'
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              'rounded px-3 py-1 text-sm transition',
              selectedCategory === cat.value
                ? 'bg-blue-500 text-white'
                : 'bg-interactive-secondary text-content-secondary'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded border border-dashed border-border py-8 text-center text-content-tertiary">
            No templates found
          </div>
        ) : (
          filtered.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate?.(template.id)}
              className="cursor-pointer rounded border border-border p-3 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-content-primary">{template.name}</h3>
                  <p className="text-xs text-content-tertiary">
                    {template.category}
                  </p>
                </div>
                {template.isPrebuilt && (
                  <span className="whitespace-nowrap rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Built-in
                  </span>
                )}
              </div>
              {template.description && (
                <p className="mt-2 text-xs text-content-secondary">
                  {template.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-content-tertiary">
                  {template.data.sections.length} sections
                </span>
                {template.usageCount > 0 && (
                  <span className="text-xs text-content-tertiary">{template.usageCount}x used</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
