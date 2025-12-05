import React from 'react'
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useSyncStore } from '@/store/syncStore'
import clsx from 'clsx'

export interface SyncStatusProps {
  className?: string
  showDetails?: boolean
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ className = '', showDetails = false }) => {
  const { isOnline, isSyncing, pendingCount, lastSyncAt, hasErrors } = useOfflineStatus()
  const { retryFailedOperations } = useSyncStore()

  // Offline status
  if (!isOnline) {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700',
          className
        )}
      >
        <WifiOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-100">Offline Mode</p>
          {showDetails && pendingCount > 0 && (
            <p className="text-xs text-yellow-700 dark:text-yellow-200">
              {pendingCount} change{pendingCount === 1 ? '' : 's'} waiting to sync
            </p>
          )}
        </div>
      </div>
    )
  }

  // Syncing status
  if (isSyncing) {
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700',
          className
        )}
      >
        <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-100">Syncing Changes</p>
          {showDetails && pendingCount > 0 && (
            <p className="text-xs text-blue-700 dark:text-blue-200">
              {pendingCount} item{pendingCount === 1 ? '' : 's'} syncing...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Error status
  if (hasErrors && pendingCount > 0) {
    return (
      <div
        className={clsx(
          'flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700',
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-100">Sync Failed</p>
            {showDetails && (
              <p className="text-xs text-red-700 dark:text-red-200">
                {pendingCount} item{pendingCount === 1 ? '' : 's'} failed to sync
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => retryFailedOperations()}
          className="flex-shrink-0 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Success/synced status
  if (lastSyncAt && isOnline && pendingCount === 0) {
    const timeAgo = getTimeAgo(lastSyncAt)
    return (
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700',
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 dark:text-green-100">All Synced</p>
          {showDetails && (
            <p className="text-xs text-green-700 dark:text-green-200">Last synced {timeAgo}</p>
          )}
        </div>
      </div>
    )
  }

  // No pending changes
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <CheckCircle2 className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Ready</p>
    </div>
  )
}

/**
 * Helper function to format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}
