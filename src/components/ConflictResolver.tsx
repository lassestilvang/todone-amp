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
    <div className={cn('space-y-3 rounded border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20', className)}>
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <h3 className="font-medium text-red-900 dark:text-red-200">
          {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
        </h3>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <div key={conflict.id} className="rounded border border-red-300 bg-white p-3 dark:border-red-800 dark:bg-gray-900">
            {/* Conflict header */}
            <div className="mb-3">
              <p className="font-medium text-gray-900 dark:text-white">
                {getConflictTypeLabel(conflict.conflictType)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Task: {conflict.localVersion.content.substring(0, 50)}...
              </p>
            </div>

            {/* Conflict comparison */}
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {/* Local version */}
              <div className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-900/30">
                <p className="mb-2 text-xs font-medium text-blue-900 dark:text-blue-200">Your Changes</p>
                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-medium">Content:</span> {conflict.localVersion.content.substring(0, 40)}...
                  </p>
                  <p>
                    <span className="font-medium">Priority:</span> {conflict.localVersion.priority || 'None'}
                  </p>
                  {conflict.localVersion.completed && (
                    <p className="text-green-700 dark:text-green-200">✓ Completed</p>
                  )}
                </div>
              </div>

              {/* Remote version */}
              <div className="rounded border border-orange-200 bg-orange-50 p-2 dark:border-orange-900 dark:bg-orange-900/30">
                <p className="mb-2 text-xs font-medium text-orange-900 dark:text-orange-200">Team Changes</p>
                <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-medium">Content:</span> {conflict.remoteVersion.content.substring(0, 40)}...
                  </p>
                  <p>
                    <span className="font-medium">Priority:</span> {conflict.remoteVersion.priority || 'None'}
                  </p>
                  {conflict.remoteVersion.completed && (
                    <p className="text-green-700 dark:text-green-200">✓ Completed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resolution options */}
            <div className="mb-3 space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Resolve as:</p>
              <div className="flex gap-2">
                {(['local', 'remote', 'merge'] as const).map((resolution) => (
                  <button
                    key={`${conflict.id}-${resolution}`}
                    onClick={() => setSelectedResolutions({ ...selectedResolutions, [conflict.id]: resolution })}
                    className={cn(
                      'flex-1 rounded px-2 py-1 text-xs font-medium transition',
                      selectedResolutions[conflict.id] === resolution
                        ? resolution === 'local'
                          ? 'bg-blue-500 text-white'
                          : resolution === 'remote'
                            ? 'bg-orange-500 text-white'
                            : 'bg-purple-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
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
              className="w-full rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
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
