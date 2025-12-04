import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTeamStore } from '@/store/teamStore'

export interface TeamSelectorProps {
  value?: string
  onChange: (teamId: string | null) => void
  disabled?: boolean
  className?: string
  showPersonal?: boolean
}

export function TeamSelector({
  value,
  onChange,
  disabled = false,
  className,
  showPersonal = true,
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { teams } = useTeamStore()
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

  const selectedTeam = teams.find((t) => t.id === value)

  const handleSelect = (teamId: string | null) => {
    onChange(teamId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 rounded-md',
          'text-sm font-medium text-gray-700 bg-white w-full',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <span className="flex items-center gap-2">
          <Users size={16} />
          {selectedTeam ? selectedTeam.name : showPersonal ? 'Personal' : 'Select team'}
        </span>
        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {showPersonal && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
                  'hover:bg-gray-100 transition-colors',
                  !value && 'bg-brand-50 text-brand-700'
                )}
              >
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                Personal
              </button>
            )}

            {teams.length === 0 ? (
              showPersonal ? null : (
                <div className="px-4 py-3 text-sm text-gray-500">No teams</div>
              )
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelect(team.id)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
                    'hover:bg-gray-100 transition-colors',
                    value === team.id && 'bg-brand-50 text-brand-700'
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-brand-500" />
                  {team.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
