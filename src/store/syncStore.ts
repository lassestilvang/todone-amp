import { create } from 'zustand'
import { db } from '@/db/database'

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
}

const MAX_RETRIES = 3
// const SYNC_LOG_RETENTION_DAYS = 30

export const useSyncStore = create<SyncState & SyncActions>((set, get) => {
  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => get().setOnlineStatus(true))
    window.addEventListener('offline', () => get().setOnlineStatus(false))
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
        id: `pending-${Date.now()}`,
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

      set({ isSyncing: true })

      try {
        for (const operation of state.pendingOperations) {
          try {
            // Simulate API call - in real app, this would call your backend
            // For now, we'll just mark it as synced after a delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            await get().markOperationSynced(operation.id)

            // Log success
            const log: SyncLog = {
              id: `log-${Date.now()}`,
              operation: `${operation.type} ${operation.entityType}`,
              status: 'success',
              timestamp: new Date(),
            }

            set((state) => ({
              syncLogs: [...state.syncLogs, log],
            }))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sync failed'

            // Increment retry count
            const updatedOps = get().pendingOperations.map((op) =>
              op.id === operation.id ? { ...op, retries: op.retries + 1, lastError: errorMessage } : op
            )

            // Log failure
            const log: SyncLog = {
              id: `log-${Date.now()}`,
              operation: `${operation.type} ${operation.entityType}`,
              status: operation.retries >= MAX_RETRIES ? 'failed' : 'pending',
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

      set({
        pendingOperations: state.pendingOperations.map((op) => ({
          ...op,
          retries: op.retries,
        })),
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
  }
})
