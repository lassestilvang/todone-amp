import React, { useState, useEffect } from 'react'
import { X, Lightbulb, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface FeatureNudge {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  dismissible?: boolean
}

interface FeatureDiscoveryProps {
  nudges: FeatureNudge[]
  maxVisible?: number
  onDismiss?: (nudgeId: string) => void
}

/**
 * Feature discovery nudges component
 * Shows helpful tips and feature hints to users
 */
export const FeatureDiscovery: React.FC<FeatureDiscoveryProps> = ({
  nudges,
  maxVisible = 2,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [visibleNudges, setVisibleNudges] = useState<FeatureNudge[]>([])

  useEffect(() => {
    // Load dismissed nudges from localStorage
    const stored = localStorage.getItem('dismissed-feature-nudges')
    if (stored) {
      setDismissed(new Set(JSON.parse(stored)))
    }
  }, [])

  useEffect(() => {
    // Filter and limit visible nudges
    const visible = nudges
      .filter((n) => !dismissed.has(n.id))
      .slice(0, maxVisible)
    setVisibleNudges(visible)
  }, [nudges, dismissed, maxVisible])

  const handleDismiss = (nudgeId: string) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(nudgeId)
    setDismissed(newDismissed)

    // Persist to localStorage
    localStorage.setItem('dismissed-feature-nudges', JSON.stringify(Array.from(newDismissed)))

    onDismiss?.(nudgeId)
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-40 max-w-sm pointer-events-none">
      {visibleNudges.map((nudge) => (
        <FeatureNudgeCard key={nudge.id} nudge={nudge} onDismiss={handleDismiss} />
      ))}
    </div>
  )
}

interface FeatureNudgeCardProps {
  nudge: FeatureNudge
  onDismiss: (id: string) => void
}

const FeatureNudgeCard: React.FC<FeatureNudgeCardProps> = ({ nudge, onDismiss }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  const handleDismiss = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      onDismiss(nudge.id)
    }, 300)
  }

  return (
    <div
      className={cn(
        'bg-surface-primary border border-border rounded-lg shadow-lg p-4 pointer-events-auto',
        'transition-all duration-300 ease-in-out',
        isAnimatingOut && 'opacity-0 translate-x-4 scale-95'
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 flex items-start pt-0.5">
          {nudge.icon ? (
            <div className="text-semantic-info">{nudge.icon}</div>
          ) : (
            <Lightbulb size={20} className="text-amber-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-content-primary">{nudge.title}</h3>
          <p className="text-sm text-content-secondary mt-1">{nudge.description}</p>

          {nudge.action && (
            <button
              onClick={nudge.action.onClick}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-semantic-info hover:text-semantic-info group"
            >
              {nudge.action.label}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {nudge.dismissible !== false && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-content-tertiary hover:text-content-secondary transition-colors"
            aria-label={`Dismiss ${nudge.title}`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}


