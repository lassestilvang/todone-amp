import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { Task } from '@/types'

interface TaskConflict {
  id: string
  taskId: string
  conflictType: 'concurrent_edit' | 'concurrent_delete' | 'concurrent_update'
  localVersion: Task
  remoteVersion: Task
  conflictAt: Date
}

interface ConflictResolverProps {
  conflicts: TaskConflict[]
  onResolve: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => Promise<void>
  className?: string
}

export function ConflictResolver({
  conflicts,
  onResolve,
  className = '',
}: ConflictResolverProps) {
  const [resolving, setResolving] = useState<string | null>(null)
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, 'local' | 'remote' | 'merge'>>({})

  if (conflicts.length === 0) {
    return null
  }

  const handleResolve = async (conflictId: string) => {
    const resolution = selectedResolutions[conflictId] || 'remote'
    setResolving(conflictId)
    try {
      await onResolve(conflictId, resolution)
    } finally {
      setResolving(null)
    }
  }

  return (
    <div className={cn('space-y-3 rounded border border-semantic-error bg-semantic-error-light p-4', className)}>
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <h3 className="font-medium text-semantic-error">
          {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
        </h3>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <div key={conflict.id} className="rounded border border-semantic-error bg-surface-primary p-3">
            {/* Conflict header */}
            <div className="mb-3">
              <p className="font-medium text-content-primary">
                {getConflictTypeLabel(conflict.conflictType)}
              </p>
              <p className="text-xs text-content-secondary">
                Task: {conflict.localVersion.content.substring(0, 50)}...
              </p>
            </div>

            {/* Conflict comparison */}
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {/* Local version */}
              <div className="rounded border border-semantic-info bg-semantic-info-light p-2">
                <p className="mb-2 text-xs font-medium text-semantic-info">Your Changes</p>
                <div className="space-y-1 text-xs text-content-secondary">
                  <p>
                    <span className="font-medium">Content:</span> {conflict.localVersion.content.substring(0, 40)}...
                  </p>
                  <p>
                    <span className="font-medium">Priority:</span> {conflict.localVersion.priority || 'None'}
                  </p>
                  {conflict.localVersion.completed && (
                    <p className="text-semantic-success">✓ Completed</p>
                  )}
                </div>
              </div>

              {/* Remote version */}
              <div className="rounded border border-accent-orange bg-accent-orange-subtle p-2">
                <p className="mb-2 text-xs font-medium text-accent-orange">Team Changes</p>
                <div className="space-y-1 text-xs text-content-secondary">
                  <p>
                    <span className="font-medium">Content:</span> {conflict.remoteVersion.content.substring(0, 40)}...
                  </p>
                  <p>
                    <span className="font-medium">Priority:</span> {conflict.remoteVersion.priority || 'None'}
                  </p>
                  {conflict.remoteVersion.completed && (
                    <p className="text-semantic-success">✓ Completed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resolution options */}
            <div className="mb-3 space-y-2">
              <p className="text-xs font-medium text-content-secondary">Resolve as:</p>
              <div className="flex gap-2">
                {(['local', 'remote', 'merge'] as const).map((resolution) => (
                  <button
                    key={`${conflict.id}-${resolution}`}
                    onClick={() => setSelectedResolutions({ ...selectedResolutions, [conflict.id]: resolution })}
                    className={cn(
                      'flex-1 rounded px-2 py-1 text-xs font-medium transition',
                      selectedResolutions[conflict.id] === resolution
                        ? resolution === 'local'
                          ? 'bg-interactive-primary text-content-inverse hover:bg-interactive-primary-hover'
                          : resolution === 'remote'
                            ? 'bg-accent-orange text-white'
                            : 'bg-accent-purple text-white'
                        : 'border border-border text-content-secondary hover:border-border'
                    )}
                  >
                    {resolution === 'local' && '👤 My Changes'}
                    {resolution === 'remote' && '👥 Team Changes'}
                    {resolution === 'merge' && '🔀 Merge Both'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => handleResolve(conflict.id)}
              disabled={resolving === conflict.id}
              className="w-full rounded bg-semantic-error px-3 py-1.5 text-xs font-medium text-white transition hover:bg-semantic-error-hover disabled:opacity-50"
            >
              {resolving === conflict.id ? 'Resolving...' : 'Resolve Conflict'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function getConflictTypeLabel(type: TaskConflict['conflictType']): string {
  const labels: Record<string, string> = {
    concurrent_edit: 'Concurrent Edit Conflict',
    concurrent_delete: 'Concurrent Delete Conflict',
    concurrent_update: 'Concurrent Update Conflict',
  }
  return labels[type] || type
}
