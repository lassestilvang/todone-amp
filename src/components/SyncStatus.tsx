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
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-semantic-warning-light border border-semantic-warning',
          className
        )}
      >
        <WifiOff className="w-4 h-4 text-icon-warning flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-semantic-warning">Offline Mode</p>
          {showDetails && pendingCount > 0 && (
            <p className="text-xs text-semantic-warning">
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
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-semantic-info-light border border-semantic-info',
          className
        )}
      >
        <RefreshCw className="w-4 h-4 text-icon-info flex-shrink-0 animate-spin" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-semantic-info">Syncing Changes</p>
          {showDetails && pendingCount > 0 && (
            <p className="text-xs text-semantic-info">
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
          'flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-semantic-error-light border border-semantic-error',
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="w-4 h-4 text-icon-error flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-semantic-error">Sync Failed</p>
            {showDetails && (
              <p className="text-xs text-semantic-error">
                {pendingCount} item{pendingCount === 1 ? '' : 's'} failed to sync
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => retryFailedOperations()}
          className="flex-shrink-0 px-2 py-1 text-xs font-medium text-semantic-error hover:bg-semantic-error-hover rounded transition-colors"
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
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-semantic-success-light border border-semantic-success',
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-semantic-success">All Synced</p>
          {showDetails && (
            <p className="text-xs text-semantic-success">Last synced {timeAgo}</p>
          )}
        </div>
      </div>
    )
  }

  // No pending changes
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary border border-border',
        className
      )}
    >
      <CheckCircle2 className="w-4 h-4 text-content-tertiary flex-shrink-0" />
      <p className="text-sm text-content-secondary">Ready</p>
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
