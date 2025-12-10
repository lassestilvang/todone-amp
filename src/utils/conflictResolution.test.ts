import { describe, it, expect } from 'vitest'
import {
  lastWriteWinsResolver,
  clientWinsResolver,
  serverWinsResolver,
  mergeFieldResolver,
  detectConflict,
  resolveConflict,
  type ConflictInfo,
  type ConflictResolutionStrategy,
} from './conflictResolution'

describe('Conflict Resolution', () => {
  const createConflict = (overrides?: Partial<ConflictInfo>): ConflictInfo => ({
    operationId: 'op-1',
    entityType: 'task',
    entityId: 'task-1',
    localVersion: 'local-value',
    remoteVersion: 'remote-value',
    timestamp: new Date(),
    ...overrides,
  })

  describe('lastWriteWinsResolver', () => {
    it('should resolve to local version (most recent)', () => {
      const conflict = createConflict({
        localVersion: 'updated locally',
        remoteVersion: 'updated remotely',
      })

      const result = lastWriteWinsResolver(conflict)

      expect(result.strategy).toBe('last-write-wins')
      expect(result.resolvedValue).toBe('updated locally')
      expect(result.operationId).toBe('op-1')
    })

    it('should preserve operation ID', () => {
      const conflict = createConflict({ operationId: 'unique-op-123' })
      const result = lastWriteWinsResolver(conflict)
      expect(result.operationId).toBe('unique-op-123')
    })
  })

  describe('clientWinsResolver', () => {
    it('should always resolve to local version', () => {
      const conflict = createConflict({
        localVersion: 'client-value',
        remoteVersion: 'server-value',
      })

      const result = clientWinsResolver(conflict)

      expect(result.strategy).toBe('client-wins')
      expect(result.resolvedValue).toBe('client-value')
    })

    it('should work with any data type', () => {
      const conflict = createConflict({
        localVersion: { name: 'local', id: 1 },
        remoteVersion: { name: 'remote', id: 2 },
      })

      const result = clientWinsResolver(conflict)

      expect(result.resolvedValue).toEqual({ name: 'local', id: 1 })
    })
  })

  describe('serverWinsResolver', () => {
    it('should always resolve to remote version', () => {
      const conflict = createConflict({
        localVersion: 'client-value',
        remoteVersion: 'server-value',
      })

      const result = serverWinsResolver(conflict)

      expect(result.strategy).toBe('server-wins')
      expect(result.resolvedValue).toBe('server-value')
    })

    it('should work with any data type', () => {
      const conflict = createConflict({
        localVersion: { name: 'local' },
        remoteVersion: { name: 'remote' },
      })

      const result = serverWinsResolver(conflict)

      expect(result.resolvedValue).toEqual({ name: 'remote' })
    })
  })

  describe('mergeFieldResolver', () => {
    it('should merge arrays by combining unique elements', () => {
      const conflict = createConflict({
        localVersion: ['tag1', 'tag2'],
        remoteVersion: ['tag2', 'tag3'],
      })

      const result = mergeFieldResolver(conflict, 'array')

      expect(result.resolvedValue).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should merge objects with local winning on conflicts', () => {
      const conflict = createConflict({
        localVersion: { name: 'Local', status: 'active' },
        remoteVersion: { name: 'Remote', priority: 'high' },
      })

      const result = mergeFieldResolver(conflict, 'object')

      expect(result.resolvedValue).toEqual({
        name: 'Local',
        status: 'active',
        priority: 'high',
      })
    })

    it('should use client version for string type', () => {
      const conflict = createConflict({
        localVersion: 'local-string',
        remoteVersion: 'remote-string',
      })

      const result = mergeFieldResolver(conflict, 'string')

      expect(result.resolvedValue).toBe('local-string')
    })

    it('should use client version for number type', () => {
      const conflict = createConflict({
        localVersion: 42,
        remoteVersion: 100,
      })

      const result = mergeFieldResolver(conflict, 'number')

      expect(result.resolvedValue).toBe(42)
    })

    it('should default to string strategy when type not specified', () => {
      const conflict = createConflict({
        localVersion: 'local',
        remoteVersion: 'remote',
      })

      const result = mergeFieldResolver(conflict)

      expect(result.resolvedValue).toBe('local')
    })
  })

  describe('detectConflict', () => {
    it('should return false if local has not changed', () => {
      const lastKnown = 'original'
      const local = 'original'
      const remote = 'updated'

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(false)
    })

    it('should return false if remote has not changed', () => {
      const lastKnown = 'original'
      const local = 'updated'
      const remote = 'original'

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(false)
    })

    it('should return false if neither has changed', () => {
      const lastKnown = 'original'
      const local = 'original'
      const remote = 'original'

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(false)
    })

    it('should return true if both have changed differently', () => {
      const lastKnown = 'original'
      const local = 'local-update'
      const remote = 'remote-update'

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(true)
    })

    it('should return false if both changed to the same value', () => {
      const lastKnown = 'original'
      const local = 'same-update'
      const remote = 'same-update'

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(false)
    })

    it('should work with complex objects', () => {
      const lastKnown = { id: 1, name: 'test' }
      const local = { id: 1, name: 'local' }
      const remote = { id: 1, name: 'remote' }

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(true)
    })

    it('should work with arrays', () => {
      const lastKnown = ['item1', 'item2']
      const local = ['item1', 'item2', 'item3']
      const remote = ['item1', 'item2', 'item4']

      const hasConflict = detectConflict(local, remote, lastKnown)

      expect(hasConflict).toBe(true)
    })
  })

  describe('resolveConflict', () => {
    it('should use last-write-wins strategy by default', () => {
      const conflict = createConflict({
        localVersion: 'local',
        remoteVersion: 'remote',
      })

      const result = resolveConflict(conflict)

      expect(result.strategy).toBe('last-write-wins')
      expect(result.resolvedValue).toBe('local')
    })

    it('should resolve using client-wins strategy', () => {
      const conflict = createConflict({
        localVersion: 'local',
        remoteVersion: 'remote',
      })

      const result = resolveConflict(conflict, 'client-wins')

      expect(result.strategy).toBe('client-wins')
      expect(result.resolvedValue).toBe('local')
    })

    it('should resolve using server-wins strategy', () => {
      const conflict = createConflict({
        localVersion: 'local',
        remoteVersion: 'remote',
      })

      const result = resolveConflict(conflict, 'server-wins')

      expect(result.strategy).toBe('server-wins')
      expect(result.resolvedValue).toBe('remote')
    })

    it('should resolve using manual strategy and set manualReview flag', () => {
      const conflict = createConflict({
        localVersion: 'local',
        remoteVersion: 'remote',
      })

      const result = resolveConflict(conflict, 'manual')

      expect(result.strategy).toBe('manual')
      expect(result.manualReview).toBe(true)
    })

    it('should default to last-write-wins for unknown strategy', () => {
      const conflict = createConflict()
      const result = resolveConflict(conflict, 'unknown' as ConflictResolutionStrategy)

      expect(result.strategy).toBe('last-write-wins')
    })

    it('should preserve operation ID in resolved conflict', () => {
      const conflict = createConflict({ operationId: 'op-special-123' })
      const result = resolveConflict(conflict, 'client-wins')

      expect(result.operationId).toBe('op-special-123')
    })
  })
})
