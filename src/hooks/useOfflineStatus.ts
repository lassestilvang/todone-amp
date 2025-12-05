import { useEffect, useState } from 'react'
import { useSyncStore } from '@/store/syncStore'

export interface OfflineStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncAt?: Date
  hasErrors: boolean
}

/**
 * Hook to get offline/sync status
 * Useful for displaying sync indicators and offline warnings
 */
export const useOfflineStatus = (): OfflineStatus => {
  const { isOnline, isSyncing, pendingOperations, lastSyncAt, error } = useSyncStore()
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: undefined,
    hasErrors: false,
  })

  useEffect(() => {
    setStatus({
      isOnline,
      isSyncing,
      pendingCount: pendingOperations.length,
      lastSyncAt,
      hasErrors: !!error || pendingOperations.some((op) => op.lastError),
    })
  }, [isOnline, isSyncing, pendingOperations, lastSyncAt, error])

  return status
}
