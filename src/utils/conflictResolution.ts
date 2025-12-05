/**
 * Conflict resolution strategies for syncing
 */

export type ConflictResolutionStrategy = 'last-write-wins' | 'client-wins' | 'server-wins' | 'manual'

export interface ConflictInfo {
  operationId: string
  entityType: string
  entityId: string
  localVersion: unknown
  remoteVersion: unknown
  timestamp: Date
}

export interface ResolvedConflict {
  operationId: string
  strategy: ConflictResolutionStrategy
  resolvedValue: unknown
  manualReview?: boolean
}

/**
 * Last-write-wins strategy: Uses the most recent change
 */
export const lastWriteWinsResolver = (
  conflict: ConflictInfo
): ResolvedConflict => {
  // In a real app, you'd compare server timestamps
  // For now, use client version as it's more recent locally
  return {
    operationId: conflict.operationId,
    strategy: 'last-write-wins',
    resolvedValue: conflict.localVersion,
  }
}

/**
 * Client-wins strategy: Always prefer local changes
 */
export const clientWinsResolver = (conflict: ConflictInfo): ResolvedConflict => {
  return {
    operationId: conflict.operationId,
    strategy: 'client-wins',
    resolvedValue: conflict.localVersion,
  }
}

/**
 * Server-wins strategy: Always prefer remote changes
 */
export const serverWinsResolver = (conflict: ConflictInfo): ResolvedConflict => {
  return {
    operationId: conflict.operationId,
    strategy: 'server-wins',
    resolvedValue: conflict.remoteVersion,
  }
}

/**
 * Merge strategy for specific field types
 */
export const mergeFieldResolver = (
  conflict: ConflictInfo,
  fieldType: 'string' | 'number' | 'array' | 'object' = 'string'
): ResolvedConflict => {
  let resolvedValue = conflict.localVersion

  if (fieldType === 'array' && Array.isArray(conflict.localVersion) && Array.isArray(conflict.remoteVersion)) {
    // Merge arrays by combining unique elements
    const merged = [...new Set([...conflict.localVersion, ...conflict.remoteVersion])]
    resolvedValue = merged
  } else if (fieldType === 'object' && typeof conflict.localVersion === 'object' && typeof conflict.remoteVersion === 'object') {
    // Shallow merge objects (remote overwrites)
    resolvedValue = {
      ...conflict.remoteVersion,
      ...conflict.localVersion,
    }
  } else {
    // For strings/numbers, use last-write-wins
    resolvedValue = conflict.localVersion
  }

  return {
    operationId: conflict.operationId,
    strategy: 'last-write-wins',
    resolvedValue,
  }
}

/**
 * Detect if there's a conflict between local and remote changes
 */
export const detectConflict = (
  local: unknown,
  remote: unknown,
  lastKnownValue: unknown
): boolean => {
  // No conflict if either side hasn't changed
  if (JSON.stringify(local) === JSON.stringify(lastKnownValue)) return false
  if (JSON.stringify(remote) === JSON.stringify(lastKnownValue)) return false

  // Conflict if both sides changed differently
  return JSON.stringify(local) !== JSON.stringify(remote)
}

/**
 * Resolve conflicts using specified strategy
 */
export const resolveConflict = (
  conflict: ConflictInfo,
  strategy: ConflictResolutionStrategy = 'last-write-wins'
): ResolvedConflict => {
  switch (strategy) {
    case 'last-write-wins':
      return lastWriteWinsResolver(conflict)
    case 'client-wins':
      return clientWinsResolver(conflict)
    case 'server-wins':
      return serverWinsResolver(conflict)
    case 'manual':
      return {
        operationId: conflict.operationId,
        strategy: 'manual',
        resolvedValue: conflict.localVersion,
        manualReview: true,
      }
    default:
      return lastWriteWinsResolver(conflict)
  }
}
