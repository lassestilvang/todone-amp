import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SectionSelectorProps {
  projectId?: string
  value?: string
  onChange: (sectionId: string | undefined) => void
  disabled?: boolean
  className?: string
}

export function SectionSelector({
  projectId,
  value,
  onChange,
  disabled = false,
  className,
}: SectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // For now, sections are not fully implemented, so we show a placeholder
  // This component is prepared for Phase 2+ when sections CRUD is added
  const handleSelect = (sectionId: string) => {
    onChange(sectionId === value ? undefined : sectionId)
    setIsOpen(false)
  }

  if (!projectId) {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          disabled={true}
          className={cn(
            'flex items-center justify-between gap-2 px-3 py-2 border border-border rounded-md',
            'text-sm font-medium text-content-tertiary bg-surface-secondary w-full',
            'cursor-not-allowed'
          )}
        >
          <span>Select a project first</span>
          <ChevronDown size={16} />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 border border-border rounded-md',
          'text-sm font-medium text-content-secondary bg-surface-primary w-full',
          'hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-focus',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <span>{value ? `Section: ${value}` : 'No section'}</span>
        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface-primary border border-border rounded-lg shadow-lg">
          <div className="max-h-48 overflow-y-auto p-2">
            <div className="text-xs text-content-tertiary px-2 py-1">
              Sections coming soon. Currently only one default section per project.
            </div>
            <button
              type="button"
              onClick={() => handleSelect('default')}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded',
                'hover:bg-surface-tertiary transition-colors',
                value === 'default' && 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
              )}
            >
              Default Section
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
