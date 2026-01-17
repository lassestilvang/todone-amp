import React from 'react'
import { WifiOff } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { useSyncStore } from '@/store/syncStore'
import { cn } from '@/utils/cn'

export interface OfflineIndicatorProps {
  className?: string
  position?: 'top' | 'bottom'
}

/**
 * Displays online/offline status indicator
 * Shows pending operations when offline
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  position = 'bottom',
}) => {
  const { isOnline } = usePWA()
  const pendingOperations = useSyncStore((state) => state.pendingOperations)
  const isSyncing = useSyncStore((state) => state.isSyncing)

  if (isOnline) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed left-4 right-4 sm:left-6 sm:max-w-sm',
        position === 'top' ? 'top-20 sm:top-6' : 'bottom-4 sm:bottom-6',
        'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4',
        'flex items-start gap-3',
        'z-30',
        'animate-in slide-in-from-bottom-5 duration-300',
        className
      )}
    >
      <WifiOff className="w-5 h-5 text-icon-error flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">You're offline</h3>
        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
          {pendingOperations.length > 0
            ? isSyncing
              ? 'Syncing your changes...'
              : `${pendingOperations.length} pending change${pendingOperations.length > 1 ? 's' : ''} will sync when back online`
            : 'Changes will sync when you reconnect'}
        </p>
      </div>
      <div className="flex-shrink-0">
        <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
      </div>
    </div>
  )
}
