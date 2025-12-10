import { describe, it, expect, beforeEach } from 'vitest'
import { useBulkActionStore } from '@/store/bulkActionStore'

describe('bulkActionStore', () => {
  beforeEach(() => {
    useBulkActionStore.getState().clearSelection()
  })

  it('should toggle select', () => {
    useBulkActionStore.getState().toggleSelect('task-1')
    expect(useBulkActionStore.getState().selectedIds.has('task-1')).toBe(true)
    useBulkActionStore.getState().toggleSelect('task-1')
    expect(useBulkActionStore.getState().selectedIds.has('task-1')).toBe(false)
  })

  it('should select multiple tasks', () => {
    useBulkActionStore.getState().selectMultiple(['task-1', 'task-2', 'task-3'])
    const state = useBulkActionStore.getState()
    expect(state.getSelectedCount()).toBe(3)
    expect(state.selectedIds.has('task-1')).toBe(true)
    expect(state.selectedIds.has('task-2')).toBe(true)
    expect(state.selectedIds.has('task-3')).toBe(true)
  })

  it('should clear selection', () => {
    useBulkActionStore.getState().selectMultiple(['task-1', 'task-2'])
    expect(useBulkActionStore.getState().getSelectedCount()).toBe(2)
    useBulkActionStore.getState().clearSelection()
    const state = useBulkActionStore.getState()
    expect(state.getSelectedCount()).toBe(0)
    expect(state.isSelectMode).toBe(false)
  })

  it('should enter and exit select mode', () => {
    const initialState = useBulkActionStore.getState()
    expect(initialState.isSelectMode).toBe(false)
    useBulkActionStore.getState().enterSelectMode()
    expect(useBulkActionStore.getState().isSelectMode).toBe(true)
    useBulkActionStore.getState().exitSelectMode()
    expect(useBulkActionStore.getState().isSelectMode).toBe(false)
  })

  it('should get selected count', () => {
    useBulkActionStore.getState().toggleSelect('task-1')
    useBulkActionStore.getState().toggleSelect('task-2')
    expect(useBulkActionStore.getState().getSelectedCount()).toBe(2)
  })
})
