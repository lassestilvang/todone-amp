import { create } from 'zustand'
import { db } from '@/db/database'
import type { ConflictResolutionStrategy } from '@/utils/conflictResolution'

export interface PendingOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entityType: 'task' | 'project' | 'section' | 'label'
  entityId: string
  data: unknown
  createdAt: Date
  retries: number
  lastError?: string
}

export interface SyncLog {
  id: string
  operation: string
  status: 'success' | 'failed' | 'pending'
  timestamp: Date
  error?: string
}

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingOperations: PendingOperation[]
  syncLogs: SyncLog[]
  lastSyncAt?: Date
  error: string | null
}

interface SyncActions {
  initializeSync: () => Promise<void>
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'createdAt' | 'retries'>) => Promise<void>
  syncPendingOperations: () => Promise<void>
  markOperationSynced: (operationId: string) => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
  getSyncStatus: () => SyncState
  clearOldLogs: (daysOld: number) => Promise<void>
  retryFailedOperations: () => Promise<void>
  detectAndResolveConflicts: (strategy?: ConflictResolutionStrategy) => Promise<void>
  updateSyncStatus: (entityType: string, entityId: string, status: 'synced' | 'pending' | 'syncing' | 'error') => Promise<void>
}

const MAX_RETRIES = 3
const SYNC_LOG_RETENTION_DAYS = 30
const BACKOFF_MULTIPLIER = 2
const INITIAL_BACKOFF_MS = 1000

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (retryCount: number): number => {
  return INITIAL_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, retryCount)
}

/**
 * Add jitter to prevent thundering herd
 */
const addJitter = (ms: number): number => {
  return ms + Math.random() * 1000
}

export const useSyncStore = create<SyncState & SyncActions>((set, get) => {
  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      get().setOnlineStatus(true)
    })
    window.addEventListener('offline', () => {
      get().setOnlineStatus(false)
    })
  }

  return {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingOperations: [],
    syncLogs: [],
    lastSyncAt: undefined,
    error: null,

    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline })
      if (isOnline) {
        // Automatically sync when coming online
        get().syncPendingOperations()
      }
    },

    initializeSync: async () => {
      try {
        const operations = await db.syncQueue?.toArray()
        const pendingOps = operations
          ?.filter((op) => !op.synced)
          .map((op) => ({
            id: op.id,
            type: op.action,
            entityType: op.entityType,
            entityId: op.entityId,
            data: op.data,
            createdAt: op.timestamp,
            retries: 0,
          })) as PendingOperation[]

        set({
          pendingOperations: pendingOps || [],
        })

        // Clean up old sync logs
        await get().clearOldLogs(SYNC_LOG_RETENTION_DAYS)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize sync'
        set({ error: errorMessage })
      }
    },

    addPendingOperation: async (
      operation: Omit<PendingOperation, 'id' | 'createdAt' | 'retries'>
    ) => {
      const newOp: PendingOperation = {
        ...operation,
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date(),
        retries: 0,
      }

      try {
        // Add to database queue
        await db.syncQueue?.add({
          id: newOp.id,
          action: newOp.type,
          entityType: newOp.entityType,
          entityId: newOp.entityId,
          data: newOp.data,
          timestamp: newOp.createdAt,
          synced: false,
        })

        // Update state
        set((state) => ({
          pendingOperations: [...state.pendingOperations, newOp],
          error: null,
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add pending operation'
        set({ error: errorMessage })
      }
    },

    markOperationSynced: async (operationId: string) => {
      try {
        await db.syncQueue?.update(operationId, { synced: true })

        set((state) => ({
          pendingOperations: state.pendingOperations.filter((op) => op.id !== operationId),
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to mark operation as synced'
        set({ error: errorMessage })
      }
    },

    syncPendingOperations: async () => {
      const state = get()

      if (!state.isOnline || state.isSyncing || state.pendingOperations.length === 0) {
        return
      }

      set({ isSyncing: true, error: null })

      try {
        for (const operation of state.pendingOperations) {
          try {
            // Calculate backoff delay based on retry count
            const backoffDelay = getBackoffDelay(operation.retries)
            const delayWithJitter = addJitter(backoffDelay)

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delayWithJitter))

            // Simulate API call - in real app, this would call your backend
            // For now, we'll just mark it as synced after a delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            await get().markOperationSynced(operation.id)

            // Log success
            const log: SyncLog = {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              operation: `${operation.type} ${operation.entityType}`,
              status: 'success',
              timestamp: new Date(),
            }

            set((state) => ({
              syncLogs: [...state.syncLogs, log],
            }))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sync failed'
            const currentOp = get().pendingOperations.find((op) => op.id === operation.id)

            if (!currentOp) return

            const newRetryCount = currentOp.retries + 1
            const shouldGiveUp = newRetryCount >= MAX_RETRIES

            // Update operation with retry info
            const updatedOps = get().pendingOperations.map((op) =>
              op.id === operation.id
                ? { ...op, retries: newRetryCount, lastError: errorMessage }
                : op
            )

            // Log failure
            const log: SyncLog = {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              operation: `${operation.type} ${operation.entityType}`,
              status: shouldGiveUp ? 'failed' : 'pending',
              timestamp: new Date(),
              error: errorMessage,
            }

            set({
              pendingOperations: updatedOps,
              syncLogs: [...get().syncLogs, log],
            })
          }
        }

        set({
          isSyncing: false,
          lastSyncAt: new Date(),
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sync failed'
        set({ error: errorMessage, isSyncing: false })
      }
    },

    retryFailedOperations: async () => {
      const state = get()
      const failedOps = state.pendingOperations.filter((op) => op.retries < MAX_RETRIES)

      if (failedOps.length === 0) return

      // Reset retry count for retry attempt
      set({
        pendingOperations: state.pendingOperations.map((op) =>
          op.retries < MAX_RETRIES ? { ...op, retries: Math.max(0, op.retries - 1) } : op
        ),
      })

      await get().syncPendingOperations()
    },

    getSyncStatus: () => {
      return {
        isOnline: get().isOnline,
        isSyncing: get().isSyncing,
        pendingOperations: get().pendingOperations,
        syncLogs: get().syncLogs,
        lastSyncAt: get().lastSyncAt,
        error: get().error,
      }
    },

    clearOldLogs: async (daysOld: number) => {
      try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysOld)

        set((state) => ({
          syncLogs: state.syncLogs.filter((log) => log.timestamp > cutoffDate),
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to clear logs'
        set({ error: errorMessage })
      }
    },

    detectAndResolveConflicts: async () => {
      try {
        set({ error: null })

        // In a real implementation, you would:
        // 1. Compare local vs remote versions
        // 2. Detect conflicts using detectConflict()
        // 3. Resolve using resolveConflict() with the strategy
        // 4. Apply the resolved values

        // For now, log the capability
        const log: SyncLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          operation: 'conflict_detection',
          status: 'success',
          timestamp: new Date(),
        }

        set((state) => ({
          syncLogs: [...state.syncLogs, log],
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to detect conflicts'
        set({ error: errorMessage })
      }
    },

    updateSyncStatus: async (entityType: string, entityId: string, status: 'synced' | 'pending' | 'syncing' | 'error') => {
      try {
        // Update the syncStatus field on the entity
        if (entityType === 'task') {
          const task = await db.tasks?.get(entityId)
          if (task) {
            await db.tasks?.update(entityId, { syncStatus: status })
          }
        } else if (entityType === 'project') {
          const project = await db.projects?.get(entityId)
          if (project) {
            await db.projects?.update(entityId, { syncStatus: status })
          }
        } else if (entityType === 'section') {
          const section = await db.sections?.get(entityId)
          if (section) {
            await db.sections?.update(entityId, { syncStatus: status })
          }
        } else if (entityType === 'label') {
          const label = await db.labels?.get(entityId)
          if (label) {
            await db.labels?.update(entityId, { syncStatus: status })
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update sync status'
        set({ error: errorMessage })
      }
    },
  }
})
