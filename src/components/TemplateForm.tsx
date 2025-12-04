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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Template Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Weekly Project Planning"
          required
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      {/* Description field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this template used for?"
          rows={3}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      {/* Category field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TemplateCategory)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Info */}
      <div className="rounded bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        Template will be created from current project structure when you apply it.
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Template'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
