import { useState } from 'react'
import { useTemplateStore } from '@/store/templateStore'
import { useAuthStore } from '@/store/authStore'
import type { TemplateCategory, TemplateData } from '@/types'
import { cn } from '@/utils/cn'

interface TemplateFormProps {
  onSuccess?: (templateId: string) => void
  onCancel?: () => void
  className?: string
  initialData?: {
    name: string
    description?: string
    category: TemplateCategory
    data: TemplateData
  }
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
  { value: 'custom', label: 'Custom' },
]

export function TemplateForm({
  onSuccess,
  onCancel,
  className,
  initialData,
}: TemplateFormProps) {
  const { user } = useAuthStore()
  const { createTemplate } = useTemplateStore()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [category, setCategory] = useState<TemplateCategory>(initialData?.category || 'custom')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return

    setIsLoading(true)
    try {
      const template = await createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        data: initialData?.data || { sections: [] },
        isPrebuilt: false,
        ownerId: user.id,
        usageCount: 0,
      })

      onSuccess?.(template.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Name field */}
      <div>
        <label className="block text-sm font-medium text-content-secondary">
          Template Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Weekly Project Planning"
          required
          className="mt-1 w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-content-primary placeholder-input-placeholder"
        />
      </div>

      {/* Description field */}
      <div>
        <label className="block text-sm font-medium text-content-secondary">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this template used for?"
          rows={3}
          className="mt-1 w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-content-primary placeholder-input-placeholder"
        />
      </div>

      {/* Category field */}
      <div>
        <label className="block text-sm font-medium text-content-secondary">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TemplateCategory)}
          className="mt-1 w-full rounded border border-input-border bg-input-bg px-3 py-2 text-sm text-content-primary"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Info */}
      <div className="rounded bg-info-light p-3 text-sm text-info-dark">
        Template will be created from current project structure when you apply it.
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded bg-interactive-primary px-4 py-2 text-sm font-medium text-content-inverse transition hover:bg-interactive-primary-hover disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Template'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-border bg-surface-primary px-4 py-2 text-sm text-content-primary hover:bg-surface-tertiary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
