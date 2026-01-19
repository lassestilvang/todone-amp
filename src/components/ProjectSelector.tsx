import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useProjectStore } from '@/store/projectStore'

export interface ProjectSelectorProps {
  value?: string
  onChange: (projectId: string | undefined) => void
  disabled?: boolean
  className?: string
}

export function ProjectSelector({ value, onChange, disabled = false, className }: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const projects = useProjectStore((state) => state.projects)
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

  const selectedProject = projects.find((p) => p.id === value)

  const handleSelect = (projectId: string) => {
    onChange(projectId === value ? undefined : projectId)
    setIsOpen(false)
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
        <span className="flex items-center gap-2">
          {selectedProject && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedProject.color }}
            />
          )}
          {selectedProject ? selectedProject.name : 'Select project'}
        </span>
        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface-primary border border-border rounded-lg shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="px-4 py-3 text-sm text-content-tertiary">No projects</div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelect(project.id)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
                    'hover:bg-surface-tertiary transition-colors',
                    value === project.id && 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  )}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                  {project.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
