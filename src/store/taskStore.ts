import { create } from 'zustand'
import { db } from '@/db/database'
import type { Task, RecurrencePattern } from '@/types'
import { getNextOccurrence, validateRecurrencePattern } from '@/utils/recurrence'

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  expandedTaskIds: Set<string>
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
  deleteTaskAndSubtasks: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  selectTask: (id: string | null) => void
  setFilter: (filter: TaskState['filter']) => void
  getFilteredTasks: () => Task[]
  reorderTasks: (fromId: string, toId: string) => Promise<void>
  updateTaskOrder: (id: string, newOrder: number) => Promise<void>
  getSubtasks: (parentId: string) => Task[]
  getParentTask: (id: string) => Task | undefined
  getTaskHierarchy: (taskId: string) => Task[]
  toggleTaskExpanded: (taskId: string) => void
  expandTask: (taskId: string) => void
  collapseTask: (taskId: string) => void
  promoteSubtask: (taskId: string) => Promise<void>
  indentTask: (taskId: string, parentId: string) => Promise<void>
  // Recurrence actions
  addRecurrence: (taskId: string, pattern: RecurrencePattern) => Promise<void>
  removeRecurrence: (taskId: string) => Promise<void>
  toggleRecurringTask: (taskId: string) => Promise<void>
  completeRecurringTask: (taskId: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  expandedTaskIds: new Set(),
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

  getSubtasks: (parentId: string) => {
    const { tasks } = get()
    return tasks.filter((t) => t.parentTaskId === parentId).sort((a, b) => a.order - b.order)
  },

  getParentTask: (id: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === id)
    if (!task || !task.parentTaskId) return undefined
    return tasks.find((t) => t.id === task.parentTaskId)
  },

  getTaskHierarchy: (taskId: string) => {
    const { tasks } = get()
    const hierarchy: Task[] = []
    let current = tasks.find((t) => t.id === taskId)

    while (current) {
      hierarchy.unshift(current)
      if (current.parentTaskId) {
        current = tasks.find((t) => t.id === current!.parentTaskId)
      } else {
        break
      }
    }

    return hierarchy
  },

  toggleTaskExpanded: (taskId: string) => {
    const { expandedTaskIds } = get()
    const newExpanded = new Set(expandedTaskIds)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    set({ expandedTaskIds: newExpanded })
  },

  expandTask: (taskId: string) => {
    const { expandedTaskIds } = get()
    const newExpanded = new Set(expandedTaskIds)
    newExpanded.add(taskId)
    set({ expandedTaskIds: newExpanded })
  },

  collapseTask: (taskId: string) => {
    const { expandedTaskIds } = get()
    const newExpanded = new Set(expandedTaskIds)
    newExpanded.delete(taskId)
    set({ expandedTaskIds: newExpanded })
  },

  deleteTaskAndSubtasks: async (id: string) => {
    const { tasks, getSubtasks } = get()
    const subtasks = getSubtasks(id)
    const allToDelete = [id, ...subtasks.flatMap((st) => [st.id, ...getSubtasks(st.id).map((s) => s.id)])]

    for (const taskId of allToDelete) {
      await db.tasks.delete(taskId)
    }

    set({ tasks: tasks.filter((t) => !allToDelete.includes(t.id)) })
  },

  promoteSubtask: async (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.parentTaskId) return

    const now = new Date()
    await db.tasks.update(taskId, { parentTaskId: undefined, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, parentTaskId: undefined, updatedAt: now } : t
      ),
    })
  },

  indentTask: async (taskId: string, parentId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const now = new Date()
    await db.tasks.update(taskId, { parentTaskId: parentId, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, parentTaskId: parentId, updatedAt: now } : t
      ),
    })
  },

  // Recurrence methods
  addRecurrence: async (taskId: string, pattern: RecurrencePattern) => {
    if (!validateRecurrencePattern(pattern)) return

    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const now = new Date()
    await db.tasks.update(taskId, { recurrence: pattern, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, recurrence: pattern, updatedAt: now } : t
      ),
    })
  },

  removeRecurrence: async (taskId: string) => {
    const { tasks } = get()
    const now = new Date()
    await db.tasks.update(taskId, { recurrence: undefined, updatedAt: now })
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, recurrence: undefined, updatedAt: now } : t
      ),
    })
  },

  toggleRecurringTask: async (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.recurrence) return

    // For toggling a recurring task instance, just toggle like normal
    // The "complete recurring task" is handled by completeRecurringTask
    await useTaskStore.getState().toggleTask(taskId)
  },

  completeRecurringTask: async (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.recurrence) return

    const now = new Date()

    // Calculate next occurrence
    const nextOccurrence = getNextOccurrence(task.dueDate || new Date(), task.recurrence)

    if (nextOccurrence) {
      // Create a new task instance for the next occurrence
      const newTaskId = `task-${Date.now()}`
      const nextTask: Task = {
        ...task,
        id: newTaskId,
        dueDate: nextOccurrence,
        completed: false,
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      }

      // Add new task
      await db.tasks.add(nextTask)

      // Mark current as completed
      await db.tasks.update(taskId, { completed: true, completedAt: now, updatedAt: now })

      // Update state
      set({
        tasks: tasks
          .map((t) => (t.id === taskId ? { ...t, completed: true, completedAt: now } : t))
          .concat(nextTask),
      })
    } else {
      // No more occurrences, just complete
      await useTaskStore.getState().toggleTask(taskId)
    }
  },
}))
