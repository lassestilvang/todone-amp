import { create } from 'zustand'
import { useTaskStore } from '@/store/taskStore'

interface BulkActionState {
  selectedIds: Set<string>
  isSelectMode: boolean
  // Actions
  toggleSelect: (id: string) => void
  selectMultiple: (ids: string[]) => void
  clearSelection: () => void
  enterSelectMode: () => void
  exitSelectMode: () => void
  deleteSelected: () => Promise<void>
  completeSelected: () => Promise<void>
  updateSelectedPriority: (priority: 'p1' | 'p2' | 'p3' | 'p4' | null) => Promise<void>
  updateSelectedProject: (projectId: string) => Promise<void>
  updateSelectedSection: (sectionId: string) => Promise<void>
  addLabelToSelected: (labelId: string) => Promise<void>
  removeLabelFromSelected: (labelId: string) => Promise<void>
  duplicateSelected: () => Promise<string[]>
  getSelectedCount: () => number
}

export const useBulkActionStore = create<BulkActionState>((set, get) => ({
  selectedIds: new Set(),
  isSelectMode: false,

  toggleSelect: (id: string) => {
    const { selectedIds } = get()
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    set({ selectedIds: newSelection })
  },

  selectMultiple: (ids: string[]) => {
    set({ selectedIds: new Set(ids) })
  },

  clearSelection: () => {
    set({ selectedIds: new Set(), isSelectMode: false })
  },

  enterSelectMode: () => {
    set({ isSelectMode: true })
  },

  exitSelectMode: () => {
    set({ isSelectMode: false, selectedIds: new Set() })
  },

  deleteSelected: async () => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      await taskStore.deleteTask(id)
    }

    get().clearSelection()
  },

  completeSelected: async () => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      const task = taskStore.tasks.find((t) => t.id === id)
      if (task && !task.completed) {
        await taskStore.toggleTask(id)
      }
    }

    get().clearSelection()
  },

  updateSelectedPriority: async (priority: 'p1' | 'p2' | 'p3' | 'p4' | null) => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      await taskStore.updateTask(id, { priority })
    }
  },

  updateSelectedProject: async (projectId: string) => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      await taskStore.updateTask(id, { projectId })
    }
  },

  updateSelectedSection: async (sectionId: string) => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      await taskStore.updateTask(id, { sectionId })
    }
  },

  addLabelToSelected: async (labelId: string) => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      const task = taskStore.tasks.find((t) => t.id === id)
      if (task) {
        const currentLabels = task.labels || []
        if (!currentLabels.includes(labelId)) {
          await taskStore.updateTask(id, { labels: [...currentLabels, labelId] })
        }
      }
    }
  },

  removeLabelFromSelected: async (labelId: string) => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()

    for (const id of selectedIds) {
      const task = taskStore.tasks.find((t) => t.id === id)
      if (task) {
        const currentLabels = task.labels || []
        await taskStore.updateTask(id, { labels: currentLabels.filter((l) => l !== labelId) })
      }
    }
  },

  duplicateSelected: async () => {
    const { selectedIds } = get()
    const taskStore = useTaskStore.getState()
    const newIds: string[] = []

    for (const id of selectedIds) {
      const task = taskStore.tasks.find((t) => t.id === id)
      if (task) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, createdAt, updatedAt, completedAt, ...rest } = task
        const newId = await taskStore.createTask({
          ...rest,
          content: `${task.content} (copy)`,
          completed: false,
          createdBy: task.createdBy || 'unknown',
        })
        newIds.push(newId)
      }
    }

    return newIds
  },

  getSelectedCount: () => {
    return get().selectedIds.size
  },
}))
