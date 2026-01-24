import { describe, it, expect, beforeEach } from 'bun:test'
import { useUndoRedoStore } from '@/store/undoRedoStore'
import type { Task } from '@/types'

const mockTask: Task = {
  id: 'task-1',
  content: 'Test task',
  priority: 'p3',
  completed: false,
  labels: [],
  reminders: [],
  attachments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
}

describe('undoRedoStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUndoRedoStore.getState().clearDeletedTasks()
  })

  it('should add deleted task', () => {
    useUndoRedoStore.getState().addDeletedTask(mockTask)

    const state = useUndoRedoStore.getState()
    expect(state.deletedTasks).toHaveLength(1)
    expect(state.deletedTasks[0].task.id).toBe('task-1')
  })

  it('should remove deleted task', () => {
    useUndoRedoStore.getState().addDeletedTask(mockTask)
    useUndoRedoStore.getState().removeDeletedTask('task-1')

    const state = useUndoRedoStore.getState()
    expect(state.deletedTasks).toHaveLength(0)
  })

  it('should get deleted task', () => {
    useUndoRedoStore.getState().addDeletedTask(mockTask)

    const deleted = useUndoRedoStore.getState().getDeletedTask('task-1')
    expect(deleted).toBeDefined()
    expect(deleted?.task.id).toBe('task-1')
  })

  it('should maintain LIFO order', () => {
    const task2 = { ...mockTask, id: 'task-2' }

    useUndoRedoStore.getState().addDeletedTask(mockTask)
    useUndoRedoStore.getState().addDeletedTask(task2)

    const state = useUndoRedoStore.getState()
    expect(state.deletedTasks[0].task.id).toBe('task-2')
    expect(state.deletedTasks[1].task.id).toBe('task-1')
  })

  it('should clear all deleted tasks', () => {
    useUndoRedoStore.getState().addDeletedTask(mockTask)
    useUndoRedoStore.getState().addDeletedTask({ ...mockTask, id: 'task-2' })

    useUndoRedoStore.getState().clearDeletedTasks()
    const state = useUndoRedoStore.getState()
    expect(state.deletedTasks).toHaveLength(0)
  })
})
