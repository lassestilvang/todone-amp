import { create } from 'zustand'
import type { Task } from '@/types'

export interface TaskDetailState {
  isOpen: boolean
  selectedTaskId: string | null
  selectedTask: Task | null
  isEditing: boolean
  hasUnsavedChanges: boolean

  openTaskDetail: (taskId: string, task: Task) => void
  closeTaskDetail: () => void
  setIsEditing: (editing: boolean) => void
  setHasUnsavedChanges: (changed: boolean) => void
  updateSelectedTask: (updates: Partial<Task>) => void
}

export const useTaskDetailStore = create<TaskDetailState>((set) => ({
  isOpen: false,
  selectedTaskId: null,
  selectedTask: null,
  isEditing: false,
  hasUnsavedChanges: false,

  openTaskDetail: (taskId: string, task: Task) => {
    set({
      isOpen: true,
      selectedTaskId: taskId,
      selectedTask: { ...task },
      isEditing: false,
      hasUnsavedChanges: false,
    })
  },

  closeTaskDetail: () => {
    set({
      isOpen: false,
      selectedTaskId: null,
      selectedTask: null,
      isEditing: false,
      hasUnsavedChanges: false,
    })
  },

  setIsEditing: (editing: boolean) => {
    set({ isEditing: editing })
  },

  setHasUnsavedChanges: (changed: boolean) => {
    set({ hasUnsavedChanges: changed })
  },

  updateSelectedTask: (updates: Partial<Task>) => {
    set((state) => ({
      selectedTask: state.selectedTask ? { ...state.selectedTask, ...updates } : null,
      hasUnsavedChanges: true,
    }))
  },
}))
