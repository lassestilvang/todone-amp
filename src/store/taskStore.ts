import { create } from 'zustand'
import { db } from '@/db/database'
import type { Task } from '@/types'

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  filter: {
    projectId?: string
    sectionId?: string
    completed?: boolean
    search?: string
  }
  // Actions
  loadTasks: () => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  selectTask: (id: string | null) => void
  setFilter: (filter: TaskState['filter']) => void
  getFilteredTasks: () => Task[]
  reorderTasks: (fromId: string, toId: string) => Promise<void>
  updateTaskOrder: (id: string, newOrder: number) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  filter: {},

  loadTasks: async () => {
    const tasks = await db.tasks.toArray()
    set({ tasks })
  },

  createTask: async (taskData) => {
    const id = `task-${Date.now()}`
    const now = new Date()
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: now,
      updatedAt: now,
      completed: false,
      reminders: [],
      labels: [],
      attachments: [],
    }
    await db.tasks.add(newTask)
    const { tasks } = get()
    set({ tasks: [...tasks, newTask] })
    return id
  },

  updateTask: async (id, updates) => {
    const now = new Date()
    await db.tasks.update(id, {
      ...updates,
      updatedAt: now,
    })
    const { tasks } = get()
    set({
      tasks: tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t)),
    })
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id)
    const { tasks } = get()
    set({ tasks: tasks.filter((t) => t.id !== id) })
  },

  toggleTask: async (id) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const completed = !task.completed
    const completedAt = completed ? new Date() : undefined

    await db.tasks.update(id, { completed, completedAt })
    set({
      tasks: tasks.map((t) =>
        t.id === id ? { ...t, completed, completedAt } : t
      ),
    })
  },

  selectTask: (id) => {
    set({ selectedTaskId: id })
  },

  setFilter: (filter) => {
    set({ filter })
  },

  getFilteredTasks: () => {
    const { tasks, filter } = get()
    return tasks.filter((task) => {
      if (filter.projectId && task.projectId !== filter.projectId) return false
      if (filter.sectionId && task.sectionId !== filter.sectionId) return false
      if (filter.completed !== undefined && task.completed !== filter.completed) return false
      if (filter.search && !task.content.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }
      return true
    })
  },

  reorderTasks: async (fromId: string, toId: string) => {
    const { tasks } = get()
    const fromTask = tasks.find((t) => t.id === fromId)
    const toTask = tasks.find((t) => t.id === toId)

    if (!fromTask || !toTask) return

    // Get tasks in the same scope (same project/section)
    const scopeTasks = tasks.filter(
      (t) => t.projectId === fromTask.projectId && t.sectionId === fromTask.sectionId
    )

    // Find indices
    const fromIndex = scopeTasks.findIndex((t) => t.id === fromId)
    const toIndex = scopeTasks.findIndex((t) => t.id === toId)

    if (fromIndex === -1 || toIndex === -1) return

    // Create a copy and reorder
    const reordered = [...scopeTasks]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)

    // Update orders
    const now = new Date()
    const updatedTasks = reordered.map((task, index) => ({
      ...task,
      order: index,
      updatedAt: now,
    }))

    // Update database
    for (const task of updatedTasks) {
      await db.tasks.update(task.id, { order: task.order, updatedAt: now })
    }

    // Update state
    const newTasks = tasks.map((task) => {
      const updated = updatedTasks.find((t) => t.id === task.id)
      return updated ? { ...task, order: updated.order, updatedAt: now } : task
    })
    set({ tasks: newTasks })
  },

  updateTaskOrder: async (id: string, newOrder: number) => {
    const now = new Date()
    await db.tasks.update(id, { order: newOrder, updatedAt: now })
    const { tasks } = get()
    set({
      tasks: tasks.map((t) =>
        t.id === id ? { ...t, order: newOrder, updatedAt: now } : t
      ),
    })
  },
}))
