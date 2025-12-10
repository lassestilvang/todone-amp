import { create } from 'zustand'
import { Task } from '@/types'

interface DeletedTask {
  task: Task
  timestamp: Date
}

interface UndoRedoStore {
  deletedTasks: DeletedTask[]
  addDeletedTask: (task: Task) => void
  removeDeletedTask: (taskId: string) => void
  getDeletedTask: (taskId: string) => DeletedTask | undefined
  clearDeletedTasks: () => void
  deleteExpiredTasks: () => void
}

export const useUndoRedoStore = create<UndoRedoStore>((set, get) => ({
  deletedTasks: [],

  addDeletedTask: (task: Task) => {
    set((state) => ({
      deletedTasks: [{ task, timestamp: new Date() }, ...state.deletedTasks],
    }))

    // Auto-expire deletions after 30 minutes
    setTimeout(() => {
      get().removeDeletedTask(task.id)
    }, 30 * 60 * 1000)
  },

  removeDeletedTask: (taskId: string) => {
    set((state) => ({
      deletedTasks: state.deletedTasks.filter((d) => d.task.id !== taskId),
    }))
  },

  getDeletedTask: (taskId: string) => {
    const state = get()
    return state.deletedTasks.find((d) => d.task.id === taskId)
  },

  clearDeletedTasks: () => {
    set({ deletedTasks: [] })
  },

  deleteExpiredTasks: () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    set((state) => ({
      deletedTasks: state.deletedTasks.filter((d) => d.timestamp > thirtyMinutesAgo),
    }))
  },
}))
